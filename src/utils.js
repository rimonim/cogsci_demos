// Utility functions
export function createPageUrl(pageName) {
  // Simple utility to create page URLs
  // In a more complex app, this might handle routing logic
  const pageMap = {
    'FlankerTask': '/flanker',
    'Results': '/results',
    'Instructions': '/instructions'
  };
  
  return pageMap[pageName] || '/';
}

// Task detection and data management utilities

export const detectExistingTaskData = async () => {
  try {
    // Check API for existing data first
    const response = await fetch('/api/record', {
      method: 'GET',
    });
    
    if (response.ok) {
      const csvText = await response.text();
      if (!csvText.trim() || csvText.trim() === 'task_type,student_name,student_id,trial_number,stimulus_type,stimulus_display,correct_response,participant_response,reaction_time_ms,is_correct,session_start_time,timestamp') {
        return { hasData: false, tasks: [] };
      }
      
      // Parse CSV to detect task types
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) return { hasData: false, tasks: [] };
      
      const headers = lines[0].split(',');
      const taskTypeIndex = headers.indexOf('task_type');
      
      if (taskTypeIndex === -1) {
        // Legacy data without task_type, assume flanker
        return { hasData: true, tasks: ['flanker'], count: lines.length - 1 };
      }
      
      const taskTypes = new Set();
      lines.slice(1).forEach(line => {
        const values = line.split(',');
        const taskType = values[taskTypeIndex];
        if (taskType) {
          taskTypes.add(taskType.replace(/"/g, ''));
        }
      });
      
      return { 
        hasData: true, 
        tasks: Array.from(taskTypes), 
        count: lines.length - 1 
      };
    }
  } catch (error) {
    console.warn('Failed to check API data:', error);
  }
  
  // Fallback: check local storage
  const flankerData = JSON.parse(localStorage.getItem('flankerResults') || '[]');
  const stroopData = JSON.parse(localStorage.getItem('stroopResults') || '[]');
  
  const tasks = [];
  if (flankerData.length > 0) tasks.push('flanker');
  if (stroopData.length > 0) tasks.push('stroop');
  
  return {
    hasData: tasks.length > 0,
    tasks,
    count: flankerData.length + stroopData.length
  };
};

export const clearAllTaskData = async () => {
  try {
    // Clear API data
    const response = await fetch('/api/record', {
      method: 'DELETE',
    });
    
    if (response.ok) {
      console.log('Cloud data cleared successfully');
    }
  } catch (error) {
    console.warn('Failed to clear API data:', error);
  }
  
  // Clear local storage
  localStorage.removeItem('flankerResults');
  localStorage.removeItem('stroopResults');
  
  return { success: true };
};

export const getTaskDisplayName = (taskType) => {
  switch (taskType) {
    case 'flanker': return 'Flanker Task';
    case 'stroop': return 'Stroop Task';
    default: return taskType;
  }
};
