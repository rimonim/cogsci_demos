// VisualSearchResult entity - handles data storage via API
export class VisualSearchResult {
  static async create(data, shareData = false) {
    try {
      // Always store locally for individual results
      const existingResults = JSON.parse(localStorage.getItem('visualSearchResults') || '[]');
      const localData = {
        ...data,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      existingResults.push(localData);
      localStorage.setItem('visualSearchResults', JSON.stringify(existingResults));

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
          console.log('Visual Search data shared with class successfully');
          return { success: true, data, shared: true };
        } else {
          // In development mode, this endpoint might not exist, which is expected
          console.info(`API response: ${response.status} - This is expected in development mode`);
          return { success: true, data, shared: false };
        }
      } else {
        console.log('Visual Search data kept private (not shared with class)');
        return { success: true, data, shared: false };
      }
    } catch (error) {
      // In development, this may fail but we don't need to show errors
      console.info('API not available in development mode:', error.message);
      // Data is already stored locally above
      return { success: false, error: error.message, data };
    }
  }

  static getLocal() {
    return JSON.parse(localStorage.getItem('visualSearchResults') || '[]');
  }

  static clearLocal() {
    localStorage.removeItem('visualSearchResults');
    return { success: true, message: 'Local Visual Search results cleared' };
  }
}
