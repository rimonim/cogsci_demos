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

export async function onRequestGet({ params, env }) {
  try {
    // Get environment (real or mock)
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
    
    // Get all results for this session
    const resultKeys = await env.RT_DB.list({ prefix: `session_${sessionId}_result_` });
    const results = [];
    
    for (const key of resultKeys.keys) {
      const value = await env.RT_DB.get(key.name);
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
        participantCount: new Set(results.map(r => r.student_name)).size
      },
      results
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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
