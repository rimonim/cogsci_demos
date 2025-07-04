// Mock storage for local development
const mockKV = {
  data: new Map(),
  
  async get(key) {
    // Return data exactly as stored - return the raw string value
    const value = this.data.get(key);
    if (DEBUG) {
      console.log(`[MockKV] Direct GET for ${key} returned:`, value);
    }
    return value;
  },
  
  async put(key, value) {
    // Always store value as string, exactly like Cloudflare KV
    // Only stringify if it's not already a string
    if (typeof value !== 'string') {
      try {
        const stringValue = JSON.stringify(value);
        this.data.set(key, stringValue);
        if (DEBUG) {
          console.log(`[MockKV] PUT ${key} (object converted to string):`, stringValue);
        }
      } catch (error) {
        console.error(`[MockKV] Error stringifying value for ${key}:`, error);
        throw error;
      }
    } else {
      this.data.set(key, value);
      if (DEBUG) {
        console.log(`[MockKV] PUT ${key} (string):`, value);
      }
    }
    return true;
  },
  
  async delete(key) {
    this.data.delete(key);
    return true;
  },
  
  async list({ prefix }) {
    const keys = [];
    for (const key of this.data.keys()) {
      if (key.startsWith(prefix)) {
        keys.push({ name: key });
      }
    }
    return { keys };
  }
};

// Debug flag - set to true to enable debug logs
const DEBUG = true;

// Mock data for debugging - ensures we always have at least one valid session
const SAMPLE_SESSION = {
  sessionId: 'DEMO01',
  instructorName: 'Demo Instructor',
  demoType: 'flanker',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  participantCount: 0
};

// Export the mock KV for use in local development
export const getLocalEnv = () => {
  if (DEBUG) {
    console.log('Initializing local development environment with mock KV storage');
  }
  
  // Add sample session if it doesn't exist yet
  if (!mockKV.data.has('session_meta_DEMO01')) {
    console.log('Adding sample session for easier testing');
    try {
      const sampleSessionJson = JSON.stringify(SAMPLE_SESSION);
      console.log('Sample session JSON:', sampleSessionJson);
      mockKV.put('session_meta_DEMO01', sampleSessionJson);
      
      // Verify storage immediately
      setTimeout(() => {
        const storedValue = mockKV.data.get('session_meta_DEMO01');
        console.log('[MockKV] Verification - Sample session stored as:', storedValue);
        
        try {
          // Test if we can parse it back
          const parsed = JSON.parse(storedValue);
          console.log('[MockKV] Verification - Sample session parses correctly:', parsed);
        } catch (error) {
          console.error('[MockKV] ERROR - Sample session does not parse as valid JSON:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to add sample session:', error);
    }
  }
  
  return {
    RT_DB: {
      ...mockKV,
      async get(key) {
        const value = await mockKV.get(key);
        if (DEBUG) {
          console.log(`[MockKV] GET ${key}:`, value);
          if (!value) {
            console.log('[MockKV] Available keys:', Array.from(mockKV.data.keys()));
          }
        }
        return value;
      },
      
      async put(key, value) {
        if (DEBUG) {
          console.log(`[MockKV] PUT ${key}:`, value);
        }
        
        try {
          const result = await mockKV.put(key, value);
          console.log(`[MockKV] Successfully stored ${key}, value type: ${typeof value}`);
          
          // Verify storage immediately
          const storedValue = mockKV.data.get(key);
          console.log(`[MockKV] Verification - ${key} stored as:`, storedValue);
          
          return result;
        } catch (error) {
          console.error(`[MockKV] Error storing ${key}:`, error);
          throw error;
        }
      },
      
      async delete(key) {
        if (DEBUG) {
          console.log(`[MockKV] DELETE ${key}`);
        }
        return mockKV.delete(key);
      },
      
      async list(options) {
        const result = await mockKV.list(options);
        if (DEBUG) {
          console.log(`[MockKV] LIST ${options.prefix}:`, result);
        }
        return result;
      }
    }
  };
};
