// Dynamic route for session-specific data access
// GET /api/session/[sessionId] - Get session data
// DELETE /api/session/[sessionId] - Clear session data
import { getLocalEnv } from '../local-dev.js';

// Helper to get the appropriate environment (real or mock)
const getEnv = (env) => {
  // If running locally without Cloudflare env
  if (!env || !env.RT_DB) {
    console.log("Using local development mock storage");
    return getLocalEnv();
  }
  return env;
};

export async function onRequestGet({ params, env, request }) {
  try {
    const environment = getEnv(env);
    const sessionId = params.sessionId;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    
    if (!sessionId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Session ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Get session metadata
    console.log(`Retrieving session with ID: ${sessionId}`);
    console.log(`Looking for key: session_meta_${sessionId}`);
    
    const sessionMeta = await environment.RT_DB.get(`session_meta_${sessionId}`);
    console.log('Retrieved session metadata:', sessionMeta);
    
    if (!sessionMeta) {
      console.error(`Session not found: session_meta_${sessionId}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Session not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Safely parse the session metadata
    let sessionData;
    try {
      console.log('Session metadata type:', typeof sessionMeta);
      console.log('Raw session metadata:', sessionMeta);
      
      // Try to handle different potential data formats
      if (typeof sessionMeta === 'string') {
        try {
          // Try to parse as JSON
          sessionData = JSON.parse(sessionMeta);
          console.log('Successfully parsed session data from string:', sessionData);
        } catch (parseError) {
          console.error('Failed to parse session metadata as JSON:', parseError);
          // If it's not valid JSON but appears to be an object notation, try a more lenient approach
          if (sessionMeta.startsWith('{') && sessionMeta.endsWith('}')) {
            console.log('Attempting to sanitize and parse malformed JSON');
            // This is a fallback for potentially malformed JSON
            try {
              // Use Function constructor as a last resort (safe in this controlled environment)
              sessionData = new Function('return ' + sessionMeta)();
              console.log('Parsed session data using alternate method:', sessionData);
            } catch (fallbackError) {
              throw new Error(`Failed JSON parse and fallback: ${parseError.message}`);
            }
          } else {
            throw parseError;
          }
        }
      } else if (typeof sessionMeta === 'object') {
        // It's already an object
        sessionData = sessionMeta;
        console.log('Session data was already an object:', sessionData);
      } else {
        throw new Error(`Unexpected session metadata type: ${typeof sessionMeta}`);
      }
      
      console.log('Final parsed session data:', sessionData);
      
      if (!sessionData || typeof sessionData !== 'object') {
        throw new Error('Session data is not a valid object');
      }
      
      if (!sessionData.sessionId || !sessionData.demoType) {
        console.error('Missing required fields in session data:', sessionData);
        throw new Error(`Session data missing required fields. Available keys: ${Object.keys(sessionData).join(', ')}`);
      }
    } catch (error) {
      console.error("Error parsing session metadata:", error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid session data format: ' + error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Get all results for this session
    const resultKeys = await environment.RT_DB.list({ prefix: `session_${sessionId}_result_` });
    
    // Prepare response based on format
    if (format === 'csv') {
      if (resultKeys.keys.length === 0) {
        // Return empty CSV with headers
        const csvHeader = 'session_id,task_type,student_name,student_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp\n';
        return new Response(csvHeader, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${sessionData.demoType || 'session'}_${sessionId}_results.csv"`,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Fetch all records for CSV
      const records = [];
      for (const key of resultKeys.keys) {
        const value = await environment.RT_DB.get(key.name);
        if (value) {
          try {
            const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
            records.push(parsedValue);
          } catch (error) {
            console.error(`Error parsing record ${key.name}:`, error);
            // Skip invalid records instead of failing completely
          }
        }
      }
      
      // Sort by timestamp
      records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Generate CSV
      const csvHeader = 'session_id,task_type,student_name,student_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp\n';
      
      const csvRows = records.map(record => {
        return [
          record.session_id || sessionId,
          record.task_type || '',
          record.student_name || '',
          record.student_id || '',
          record.trial_number || '',
          record.stimulus_type || '',
          record.stimulus_display || '',
          record.correct_response || '',
          record.participant_response || '',
          record.reaction_time_ms || record.reaction_time || '',
          record.is_correct || '',
          record.session_start_time || '',
          record.timestamp || ''
        ].map(field => {
          // Escape fields that contain commas or quotes
          if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${sessionData.demoType || 'session'}_${sessionId}_results.csv"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // JSON format - return session data with results
      const results = [];
      
      // Fetch all records for JSON response
      for (const key of resultKeys.keys) {
        const value = await environment.RT_DB.get(key.name);
        if (value) {
          try {
            const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
            results.push(parsedValue);
          } catch (error) {
            console.error(`Error parsing result ${key.name}:`, error);
            // Skip invalid records instead of failing completely
          }
        }
      }
      
      // Calculate some session stats
      const studentIds = new Set(results.map(r => r.student_id).filter(Boolean));
      
      // Make sure to send structured data in expected format for the client
      const response = {
        success: true,
        sessionData: {
          sessionId: sessionData.sessionId,
          demoType: sessionData.demoType,
          instructorName: sessionData.instructorName || 'Unknown',
          createdAt: sessionData.createdAt || new Date().toISOString(),
          expiresAt: sessionData.expiresAt,
          participantCount: studentIds.size || 0
        },
        resultCount: results.length,
        results: results
      };
      
      console.log('Sending final JSON response:', JSON.stringify(response).slice(0, 200) + '...');
      
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestDelete({ params, env }) {
  try {
    const environment = getEnv(env);
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Session ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Get session metadata first to check if it exists
    const sessionMeta = await env.RT_DB.get(`session_meta_${sessionId}`);
    if (!sessionMeta) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Session not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Get all results for this session
    const resultKeys = await env.RT_DB.list({ prefix: `session_${sessionId}_result_` });
    
    // Delete all results
    let deletedCount = 0;
    for (const key of resultKeys.keys) {
      await env.RT_DB.delete(key.name);
      deletedCount++;
    }
    
    // Do not delete session metadata itself to preserve session info
    
    return new Response(JSON.stringify({ 
      success: true,
      count: deletedCount,
      message: `Successfully cleared ${deletedCount} results from session ${sessionId}`
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
