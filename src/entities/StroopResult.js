// StroopResult entity - handles data storage via API
export class StroopResult {
  static async create(data, shareData = false) {
    try {
      // Always store locally for individual results
      const existingResults = JSON.parse(localStorage.getItem('stroopResults') || '[]');
      const localData = {
        ...data,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      existingResults.push(localData);
      localStorage.setItem('stroopResults', JSON.stringify(existingResults));

      // Only send to API if user has opted to share
      if (shareData) {
        const response = await fetch('/api/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          console.log('Stroop data shared with class successfully');
          return { success: true, data, shared: true };
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
