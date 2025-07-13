import { kvQuotaManager } from '../utils/kvQuotaManager';

export class ChangeDetectionResult {
  constructor({
    student_name,
    student_id,
    trial_number,
    set_size,
    participant_response,
    correct_response,
    reaction_time,
    is_correct,
    session_start_time,
    session_id = null,
    task_type = 'change_detection'
  }) {
    // Store all properties
    Object.assign(this, {
      student_name,
      student_id,
      trial_number,
      set_size,
      participant_response,
      correct_response,
      reaction_time,
      is_correct,
      session_start_time,
      session_id,
      task_type,
      timestamp: new Date().toISOString()
    });
  }

  static async create(data) {
    const result = new ChangeDetectionResult(data);
    
    try {
      if (kvQuotaManager.shouldSkipWrite()) {
        console.log('[CHANGE_DETECTION] Skipping KV write due to quota management');
        return result;
      }

      const key = `change_detection_${result.student_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: JSON.stringify(result) })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      kvQuotaManager.recordWrite();
      console.log('[CHANGE_DETECTION] Result saved successfully');
      return result;
    } catch (error) {
      console.error('[CHANGE_DETECTION] Error saving result:', error);
      kvQuotaManager.recordError();
      return result;
    }
  }

  static async list() {
    try {
      const response = await fetch('/api/record?prefix=change_detection_');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results?.map(item => {
        try {
          return JSON.parse(item.value);
        } catch (e) {
          console.error('Error parsing change detection result:', e);
          return null;
        }
      }).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching change detection results:', error);
      return [];
    }
  }

  // Calculate Cowan's K for working memory capacity
  static calculateCowansK(results, setSize) {
    const setSizeTrials = results.filter(r => r.set_size === setSize && r.is_correct !== undefined);
    if (setSizeTrials.length === 0) return 0;
    
    const accuracy = setSizeTrials.filter(r => r.is_correct).length / setSizeTrials.length;
    return setSize * (2 * accuracy - 1);
  }

  // Calculate overall working memory capacity (average across set sizes)
  static calculateWorkingMemoryCapacity(results) {
    const k4 = ChangeDetectionResult.calculateCowansK(results, 4);
    const k8 = ChangeDetectionResult.calculateCowansK(results, 8);
    return (k4 + k8) / 2;
  }
}
