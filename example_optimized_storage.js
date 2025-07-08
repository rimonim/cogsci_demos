// Example of optimized KV storage using student-level aggregation
// This reduces 50 writes per student to 1 write per student

export async function onRequestPost({ request, env }) {
  try {
    const environment = getEnv(env);
    const data = await request.json();
    
    const { session_id, student_id, trial_data } = data;
    
    if (!session_id || !student_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Session ID and student ID are required' 
      }), { status: 400 });
    }
    
    // Key per student (not per trial)
    const studentKey = `session_${session_id}_student_${student_id}`;
    
    // Get existing student data or create new
    let studentRecord;
    try {
      const existing = await environment.RT_DB.get(studentKey);
      studentRecord = existing ? JSON.parse(existing) : {
        student_info: {
          id: student_id,
          name: data.student_name,
          session_id: session_id
        },
        trials: []
      };
    } catch (error) {
      studentRecord = {
        student_info: {
          id: student_id, 
          name: data.student_name,
          session_id: session_id
        },
        trials: []
      };
    }
    
    // Add new trial to student record
    studentRecord.trials.push({
      trial_number: data.trial_number,
      stimulus_type: data.stimulus_type,
      stimulus_display: data.stimulus_display,
      correct_response: data.correct_response,
      participant_response: data.participant_response,
      reaction_time: data.reaction_time,
      is_correct: data.is_correct,
      timestamp: new Date().toISOString()
    });
    
    // Update last_updated timestamp
    studentRecord.last_updated = new Date().toISOString();
    
    // Single write operation per student (not per trial)
    await environment.RT_DB.put(studentKey, JSON.stringify(studentRecord));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Trial ${data.trial_number} saved for student ${student_id}`,
      total_trials: studentRecord.trials.length
    }), {
      status: 201,
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
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Reading session data becomes simpler too
export async function getSessionResults(sessionId, env) {
  const environment = getEnv(env);
  
  // List all student keys for this session
  const studentKeys = await environment.RT_DB.list({ 
    prefix: `session_${sessionId}_student_` 
  });
  
  const allResults = [];
  
  // Fetch each student's complete data
  for (const key of studentKeys.keys) {
    const studentData = await environment.RT_DB.get(key.name);
    if (studentData) {
      const parsed = JSON.parse(studentData);
      // Flatten trials with student info for compatibility
      parsed.trials.forEach(trial => {
        allResults.push({
          ...trial,
          student_name: parsed.student_info.name,
          student_id: parsed.student_info.id,
          session_id: sessionId
        });
      });
    }
  }
  
  return allResults.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}
