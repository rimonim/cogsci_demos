import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StudentResult } from "@/entities/StudentResult";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMultiPhaseTrialManager } from "@/hooks/useMultiPhaseTrialManager";

import TaskSetup from "@/components/ui/TaskSetup";
import { CHANGE_DETECTION_CONFIG, CHANGE_DETECTION_PRACTICE_CONFIG, CHANGE_DETECTION_COMPLETE_CONFIG } from "@/components/ui/taskConfigs";
import StimulusDisplay from "@/components/change-detection/StimulusDisplay";
import TaskComplete from "@/components/ui/TaskComplete";
import PracticeComplete from "@/components/ui/PracticeComplete";

const TOTAL_TRIALS = 40;
const PRACTICE_TRIALS = 8;
const RESPONSE_TIMEOUT = 5000;
const MEMORY_DURATION = 200; // Show memory array for 200ms
const RETENTION_INTERVAL = 900; // Blank retention interval between memory and test

// Available colors for squares
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
const SET_SIZES = [4, 8];

// Generate a single trial
const generateTrial = (setSize, trialNumber) => {
  const gridSize = 6; // 6x6 grid
  const totalPositions = gridSize * gridSize;
  
  console.log(`[Change Detection] Generating trial ${trialNumber}: setSize=${setSize}, gridSize=${gridSize}, totalPositions=${totalPositions}`);
  
  // Randomly select positions for colored squares
  const positions = [];
  while (positions.length < setSize) {
    const position = Math.floor(Math.random() * totalPositions);
    if (!positions.includes(position)) {
      positions.push(position);
    }
  }
  
  console.log(`[Change Detection] Selected positions for memory array:`, positions);
  
  // Assign colors to each position
  const memoryArray = [];
  positions.forEach((position, index) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    memoryArray.push({ position, color });
  });
  
  // Determine if there will be a change
  const hasChange = Math.random() < 0.5;
  
  // Create test array - pick one position to probe
  const probeIndex = Math.floor(Math.random() * memoryArray.length);
  const probePosition = memoryArray[probeIndex].position;
  const originalColor = memoryArray[probeIndex].color;
  
  console.log(`[Change Detection] Trial ${trialNumber}: probeIndex=${probeIndex}, probePosition=${probePosition}, originalColor=${originalColor}`);
  console.log(`[Change Detection] Memory array:`, memoryArray.map(s => `pos=${s.position}, color=${s.color}`));
  
  // Verify probe position is in memory array
  const isProbeInMemory = memoryArray.some(square => square.position === probePosition);
  if (!isProbeInMemory) {
    console.error(`[Change Detection] ERROR: Probe position ${probePosition} not found in memory array!`);
  }
  
  let probeColor = originalColor;
  let changedItem = null;
  
  if (hasChange) {
    // Pick a different color for the probe
    do {
      probeColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (probeColor === originalColor);
    
    changedItem = {
      position: probePosition,
      oldColor: originalColor,
      newColor: probeColor
    };
  }
  
  // Test array contains only the probe square
  const testArray = [{
    position: probePosition,
    color: probeColor
  }];
  
  console.log(`[Change Detection] Test array:`, testArray, `hasChange=${hasChange}, correct_response=${hasChange ? 'change' : 'same'}`);
  
  return {
    trial_number: trialNumber,
    set_size: setSize,
    memory_array: memoryArray,
    test_array: testArray,
    has_change: hasChange,
    changed_item: changedItem,
    correct_response: hasChange ? 'change' : 'same',
    correctResponse: hasChange ? 'change' : 'same', // For trial manager compatibility
    grid_size: gridSize,
    probe_position: probePosition,
    probe_color: probeColor,
    correct_color: originalColor // The original color at the probe position
  };
};

// Generate trial sequences
const generateTrials = (numTrials) => {
  const trials = [];
  for (let i = 0; i < numTrials; i++) {
    const setSize = SET_SIZES[Math.floor(Math.random() * SET_SIZES.length)];
    trials.push(generateTrial(setSize, i + 1));
  }
  return trials;
};

export default function ChangeDetectionTask() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [studentInfo, setStudentInfo] = useState({ name: "Anonymous", id: "local", shareData: false });
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [studentResult, setStudentResult] = useState(null);

  const navigate = useNavigate();

  // Generate trial sequences (memoized to prevent regeneration)
  const practiceTrials = useMemo(() => {
    console.log('[Change Detection] Generating practice trials');
    return generateTrials(PRACTICE_TRIALS);
  }, []);
  
  const mainTrials = useMemo(() => {
    console.log('[Change Detection] Generating main trials');
    return generateTrials(TOTAL_TRIALS);
  }, []);

  // Define phase sequence for change detection trials
  const phaseConfig = [
    { name: 'fixation', duration: 300, showStimulus: false, acceptResponses: false },
    { name: 'memory', duration: MEMORY_DURATION, showStimulus: true, acceptResponses: false },
    { name: 'retention', duration: RETENTION_INTERVAL, showStimulus: false, acceptResponses: false },
    { name: 'test', duration: null, showStimulus: true, acceptResponses: true } // No fixed duration, wait for response
  ];

  // Calculate practice stats for change detection
  const calculateChangeDetectionStats = useCallback((results) => {
    if (!results || results.length === 0) {
      return { accuracy: 0, avgReactionTime: 0, trialsResponded: 0, cowansK: 0 };
    }
    
    // Filter out timeout responses
    const responded = results.filter(r => r.response !== 'timeout');
    const correct = results.filter(r => r.is_correct === true);
    
    // Calculate basic stats
    const accuracy = responded.length > 0 ? (correct.length / responded.length) * 100 : 0;
    const avgReactionTime = responded.length > 0 ? 
      responded.reduce((sum, r) => sum + (r.reaction_time || 0), 0) / responded.length : 0;
    
    // Calculate Cowan's K - capacity estimate
    // K = set_size * (hit_rate + correct_rejections - 1)
    // For change detection: hit = correctly detecting change, correct rejection = correctly identifying no change
    const changeTrials = responded.filter(r => r.has_change === true);
    const noChangeTrials = responded.filter(r => r.has_change === false);
    
    const hitRate = changeTrials.length > 0 ? 
      changeTrials.filter(r => r.response === 'change').length / changeTrials.length : 0;
    const correctRejectionRate = noChangeTrials.length > 0 ? 
      noChangeTrials.filter(r => r.response === 'same').length / noChangeTrials.length : 0;
    
    // Use average set size for K calculation
    const avgSetSize = responded.length > 0 ? 
      responded.reduce((sum, r) => sum + (r.set_size || 4), 0) / responded.length : 4;
    
    const cowansK = Math.max(0, avgSetSize * (hitRate + correctRejectionRate - 1));
    
    return {
      accuracy: Math.round(accuracy),
      avgReactionTime: Math.round(avgReactionTime),
      trialsResponded: responded.length,
      cowansK: Math.round(cowansK * 100) / 100 // Round to 2 decimal places
    };
  }, []);

  // Use multi-phase trial manager
  const {
    phase,
    currentTrial,
    trialPhase,
    showStimulus,
    awaitingResponse,
    results,
    practiceResults,
    practiceStats,
    totalTrials,
    startPractice,
    startMainTask,
    handleResponse,
    getCurrentTrial
  } = useMultiPhaseTrialManager({
    practiceTrials,
    mainTrials,
    phases: phaseConfig,
    responseTimeout: RESPONSE_TIMEOUT,
    interTrialDelay: 1000,
    calculateStats: calculateChangeDetectionStats,
    
    onPhaseStart: (phaseName, phaseIndex, trial, experimentPhase) => {
      if (phaseName === 'fixation') {
        setFeedback(null);
      }
    },
    
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      console.log(`[Change Detection] Trial ${trialIndex + 1} ended:`, result);
      console.log(`[Change Detection] Trial data:`, trial);
      
      // Show feedback for practice trials
      if (currentPhase === 'practice') {
        const feedbackText = result.is_correct ? 'Correct!' : `Incorrect - ${trial.has_change ? 'There was a change' : 'No change'}`;
        setFeedback({ show: true, text: feedbackText, correct: result.is_correct });
        
        // Hide feedback after 1 second
        setTimeout(() => {
          setFeedback(null);
        }, 1000);
      } else if (currentPhase === 'task' && studentResult) {
        // Collect trial data for main task
        studentResult.addTrial(result);
      }
      return result;
    },
    
    onPhaseComplete: (completedPhase, phaseResults) => {
      // Phase complete - no action needed
    },
    
    onExperimentComplete: async (mainResults, practiceResults) => {
      // Submit all collected trial data as a single student record
      if (studentResult && mainResults.length > 0) {
        try {
          await studentResult.submit();
        } catch (error) {
          // Error during submission - data is saved locally
        }
      }
    }
  });

  // Check for session data on component mount
  useEffect(() => {
    if (sessionId && window.sessionData) {
      const { studentInfo: sessionStudentInfo } = window.sessionData;
      if (sessionStudentInfo && sessionStudentInfo.name) {
        const sessionInfo = {
          name: sessionStudentInfo.name,
          id: sessionStudentInfo.studentId || sessionStudentInfo.id || '',
          shareData: sessionStudentInfo.shareData || true
        };
        setStudentInfo(sessionInfo);
        setIsSessionMode(true);
        setSessionStartTime(new Date().toISOString());
        
        // Initialize StudentResult for aggregated data collection
        const result = StudentResult.create('change_detection');
        setStudentResult(result);
      }
    } else {
      // No session data - standalone mode
      setIsSessionMode(false);
      setSessionStartTime(new Date().toISOString());
      
      // Initialize StudentResult for standalone mode
      const result = StudentResult.create('change_detection');
      setStudentResult(result);
    }
  }, [sessionId]);

  // Auto-start practice when ready (for standalone mode)
  useEffect(() => {
    if (sessionStartTime && phase === 'setup' && !isSessionMode) {
      console.log('[Change Detection] Auto-starting practice in standalone mode');
      setTimeout(() => {
        console.log('[Change Detection] Calling startPractice()');
        startPractice();
      }, 100);
    }
  }, [sessionStartTime, phase, isSessionMode, startPractice]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        handleResponse("same", Date.now());
      } else if (key === "d") {
        e.preventDefault();
        handleResponse("change", Date.now());
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [awaitingResponse, handleResponse]);

  // Setup handlers
  const startTask = (name, id, shareData = false) => {
    setStudentInfo({ name, id, shareData });
    setSessionStartTime(new Date().toISOString());
    startPractice();
  };

  const startMainExperiment = () => {
    startMainTask();
  };

  const handleTaskComplete = () => {
    navigate('/');
  };

  // Render based on current phase
  if (phase === 'setup' && isSessionMode) {
    return (
      <TaskSetup
        config={CHANGE_DETECTION_CONFIG}
        onStart={startTask}
        allowAnonymous={true}
        showNameInput={true}
      />
    );
  }

  if (phase === 'practice_complete') {
    return (
      <PracticeComplete
        config={CHANGE_DETECTION_PRACTICE_CONFIG}
        onContinue={startMainExperiment}
        results={practiceResults}
        stats={practiceStats}
      />
    );
  }

  if (phase === 'complete') {
    return (
      <TaskComplete
        config={CHANGE_DETECTION_COMPLETE_CONFIG}
        results={results}
        onComplete={handleTaskComplete}
        studentInfo={studentInfo}
      />
    );
  }

  // Main task display
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Change Detection Task
            </h1>
            <p className="text-sm text-gray-600">
              {phase === 'practice' ? 'Practice' : 'Main Task'} - Trial {currentTrial + 1} of {totalTrials}
            </p>
          </div>
          
          {studentInfo.name !== "Anonymous" && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{studentInfo.name}</span>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <Progress 
            value={((currentTrial + 1) / totalTrials) * 100} 
            className="w-full h-2"
          />
        </div>
      </div>

      {/* Task content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <StimulusDisplay
            trial={getCurrentTrial()}
            showStimulus={showStimulus}
            awaitingResponse={awaitingResponse}
            feedback={feedback}
            phase={phase}
            trialPhase={trialPhase}
          />
        </div>
      </div>

      {/* Instructions footer */}
      <div className="bg-white border-t px-6 py-4">
        <div className="text-center text-sm text-gray-600">
          <p>
            Press <strong>S</strong> if arrays are the <strong>same</strong> • 
            Press <strong>D</strong> if there was a <strong>change</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
