// StroopResult entity - handles data storage via API
import { SessionContext } from '../utils/sessionContext';

export class StroopResult {
  static async create(data, shareData = false) {
    try {
      // Enrich data with session information
      const enrichedData = SessionContext.enrichResultData(data);
      
      // Always store locally for individual results
      const existingResults = JSON.parse(localStorage.getItem('stroopResults') || '[]');
      const localData = {
        ...enrichedData,
        id: Date.now()
      };
      existingResults.push(localData);
      localStorage.setItem('stroopResults', JSON.stringify(existingResults));

      // Send to API if in session or user has opted to share
      const inSession = SessionContext.isInSession();
      const shouldShare = inSession || shareData;
      
      if (shouldShare) {
        const response = await fetch('/api/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enrichedData)
        });
        
        if (response.ok) {
          console.log('Stroop data shared with class successfully');
          return { success: true, data: enrichedData, shared: true };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        console.log('Stroop data kept private (not shared with class)');
        return { success: true, data, shared: false };
      }
    } catch (error) {
      console.warn('Failed to save to API, data stored locally:', error.message);
      // Data is already stored locally above
      return { success: false, error: error.message, data };
    }
  }

  static getLocal() {
    return JSON.parse(localStorage.getItem('stroopResults') || '[]');
  }

  static clearLocal() {
    localStorage.removeItem('stroopResults');
    return { success: true, message: 'Local Stroop results cleared' };
  }
}
