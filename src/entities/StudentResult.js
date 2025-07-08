// StudentResult entity - handles student-level data aggregation for optimized KV storage
import { SessionContext } from '../utils/sessionContext';
import { KVQuotaManager } from '../utils/kvQuotaManager';

export class StudentResult {
  constructor() {
    this.trials = [];
    this.studentInfo = null;
    this.sessionData = null;
    this.taskType = null;
    this.sessionStartTime = null;
  }

  // Initialize student result collector
  static create(taskType) {
    const instance = new StudentResult();
    instance.taskType = taskType;
    instance.sessionData = SessionContext.getSessionData();
    instance.studentInfo = SessionContext.getStudentInfo();
    instance.sessionStartTime = new Date().toISOString();
    
    return instance;
  }

  // Add a trial to the collection
  addTrial(trialData) {
    const enrichedTrial = {
      trial_number: this.trials.length + 1,
      ...trialData,
      timestamp: new Date().toISOString()
    };
    
    this.trials.push(enrichedTrial);
    
    // Also store locally as backup
    this._updateLocalStorage();
    
    return enrichedTrial;
  }

  // Submit all collected trials as a single student record
  async submit() {
    try {
      if (this.trials.length === 0) {
        throw new Error('No trials to submit');
      }

      const sessionData = SessionContext.getSessionData();
      const studentInfo = SessionContext.getStudentInfo();

      if (!sessionData?.sessionId || !studentInfo?.studentId) {
        throw new Error('Missing session or student information');
      }

      // Check quota status before submitting
      const quotaStatus = await KVQuotaManager.getQuotaStatus();
      if (!quotaStatus.healthy && quotaStatus.warnings.length > 0) {
        console.warn('[StudentResult] Quota warnings detected:', quotaStatus.warnings);
      }

      // Prepare student-level data payload
      const studentData = {
        session_id: sessionData.sessionId,
        student_id: studentInfo.studentId,
        student_data: {
          name: studentInfo.name,
          share_data: studentInfo.shareData !== false,
          task_type: this.taskType,
          session_start_time: this.sessionStartTime,
          trials: this.trials
        }
      };

      console.log(`[StudentResult] Submitting ${this.trials.length} trials for student ${studentInfo.studentId}`);

      // Use quota manager for retry with fallback
      const submitOperation = async (data) => {
        return await fetch('/api/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      };

      const result = await KVQuotaManager.retryWithFallback(submitOperation, studentData);

      if (result.success) {
        const responseData = await result.result.json();
        console.log('[StudentResult] Data saved to cloud storage successfully');
        
        // Clear local storage after successful submission
        this._clearLocalStorage();
        
        return { 
          success: true, 
          data: studentData,
          trials_count: this.trials.length,
          student_key: responseData.student_key
        };
      } else if (result.fallback) {
        // Data was saved to localStorage as fallback
        console.warn('[StudentResult] Data saved to localStorage fallback due to quota limits');
        return { 
          success: false, 
          fallback: true,
          error: result.error,
          trials_count: this.trials.length,
          fallback_key: result.fallbackKey
        };
      } else {
        throw new Error(`Submission failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.warn('[StudentResult] Failed to save to API, keeping in localStorage:', error.message);
      
      // Keep data in localStorage as fallback
      this._updateLocalStorage();
      
      return { 
        success: false, 
        error: error.message,
        fallback: true,
        trials_count: this.trials.length
      };
    }
  }

  // Get current trial count
  getTrialCount() {
    return this.trials.length;
  }

  // Get all trials
  getAllTrials() {
    return [...this.trials];
  }

  // Get last trial
  getLastTrial() {
    return this.trials[this.trials.length - 1] || null;
  }

  // Private method to update localStorage backup
  _updateLocalStorage() {
    if (!this.taskType) return;
    
    const key = `${this.taskType}StudentData`;
    const data = {
      studentInfo: this.studentInfo,
      sessionData: this.sessionData,
      taskType: this.taskType,
      sessionStartTime: this.sessionStartTime,
      trials: this.trials,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Private method to clear localStorage after successful submission
  _clearLocalStorage() {
    if (this.taskType) {
      localStorage.removeItem(`${this.taskType}StudentData`);
    }
  }

  // Static method to restore from localStorage (for recovery)
  static restore(taskType) {
    try {
      const key = `${taskType}StudentData`;
      const stored = localStorage.getItem(key);
      
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      const instance = new StudentResult();
      
      instance.taskType = data.taskType;
      instance.sessionData = data.sessionData;
      instance.studentInfo = data.studentInfo;
      instance.sessionStartTime = data.sessionStartTime;
      instance.trials = data.trials || [];
      
      return instance;
    } catch (error) {
      console.error('[StudentResult] Failed to restore from localStorage:', error);
      return null;
    }
  }

  // Static method to find all stored data (for debugging/recovery)
  static findAll(taskType) {
    try {
      const restored = StudentResult.restore(taskType);
      return restored ? restored.getAllTrials() : [];
    } catch (error) {
      console.error('[StudentResult] Failed to retrieve stored data:', error);
      return [];
    }
  }
}
