// Utility for handling Cloudflare KV storage quota limits and graceful degradation
export class KVQuotaManager {
  static WRITE_LIMIT_EXCEEDED = 'KV_WRITE_LIMIT_EXCEEDED';
  static STORAGE_LIMIT_EXCEEDED = 'KV_STORAGE_LIMIT_EXCEEDED';
  static OPERATION_LIMIT_EXCEEDED = 'KV_OPERATION_LIMIT_EXCEEDED';
  
  static warningThresholds = {
    writeCount: 800, // Warn at 80% of 1000 daily writes
    storagePercent: 80 // Warn at 80% of storage quota
  };

  static async checkQuotaStatus() {
    try {
      const response = await fetch('/api/session-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'storage-quota' })
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          quota: data.quota,
          warnings: this.generateWarnings(data.quota)
        };
      }
      
      return { success: false, error: 'Failed to check quota' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static generateWarnings(quotaInfo) {
    const warnings = [];
    
    if (!quotaInfo || !quotaInfo.estimated_usage) {
      return warnings;
    }

    const usage = quotaInfo.estimated_usage;
    const limits = quotaInfo.limits;
    
    // Check storage usage
    const storagePercent = (usage.estimated_storage_bytes / limits.STORAGE_PER_NAMESPACE) * 100;
    if (storagePercent > this.warningThresholds.storagePercent) {
      warnings.push({
        type: 'storage',
        level: storagePercent > 95 ? 'critical' : 'warning',
        message: `Storage usage at ${storagePercent.toFixed(1)}% of quota`,
        recommendation: 'Consider running expired session cleanup'
      });
    }

    // Check session count (rough estimate for write usage)
    if (usage.session_count > 50) {
      warnings.push({
        type: 'sessions',
        level: usage.session_count > 100 ? 'critical' : 'warning',
        message: `High session count: ${usage.session_count}`,
        recommendation: 'Regular cleanup recommended to maintain performance'
      });
    }

    // Check for legacy records that could be optimized
    if (usage.legacy_trial_count > 0) {
      warnings.push({
        type: 'optimization',
        level: 'info',
        message: `${usage.legacy_trial_count} legacy trial records detected`,
        recommendation: 'These will be migrated automatically during next cleanup'
      });
    }

    return warnings;
  }

  static async handleQuotaExceeded(error, data) {
    console.warn('KV quota may be exceeded:', error);
    
    // Try to store in localStorage as fallback
    const fallbackKey = `quota_fallback_${Date.now()}`;
    const fallbackData = {
      originalError: error.message,
      data: data,
      timestamp: new Date().toISOString(),
      type: 'quota_fallback'
    };
    
    try {
      localStorage.setItem(fallbackKey, JSON.stringify(fallbackData));
      console.log('Data stored in localStorage fallback:', fallbackKey);
      
      // Notify user about degraded mode
      this.showQuotaWarning();
      
      return {
        success: false,
        fallback: true,
        error: 'KV quota exceeded - data saved locally',
        fallbackKey
      };
    } catch (localError) {
      console.error('Even localStorage fallback failed:', localError);
      return {
        success: false,
        fallback: false,
        error: 'Storage quota exceeded and localStorage unavailable'
      };
    }
  }

  static showQuotaWarning() {
    // Check if we've already shown the warning recently
    const lastWarning = localStorage.getItem('kvQuotaWarningShown');
    const now = Date.now();
    
    if (lastWarning && (now - parseInt(lastWarning)) < 5 * 60 * 1000) {
      return; // Don't show again within 5 minutes
    }
    
    localStorage.setItem('kvQuotaWarningShown', now.toString());
    
    // Show user-friendly warning
    if (window.confirm(
      'Storage quota reached. Your data has been saved locally as a backup. ' +
      'The instructor should run session cleanup to free up space. ' +
      'Continue anyway?'
    )) {
      return true;
    } else {
      // User chose not to continue - could redirect or show instructions
      return false;
    }
  }

  static async retryWithFallback(operation, data, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation(data);
        
        // If we get a successful result, return it
        if (result && (result.ok || result.success)) {
          return { success: true, result, attempt };
        }
        
        // Check if the error indicates quota issues
        if (result && result.status >= 500) {
          throw new Error(`HTTP ${result.status}: Possible quota limit`);
        }
        
        return { success: false, result, attempt };
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        // On final attempt or quota-related error, use fallback
        if (attempt === maxRetries || this.isQuotaError(error)) {
          return await this.handleQuotaExceeded(error, data);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  static isQuotaError(error) {
    const quotaIndicators = [
      'quota exceeded',
      'rate limit',
      'too many requests',
      'storage limit',
      'write limit'
    ];
    
    const errorMessage = error.message?.toLowerCase() || '';
    return quotaIndicators.some(indicator => errorMessage.includes(indicator));
  }

  static async getQuotaStatus() {
    try {
      const quotaCheck = await this.checkQuotaStatus();
      
      if (quotaCheck.success) {
        return {
          healthy: quotaCheck.quota.health_status === 'healthy',
          warnings: quotaCheck.warnings,
          quota: quotaCheck.quota
        };
      }
      
      return { healthy: true, warnings: [], quota: null }; // Assume healthy if check fails
    } catch (error) {
      console.warn('Could not check quota status:', error);
      return { healthy: true, warnings: [], quota: null };
    }
  }

  // Recovery functions for when storage is available again
  static async recoverFallbackData() {
    const recoveredItems = [];
    
    // Find all fallback items in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quota_fallback_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          recoveredItems.push({ key, data });
        } catch (error) {
          console.warn(`Failed to parse fallback data ${key}:`, error);
        }
      }
    }

    console.log(`Found ${recoveredItems.length} fallback items to recover`);
    return recoveredItems;
  }

  static async submitRecoveredData(fallbackItems) {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const item of fallbackItems) {
      try {
        // Try to resubmit the data
        const response = await fetch('/api/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data.data)
        });

        if (response.ok) {
          // Remove from localStorage if successful
          localStorage.removeItem(item.key);
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Failed to recover ${item.key}: HTTP ${response.status}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error recovering ${item.key}: ${error.message}`);
      }
    }

    return results;
  }
}
