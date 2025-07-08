// Cloudflare Pages Functions API handler for session management
// POST /api/session - Create a new session
// GET /api/session/{sessionId} - Get session info and data
import { getLocalEnv } from './local-dev.js';

// Helper to get the appropriate environment (real or mock)
const getEnv = (env) => {
  // If running locally without Cloudflare env
  if (!env || !env.RT_DB) {
    console.log("Using local development mock storage");
    return getLocalEnv();
  }
  return env;
};

export async function onRequestPost({ request, env }) {
  try {
    // Debug request info
    console.log('Session creation request received');
    
    // Safer JSON parsing
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Error parsing request body:', jsonError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body: ' + jsonError.message 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const { instructorName, demoType } = body;
    console.log('Request data:', { instructorName, demoType });
    
    if (!instructorName || !demoType) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Instructor name and demo type are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Get environment (real or mock)
    const environment = getEnv(env);
    
    // Generate session ID (6 random uppercase letters/numbers)
    const sessionId = Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log('Generated session ID:', sessionId);
    
    // Create session metadata
    const sessionData = {
      sessionId,
      instructorName,
      demoType,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      participantCount: 0
    };
    
    console.log('Session data to store:', sessionData);
    
    // Store session metadata
    try {
      await environment.RT_DB.put(`session_meta_${sessionId}`, JSON.stringify(sessionData));
      console.log('Session metadata stored successfully');
    } catch (storageError) {
      console.error('Error storing session metadata:', storageError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to store session data: ' + storageError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    console.log('Sending successful response');
    return new Response(JSON.stringify({ 
      success: true, 
      sessionId,
      sessionData
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestGet({ params, env, request }) {
  try {
    // Get environment (real or mock)
    const environment = getEnv(env);
    
    // Check if this is a request for a specific session or all sessions
    const url = new URL(request.url);
    const sessionId = params.sessionId;
    
    if (sessionId) {
      // Handle specific session request (existing logic)
      return await getSpecificSession(sessionId, environment);
    } else {
      // Handle request for all sessions list
      return await getAllSessions(environment);
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Get all sessions for admin/bulk management
async function getAllSessions(environment) {
  try {
    // Get all session metadata
    const sessionMetaKeys = await environment.RT_DB.list({ prefix: 'session_meta_' });
    const sessions = [];
    const now = new Date();

    for (const metaKey of sessionMetaKeys.keys) {
      try {
        const sessionMeta = await environment.RT_DB.get(metaKey.name);
        if (!sessionMeta) continue;
        
        const sessionData = JSON.parse(sessionMeta);
        
        // Check if session has expired
        const isExpired = new Date(sessionData.expiresAt) < now;
        
        // Get participant count by checking student records
        const studentKeys = await environment.RT_DB.list({ 
          prefix: `session_${sessionData.sessionId}_student_` 
        });
        
        sessions.push({
          ...sessionData,
          isExpired,
          participantCount: studentKeys.keys.length,
          studentKeys: studentKeys.keys.length // For bulk operations
        });
      } catch (error) {
        console.error(`Error processing session ${metaKey.name}:`, error);
        // Continue with other sessions
      }
    }
    
    // Sort by creation date (newest first)
    sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return new Response(JSON.stringify({ 
      success: true, 
      sessions,
      total: sessions.length,
      expired: sessions.filter(s => s.isExpired).length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Get specific session (refactored from existing logic)
async function getSpecificSession(sessionId, environment) {
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
  const sessionMeta = await environment.RT_DB.get(`session_meta_${sessionId}`);
  if (!sessionMeta) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Session not found' 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  const sessionData = JSON.parse(sessionMeta);
  
  // Check if session has expired
  if (new Date() > new Date(sessionData.expiresAt)) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Session has expired' 
    }), {
      status: 410,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  // Get all results for this session - check both new and legacy formats
  const studentKeys = await environment.RT_DB.list({ prefix: `session_${sessionId}_student_` });
  const legacyKeys = await environment.RT_DB.list({ prefix: `session_${sessionId}_result_` });
  
  const results = [];
  
  // Process new student-level records
  for (const key of studentKeys.keys) {
    const value = await environment.RT_DB.get(key.name);
    if (value) {
      const studentRecord = JSON.parse(value);
      // Convert student record to individual trial format for compatibility
      if (studentRecord.trials) {
        for (const trial of studentRecord.trials) {
          results.push({
            ...trial,
            student_name: studentRecord.student_info?.name || 'Unknown',
            student_id: studentRecord.student_info?.id || 'Unknown',
            share_data: studentRecord.student_info?.share_data !== false,
            task_type: studentRecord.task_type,
            session_id: sessionId
          });
        }
      }
    }
  }
  
  // Process legacy trial records for backward compatibility
  for (const key of legacyKeys.keys) {
    const value = await environment.RT_DB.get(key.name);
    if (value) {
      results.push(JSON.parse(value));
    }
  }
  
  // Sort by timestamp
  results.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return new Response(JSON.stringify({ 
    success: true, 
    sessionData: {
      ...sessionData,
      participantCount: new Set(results.map(r => r.student_name || r.student_id)).size
    },
    results
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
