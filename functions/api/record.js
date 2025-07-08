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
    
    // Check if this is student-level data (new format) or legacy single trial
    if (data.student_data && data.session_id && data.student_id) {
      // New student-level aggregation
      return await handleStudentDataSubmission(data, environment);
    } else {
      // Legacy single trial submission for backward compatibility
      return await handleLegacyTrialSubmission(data, environment);
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

async function handleStudentDataSubmission(data, environment) {
  const { session_id, student_id, student_data } = data;
  
  if (!session_id || !student_id || !student_data) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Session ID, student ID, and student data are required' 
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  // Use student-level key (one key per student per session)
  const studentKey = `session_${session_id}_student_${student_id}`;
  
  // Prepare student record with metadata and all trials
  const studentRecord = {
    session_id,
    student_info: {
      id: student_id,
      name: student_data.name || 'Unknown',
      share_data: student_data.share_data !== false
    },
    task_type: student_data.task_type || 'unknown',
    trials: student_data.trials || [],
    summary: {
      total_trials: student_data.trials?.length || 0,
      completed_at: new Date().toISOString(),
      session_start_time: student_data.session_start_time
    },
    last_updated: new Date().toISOString()
  };
  
  // Single write operation per student (not per trial)
  await environment.RT_DB.put(studentKey, JSON.stringify(studentRecord));
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: `Complete data saved for student ${student_id}`,
    student_key: studentKey,
    trials_count: studentRecord.summary.total_trials
  }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleLegacyTrialSubmission(data, environment) {
  // Legacy single trial storage for backward compatibility
  const timestamp = new Date().toISOString();
  
  let key;
  if (data.session_id) {
    key = `session_${data.session_id}_result_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  } else {
    key = `result_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Add task type if not specified
  if (!data.task_type) {
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
  
  await environment.RT_DB.put(key, JSON.stringify({
    ...data,
    timestamp,
    key
  }));
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Data saved successfully (legacy format)',
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
}

export async function onRequestGet({ env }) {
  const environment = getEnv(env);
  try {
    // Get both new student-level data and legacy trial data
    const studentKeys = await environment.RT_DB.list({ prefix: 'session_' });
    const legacyKeys = await environment.RT_DB.list({ prefix: 'result_' });
    
    const allRecords = [];
    
    // Process student-level data (new format)
    for (const key of studentKeys.keys) {
      if (key.name.includes('_student_')) {
        const studentData = await environment.RT_DB.get(key.name);
        if (studentData) {
          try {
            const parsed = typeof studentData === 'string' ? JSON.parse(studentData) : studentData;
            
            // Flatten trials with student info for CSV compatibility
            if (parsed.trials && Array.isArray(parsed.trials)) {
              parsed.trials.forEach(trial => {
                allRecords.push({
                  task_type: parsed.task_type || trial.task_type || 'unknown',
                  student_name: parsed.student_info?.name || 'Unknown',
                  student_id: parsed.student_info?.id || 'Unknown',
                  session_id: parsed.session_id,
                  trial_number: trial.trial_number || '',
                  stimulus_type: trial.stimulus_type || '',
                  stimulus_display: trial.stimulus_display || '',
                  correct_response: trial.correct_response || '',
                  participant_response: trial.participant_response || '',
                  reaction_time_ms: trial.reaction_time || trial.reaction_time_ms || '',
                  is_correct: trial.is_correct !== undefined ? trial.is_correct : '',
                  session_start_time: parsed.summary?.session_start_time || trial.session_start_time || '',
                  timestamp: trial.timestamp || parsed.last_updated || ''
                });
              });
            }
          } catch (error) {
            console.error(`Error parsing student record ${key.name}:`, error);
          }
        }
      }
    }
    
    // Process legacy data for backward compatibility
    for (const key of legacyKeys.keys) {
      const value = await environment.RT_DB.get(key.name);
      if (value) {
        try {
          const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
          allRecords.push({
            task_type: parsedValue.task_type || '',
            student_name: parsedValue.student_name || '',
            student_id: parsedValue.student_id || '',
            session_id: parsedValue.session_id || '',
            trial_number: parsedValue.trial_number || '',
            stimulus_type: parsedValue.stimulus_type || '',
            stimulus_display: parsedValue.stimulus_display || '',
            correct_response: parsedValue.correct_response || '',
            participant_response: parsedValue.participant_response || '',
            reaction_time_ms: parsedValue.reaction_time || parsedValue.reaction_time_ms || '',
            is_correct: parsedValue.is_correct !== undefined ? parsedValue.is_correct : '',
            session_start_time: parsedValue.session_start_time || '',
            timestamp: parsedValue.timestamp || ''
          });
        } catch (error) {
          console.error(`Error parsing legacy record ${key.name}:`, error);
        }
      }
    }
    
    if (allRecords.length === 0) {
      return new Response('task_type,student_name,student_id,session_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp\n', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="cogsci_class_results.csv"',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Sort by timestamp
    allRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Generate CSV
    const csvHeader = 'task_type,student_name,student_id,session_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp\n';
    
    const csvRows = allRecords.map(record => {
      return [
        record.task_type,
        record.student_name,
        record.student_id,
        record.session_id,
        record.trial_number,
        record.stimulus_type,
        record.stimulus_display,
        record.correct_response,
        record.participant_response,
        record.reaction_time_ms,
        record.is_correct,
        record.session_start_time,
        record.timestamp
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
    
    // List all student-level and legacy result keys
    const allKeys = await environment.RT_DB.list();
    const dataKeys = allKeys.keys.filter(key => 
      key.name.startsWith('session_') && (key.name.includes('_student_') || key.name.includes('_result_')) ||
      key.name.startsWith('result_')
    );
    
    // Delete all data records (but preserve session metadata)
    const deletePromises = dataKeys.map(key => environment.RT_DB.delete(key.name));
    await Promise.all(deletePromises);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Cleared ${dataKeys.length} records`,
      recordsCleared: dataKeys.length
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
