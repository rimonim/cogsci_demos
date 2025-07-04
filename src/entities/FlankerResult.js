// FlankerResult entity - handles data storage via API
import { SessionContext } from '../utils/sessionContext';

export class FlankerResult {
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
        const results = JSON.parse(localStorage.getItem('flankerResults') || '[]');
        results.push({
          ...enrichedData,
          id: Date.now()
        });
        localStorage.setItem('flankerResults', JSON.stringify(results));
        return { success: true, data: enrichedData };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to save to API, storing locally:', error.message);
      // Fallback to localStorage if API fails
      const enrichedData = SessionContext.enrichResultData(data);
      const results = JSON.parse(localStorage.getItem('flankerResults') || '[]');
      results.push({
        ...enrichedData,
        id: Date.now()
      });
      localStorage.setItem('flankerResults', JSON.stringify(results));
      return { success: true, data: enrichedData, fallback: true };
    }
  }
  
  static async findAll() {
    const results = JSON.parse(localStorage.getItem('flankerResults') || '[]');
    return results;
  }
  
  static async clear() {
    localStorage.removeItem('flankerResults');
    return { success: true };
  }
}
