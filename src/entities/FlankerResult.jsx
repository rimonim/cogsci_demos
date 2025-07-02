// FlankerResult entity - handles data storage via API
export class FlankerResult {
  static async create(data, shareData = false) {
    try {
      // Always store locally as backup/for individual results
      const results = JSON.parse(localStorage.getItem('flankerResults') || '[]');
      results.push({
        ...data,
        id: Date.now(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('flankerResults', JSON.stringify(results));

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
          console.log('Data saved to cloud storage successfully');
          return { success: true, data, shared: true };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        console.log('Data kept private (not shared with class)');
        return { success: true, data, shared: false };
      }
    } catch (error) {
      console.warn('Failed to save to API, storing locally:', error.message);
      return { success: true, data, fallback: true };
    }
  }
  
  static async findAll() {
    const results = JSON.parse(localStorage.getItem('flankerResults') || '[]');
    return results;
  }

  static async list() {
    try {
      // Fetch from API first
      const response = await fetch('/api/record', {
        method: 'GET',
      });
      
      if (response.ok) {
        const csvText = await response.text();
        if (!csvText.trim() || csvText.trim() === 'student_name,student_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp') {
          return [];
        }
        
        // Parse CSV to JSON
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const results = lines.slice(1).map(line => {
          // Simple CSV parsing - this assumes no commas in quoted fields
          const values = [];
          let currentValue = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim()); // Add the last value
          
          const result = {};
          headers.forEach((header, index) => {
            let value = values[index] || '';
            // Remove quotes
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1);
            }
            
            // Convert data types
            if (header === 'trial_number' || header === 'reaction_time_ms') {
              result[header.replace('_ms', '')] = parseInt(value) || 0;
            } else if (header === 'is_correct') {
              result[header] = value === 'true';
            } else {
              result[header] = value;
            }
          });
          
          // Add created_date as alias for timestamp
          if (result.timestamp) {
            result.created_date = result.timestamp;
          }
          
          return result;
        });
        
        return results;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to fetch from API, using local storage:', error.message);
      // Fallback to localStorage
      const results = JSON.parse(localStorage.getItem('flankerResults') || '[]');
      return results;
    }
  }
  
  static async clear() {
    localStorage.removeItem('flankerResults');
    return { success: true };
  }
}
