// Cloudflare Pages Functions API handler
// POST /api/record - Save experiment data to KV storage
// GET /api/record - Export all data as CSV
// DELETE /api/record - Clear all data (instructor reset)
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
    const environment = getEnv(env);
    const data = await request.json();
    
    // Generate a unique key for this record
    const timestamp = new Date().toISOString();
    
    // Support both session-based and legacy storage
    let key;
    if (data.session_id) {
      // New session-based storage
      key = `session_${data.session_id}_result_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    } else {
      // Legacy storage for backward compatibility
      key = `result_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add task type if not specified
    if (!data.task_type) {
      // Infer task type from data structure
      if (data.stimulus_type === 'congruent' || data.stimulus_type === 'incongruent') {
        data.task_type = 'flanker';
      } else if (data.word && data.color) {
        data.task_type = 'stroop';
      } else if (data.letter && data.is_target !== undefined) {
        data.task_type = 'nback';
      } else if (data.target_present !== undefined) {
        data.task_type = 'visual_search';
      } else {
        data.task_type = 'unknown';
      }
    }
    
    // Store in KV with the key
    await environment.RT_DB.put(key, JSON.stringify({
      ...data,
      timestamp,
      key
    }));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Data saved successfully',
      key 
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
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

export async function onRequestGet({ env }) {
  const environment = getEnv(env);
  try {
    // List all keys with the result prefix
    const keys = await environment.RT_DB.list({ prefix: 'result_' });
    
    if (keys.keys.length === 0) {
      return new Response('task_type,student_name,student_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp\n', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="cogsci_class_results.csv"',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Fetch all records
    const records = [];
    for (const key of keys.keys) {
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
    const csvHeader = 'task_type,student_name,student_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp\n';
    
    const csvRows = records.map(record => {
      return [
        record.task_type || '',
        record.student_name || '',
        record.student_id || '',
        record.trial_number || '',
        record.stimulus_type || '',
        record.stimulus_display || '',
        record.correct_response || '',
        record.participant_response || '',
        record.reaction_time || '',
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
        'Content-Disposition': 'attachment; filename="cogsci_class_results.csv"',
        'Access-Control-Allow-Origin': '*',
      },
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

export async function onRequestDelete({ env }) {
  try {
    const environment = getEnv(env);
    
    // List all result keys
    const keys = await environment.RT_DB.list({ prefix: 'result_' });
    
    // Delete all result records
    const deletePromises = keys.keys.map(key => environment.RT_DB.delete(key.name));
    await Promise.all(deletePromises);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Cleared ${keys.keys.length} records`,
      recordsCleared: keys.keys.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
