// Cloudflare Pages Functions API handler for instructor authentication
// POST /api/auth - Authenticate instructor with password
import { getLocalEnv } from './local-dev.js';

// Helper to get the appropriate environment (real or mock)
const getEnv = (env) => {
  if (!env || !env.RT_DB) {
    console.log("Using local development mock storage");
    return getLocalEnv();
  }
  return env;
};

// Get instructor password from environment
const getInstructorPassword = (env) => {
  // Try environment variable first (production/Cloudflare)
  if (env && env.INSTRUCTOR_PASSWORD) {
    return env.INSTRUCTOR_PASSWORD;
  }
  
  // For local development, use a default password since process.env is not available in Workers
  // In production, this will be set via Cloudflare environment variables
  return 'demo123';
};

export async function onRequestPost({ request, env }) {
  try {
    const { password, action } = await request.json();
    
    if (action !== 'login') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid action' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Password required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const correctPassword = getInstructorPassword(env);
    
    if (password === correctPassword) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Authentication successful',
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      // Add a small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Verify authentication for protected endpoints
export const verifyInstructorAuth = (request, env) => {
  const authHeader = request.headers.get('Authorization');
  const timestampHeader = request.headers.get('X-Auth-Timestamp');
  
  if (authHeader !== 'Instructor-Session' || !timestampHeader) {
    return { success: false, error: 'Authentication required' };
  }
  
  const timestamp = parseInt(timestampHeader);
  const now = Date.now();
  const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  
  if ((now - timestamp) > SESSION_DURATION) {
    return { success: false, error: 'Session expired' };
  }
  
  return { success: true };
};

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Timestamp',
    },
  });
}
