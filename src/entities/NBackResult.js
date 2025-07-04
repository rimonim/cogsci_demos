// NBackResult entity - handles data storage via API
import { SessionContext } from '../utils/sessionContext';

export class NBackResult {
  static async create(data, shareData = false) {
    try {
      // Enrich data with session information
      const enrichedData = SessionContext.enrichResultData(data);
      
      // Always store locally for individual results
      const existingResults = JSON.parse(localStorage.getItem('nBackResults') || '[]');
      const localData = {
        ...enrichedData,
        id: Date.now()
      };
      existingResults.push(localData);
      localStorage.setItem('nBackResults', JSON.stringify(existingResults));

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
          console.log('N-Back data shared with class successfully');
          return { success: true, data: enrichedData, shared: true };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        console.log('N-Back data kept private (not shared with class)');
        return { success: true, data: enrichedData, shared: false };
      }
    } catch (error) {
      console.warn('Failed to save to API, data stored locally:', error.message);
      // Data is already stored locally above
      return { success: false, error: error.message, data };
    }
  }

  static getLocal() {
    return JSON.parse(localStorage.getItem('nBackResults') || '[]');
  }

  static clearLocal() {
    localStorage.removeItem('nBackResults');
    return { success: true, message: 'Local N-Back results cleared' };
  }
}
