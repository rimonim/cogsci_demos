// PosnerResult entity - handles data storage via API
import { SessionContext } from '../utils/sessionContext';

export class PosnerResult {
  static async create(data) {
    try {
      // Enrich data with session information
      const enrichedData = SessionContext.enrichResultData(data);
      
      // Try to send to the API first
      const response = await fetch('/api/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedData)
      });
      
      if (response.ok) {
        console.log('Data saved to cloud storage successfully');
        // Also store locally as backup
        const results = JSON.parse(localStorage.getItem('posnerResults') || '[]');
        results.push({
          ...enrichedData,
          id: Date.now()
        });
        localStorage.setItem('posnerResults', JSON.stringify(results));
        return { success: true, data: enrichedData };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to save to API, storing locally:', error.message);
      // Fallback to localStorage if API fails
      const enrichedData = SessionContext.enrichResultData(data);
      const results = JSON.parse(localStorage.getItem('posnerResults') || '[]');
      results.push({
        ...enrichedData,
        id: Date.now()
      });
      localStorage.setItem('posnerResults', JSON.stringify(results));
      return { success: true, data: enrichedData, fallback: true };
    }
  }
  
  static async findAll() {
    const results = JSON.parse(localStorage.getItem('posnerResults') || '[]');
    return results;
  }
  
  static formatForDownload(results) {
    return results.map(result => ({
      student_name: result.name,
      student_id: result.id,
      trial_number: result.trial_number || result.trialNumber,
      cue_type: result.cueType,
      cue_validity: result.cueValidity,
      target_location: result.targetLocation,
      soa: result.soa,
      target_present: result.targetPresent,
      correct_response: result.correctResponse,
      participant_response: result.response,
      reaction_time: result.reaction_time || result.reactionTime,
      is_correct: result.correct || result.is_correct,
      session_start_time: result.sessionStartTime || result.session_start_time
    }));
  }
}
