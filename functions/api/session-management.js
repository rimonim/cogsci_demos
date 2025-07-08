// Cloudflare Pages Functions API handler for advanced session management
// POST /api/session-management - Bulk operations, cleanup, monitoring
import { getLocalEnv } from './local-dev.js';
import { verifyInstructorAuth } from './auth.js';

// Helper to get the appropriate environment (real or mock)
const getEnv = (env) => {
  if (!env || !env.RT_DB) {
    console.log("Using local development mock storage");
    return getLocalEnv();
  }
  return env;
};

// Cloudflare KV limits for monitoring
const KV_LIMITS = {
  DAILY_READS: 100000,
  DAILY_WRITES: 1000,
  WRITES_PER_SECOND: 1,
  OPERATIONS_PER_INVOCATION: 1000,
  STORAGE_PER_NAMESPACE: 1024 * 1024 * 1024, // 1 GB
  VALUE_SIZE_LIMIT: 25 * 1024 * 1024, // 25 MiB
  KEY_SIZE_LIMIT: 512 // bytes
};

export async function onRequestPost({ request, env }) {
  try {
    // Verify instructor authentication for management operations
    const authResult = verifyInstructorAuth(request, env);
    if (!authResult.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: authResult.error,
        requiresAuth: true
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const environment = getEnv(env);
    const { action, options = {} } = await request.json();

    switch (action) {
      case 'cleanup-expired':
        return await cleanupExpiredSessions(environment, options);
      case 'bulk-delete':
        return await bulkDeleteSessions(environment, options);
      case 'storage-quota':
        return await getStorageQuota(environment, options);
      case 'health-check':
        return await performHealthCheck(environment, options);
      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
  } catch (error) {
    console.error('Session management error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Cleanup expired sessions
async function cleanupExpiredSessions(environment, options = {}) {
  const { dryRun = false, maxAge = 48 } = options; // Default: cleanup sessions older than 48 hours
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - (maxAge * 60 * 60 * 1000));
  
  let cleanupStats = {
    sessionsChecked: 0,
    sessionsExpired: 0,
    sessionsDeleted: 0,
    studentsDeleted: 0,
    errors: [],
    operationCount: 0
  };

  try {
    // Get all session metadata
    const sessionMetaKeys = await environment.RT_DB.list({ prefix: 'session_meta_' });
    cleanupStats.operationCount += 1;
    
    const expiredSessions = [];
    
    // Check each session for expiration
    for (const metaKey of sessionMetaKeys.keys) {
      cleanupStats.sessionsChecked++;
      cleanupStats.operationCount += 1;
      
      try {
        const sessionMeta = await environment.RT_DB.get(metaKey.name);
        if (!sessionMeta) continue;
        
        const sessionData = JSON.parse(sessionMeta);
        const expiresAt = new Date(sessionData.expiresAt);
        const createdAt = new Date(sessionData.createdAt);
        
        // Check if session is expired (either past expiry date or older than maxAge)
        if (expiresAt < now || createdAt < cutoffTime) {
          expiredSessions.push({
            sessionId: sessionData.sessionId,
            metaKey: metaKey.name,
            createdAt: sessionData.createdAt,
            expiresAt: sessionData.expiresAt
          });
          cleanupStats.sessionsExpired++;
        }
      } catch (error) {
        cleanupStats.errors.push(`Error processing session ${metaKey.name}: ${error.message}`);
      }
    }

    // Delete expired sessions and their data
    if (!dryRun && expiredSessions.length > 0) {
      for (const session of expiredSessions) {
        try {
          // Delete session metadata
          await environment.RT_DB.delete(session.metaKey);
          cleanupStats.operationCount += 1;
          
          // Delete all student data for this session
          const studentKeys = await environment.RT_DB.list({ 
            prefix: `session_${session.sessionId}_student_` 
          });
          cleanupStats.operationCount += 1;
          
          for (const studentKey of studentKeys.keys) {
            await environment.RT_DB.delete(studentKey.name);
            cleanupStats.studentsDeleted++;
            cleanupStats.operationCount += 1;
          }
          
          // Also clean up any legacy per-trial data
          const legacyKeys = await environment.RT_DB.list({ 
            prefix: `session_${session.sessionId}_result_` 
          });
          cleanupStats.operationCount += 1;
          
          for (const legacyKey of legacyKeys.keys) {
            await environment.RT_DB.delete(legacyKey.name);
            cleanupStats.operationCount += 1;
          }
          
          cleanupStats.sessionsDeleted++;
        } catch (error) {
          cleanupStats.errors.push(`Error deleting session ${session.sessionId}: ${error.message}`);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      action: 'cleanup-expired',
      dryRun,
      stats: cleanupStats,
      expiredSessions: dryRun ? expiredSessions : []
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    cleanupStats.errors.push(`Cleanup operation failed: ${error.message}`);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stats: cleanupStats
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Bulk delete sessions
async function bulkDeleteSessions(environment, options = {}) {
  const { sessionIds = [], confirmKey } = options;
  
  if (!confirmKey || confirmKey !== 'CONFIRM_BULK_DELETE') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Bulk delete requires confirmation key' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let deleteStats = {
    sessionsRequested: sessionIds.length,
    sessionsDeleted: 0,
    studentsDeleted: 0,
    errors: [],
    operationCount: 0
  };

  for (const sessionId of sessionIds) {
    try {
      // Delete session metadata
      await environment.RT_DB.delete(`session_meta_${sessionId}`);
      deleteStats.operationCount += 1;
      
      // Delete all student data for this session
      const studentKeys = await environment.RT_DB.list({ 
        prefix: `session_${sessionId}_student_` 
      });
      deleteStats.operationCount += 1;
      
      for (const studentKey of studentKeys.keys) {
        await environment.RT_DB.delete(studentKey.name);
        deleteStats.studentsDeleted++;
        deleteStats.operationCount += 1;
      }
      
      // Also clean up any legacy per-trial data
      const legacyKeys = await environment.RT_DB.list({ 
        prefix: `session_${sessionId}_result_` 
      });
      deleteStats.operationCount += 1;
      
      for (const legacyKey of legacyKeys.keys) {
        await environment.RT_DB.delete(legacyKey.name);
        deleteStats.operationCount += 1;
      }
      
      deleteStats.sessionsDeleted++;
    } catch (error) {
      deleteStats.errors.push(`Error deleting session ${sessionId}: ${error.message}`);
    }
  }

  return new Response(JSON.stringify({ 
    success: true, 
    action: 'bulk-delete',
    stats: deleteStats
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

// Get storage quota and usage information
async function getStorageQuota(environment, options = {}) {
  const { detailed = false } = options;
  
  let quotaInfo = {
    estimated_usage: {
      total_keys: 0,
      session_count: 0,
      student_count: 0,
      legacy_trial_count: 0,
      estimated_storage_bytes: 0
    },
    limits: KV_LIMITS,
    health_status: 'unknown',
    recommendations: [],
    operationCount: 0
  };

  try {
    // Count session metadata
    const sessionKeys = await environment.RT_DB.list({ prefix: 'session_meta_' });
    quotaInfo.operationCount += 1;
    quotaInfo.estimated_usage.session_count = sessionKeys.keys.length;

    // Count student records
    const studentKeys = await environment.RT_DB.list({ prefix: 'session_' });
    quotaInfo.operationCount += 1;
    
    let studentCount = 0;
    let legacyTrialCount = 0;
    let totalStorageBytes = 0;

    // Sample some keys to estimate storage usage
    const sampleSize = Math.min(10, studentKeys.keys.length);
    let sampleStorageBytes = 0;
    let sampledKeys = 0;

    for (const key of studentKeys.keys) {
      if (key.name.includes('_student_')) {
        studentCount++;
        
        // Sample storage for estimation
        if (detailed && sampledKeys < sampleSize) {
          try {
            const value = await environment.RT_DB.get(key.name);
            if (value) {
              sampleStorageBytes += new Blob([value]).size;
              sampledKeys++;
              quotaInfo.operationCount += 1;
            }
          } catch (error) {
            // Continue on error for sampling
          }
        }
      } else if (key.name.includes('_result_')) {
        legacyTrialCount++;
      }
    }

    quotaInfo.estimated_usage.student_count = studentCount;
    quotaInfo.estimated_usage.legacy_trial_count = legacyTrialCount;
    quotaInfo.estimated_usage.total_keys = sessionKeys.keys.length + studentKeys.keys.length;

    // Estimate total storage based on sample
    if (sampledKeys > 0) {
      const avgStudentSize = sampleStorageBytes / sampledKeys;
      totalStorageBytes = (avgStudentSize * studentCount) + 
                         (sessionKeys.keys.length * 500); // Assume 500 bytes per session metadata
    } else {
      // Rough estimate: 10KB per student, 500 bytes per session
      totalStorageBytes = (studentCount * 10240) + (sessionKeys.keys.length * 500);
    }

    quotaInfo.estimated_usage.estimated_storage_bytes = totalStorageBytes;

    // Health assessment
    const storagePercent = (totalStorageBytes / KV_LIMITS.STORAGE_PER_NAMESPACE) * 100;
    const keyPercent = (quotaInfo.estimated_usage.total_keys / 100000) * 100; // Rough key limit estimate

    if (storagePercent > 80 || keyPercent > 80) {
      quotaInfo.health_status = 'critical';
      quotaInfo.recommendations.push('Storage usage is high - consider cleanup');
    } else if (storagePercent > 60 || keyPercent > 60) {
      quotaInfo.health_status = 'warning';
      quotaInfo.recommendations.push('Monitor storage usage closely');
    } else {
      quotaInfo.health_status = 'healthy';
    }

    // Recommendations
    if (legacyTrialCount > 0) {
      quotaInfo.recommendations.push(`Consider migrating ${legacyTrialCount} legacy trial records to student-level storage`);
    }

    if (quotaInfo.estimated_usage.session_count > 50) {
      quotaInfo.recommendations.push('Consider running expired session cleanup');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      action: 'storage-quota',
      quota: quotaInfo
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      partial_quota: quotaInfo
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Health check for system status
async function performHealthCheck(environment, options = {}) {
  const healthInfo = {
    storage_accessible: false,
    sample_operations_working: false,
    estimated_response_time: null,
    operationCount: 0,
    errors: []
  };

  const startTime = Date.now();

  try {
    // Test basic KV operations
    const testKey = `health_check_${Date.now()}`;
    const testValue = JSON.stringify({ test: true, timestamp: new Date().toISOString() });

    // Test write
    await environment.RT_DB.put(testKey, testValue);
    healthInfo.operationCount += 1;
    
    // Test read
    const retrieved = await environment.RT_DB.get(testKey);
    healthInfo.operationCount += 1;
    
    // Test delete
    await environment.RT_DB.delete(testKey);
    healthInfo.operationCount += 1;

    if (retrieved === testValue) {
      healthInfo.sample_operations_working = true;
      healthInfo.storage_accessible = true;
    }

    healthInfo.estimated_response_time = Date.now() - startTime;

    return new Response(JSON.stringify({ 
      success: true, 
      action: 'health-check',
      health: healthInfo
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    healthInfo.errors.push(error.message);
    healthInfo.estimated_response_time = Date.now() - startTime;
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      health: healthInfo
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
