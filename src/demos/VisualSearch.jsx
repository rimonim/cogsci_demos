import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StudentResult } from "@/entities/StudentResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrialManager } from "@/hooks/useTrialManager";

import { VISUAL_SEARCH_CONFIG, VISUAL_SEARCH_PRACTICE_CONFIG, VISUAL_SEARCH_COMPLETE_CONFIG } from "@/components/ui/taskConfigs";
import StimulusDisplay from "@/components/visual-search/StimulusDisplay";
import TaskComplete from "@/components/ui/TaskComplete";
import PracticeComplete from "@/components/ui/PracticeComplete";

const TOTAL_TRIALS = 80; // 20 per condition (4 conditions)
const PRACTICE_TRIALS = 12;
const RESPONSE_TIMEOUT = 5000;

// Color-blind friendly colors
const COLORS = {
  blue: "#0066CC",
  orange: "#CC6600"
};

// Task conditions
const CONDITIONS = [
  { 
    type: "color_popout", 
    target: { color: "blue", orientation: "vertical" },
    distractors: [{ color: "orange", orientation: "vertical" }] 
  },
  { 
    type: "orientation_popout", 
    target: { color: "blue", orientation: "vertical" },
    distractors: [{ color: "blue", orientation: "horizontal" }] 
  },
  { 
    type: "conjunction", 
    target: { color: "blue", orientation: "vertical" },
    distractors: [
      { color: "blue", orientation: "horizontal" }, 
      { color: "orange", orientation: "vertical" }
    ] 
  },
  { 
    type: "conjunction", 
    target: { color: "orange", orientation: "horizontal" },
    distractors: [
      { color: "orange", orientation: "vertical" }, 
      { color: "blue", orientation: "horizontal" }
    ] 
  }
];

const SET_SIZES = [4, 8, 16, 24];

// Generate a single trial configuration
const generateTrial = (condition, setSize, targetPresent, trialNumber) => {
  const target = condition.target;
  const distractors = condition.distractors;
  
  // Create stimulus array
  let stimuli = [];
  
  if (targetPresent) {
    // Add target
    stimuli.push({
      type: "target",
      color: target.color,
      orientation: target.orientation
    });
    
    // Add distractors (setSize - 1)
    for (let i = 1; i < setSize; i++) {
      const distractor = distractors[Math.floor(Math.random() * distractors.length)];
      stimuli.push({
        type: "distractor",
        color: distractor.color,
        orientation: distractor.orientation
      });
    }
  } else {
    // Add only distractors
    for (let i = 0; i < setSize; i++) {
      const distractor = distractors[Math.floor(Math.random() * distractors.length)];
      stimuli.push({
        type: "distractor",
        color: distractor.color,
        orientation: distractor.orientation
      });
    }
  }
  
  // Shuffle positions
  stimuli = stimuli.sort(() => Math.random() - 0.5);
  
  return {
    condition: condition.type,
    setSize,
    targetPresent,
    stimuli,
    trialNumber,
    correctResponse: targetPresent ? "j" : "k"
  };
};

// Generate full trial sequence
const generateTrialSequence = (numTrials) => {
  const trials = [];
  const trialsPerCondition = Math.floor(numTrials / CONDITIONS.length);
  
  CONDITIONS.forEach(condition => {
    for (let i = 0; i < trialsPerCondition; i++) {
      const setSize = SET_SIZES[Math.floor(Math.random() * SET_SIZES.length)];
      const targetPresent = Math.random() < 0.5;
      trials.push(generateTrial(condition, setSize, targetPresent, trials.length + 1));
    }
  });
  
  // Shuffle the entire sequence
  return trials.sort(() => Math.random() - 0.5);
};

export default function VisualSearchTask() {
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "", shareData: false });
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [studentResult, setStudentResult] = useState(null);

  const navigate = useNavigate();

  // Generate trial sequences (memoized to prevent re-generation)
  const practiceTrials = useMemo(() => generateTrialSequence(PRACTICE_TRIALS), []);
  const mainTrials = useMemo(() => generateTrialSequence(TOTAL_TRIALS), []);

  const {
    phase,
    currentTrial,
    showStimulus,
    showingFixation,
    awaitingResponse,
    inInterTrialDelay,
    results,
    practiceResults,
    startPractice,
    startMainTask,
    handleResponse,
    getCurrentTrial,
    totalTrials
  } = useTrialManager({
    practiceTrials,
    mainTrials,
    responseTimeout: RESPONSE_TIMEOUT,
    interTrialDelay: { practice: 800, task: 500 }, // Shorter delays for visual search
    fixationDelay: 500,
    showFixation: true, // Visual search uses fixation crosses
    
    onTrialStart: (trial, trialIndex, currentPhase) => {
      setCurrentStimulus(trial);
    },
    
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      const isCorrect = result.response === trial.correctResponse;
      
      // Enhanced result object with trial info
      const trialData = {
        trial_number: trialIndex + 1,
        search_type: trial.condition, // Use search_type to match CSV config
        set_size: trial.setSize,
        target_present: trial.targetPresent,
        correct_response: trial.correctResponse,
        participant_response: result.response,
        reaction_time: result.reaction_time,
        is_correct: isCorrect
      };

      // Collect trial data for main task (don't submit individually)
      if (currentPhase === 'task' && studentResult) {
        studentResult.addTrial(trialData);
        console.log(`[VISUAL_SEARCH DEBUG] Added trial ${trialIndex + 1} to collection. Total: ${studentResult.getTrialCount()}`);
      }

      return { ...result, ...trialData };
    },
    
    onPhaseComplete: (completedPhase, phaseResults) => {
      console.log(`${completedPhase} phase completed with ${phaseResults.length} trials`);
    },
    
    onExperimentComplete: async (mainResults, practiceResults) => {
      console.log('Visual Search experiment completed!', { 
        mainTrials: mainResults.length, 
        practiceTrials: practiceResults.length 
      });
      
      // Submit all collected trial data as a single student record
      if (studentResult && mainResults.length > 0) {
        try {
          console.log(`[VISUAL_SEARCH DEBUG] Submitting ${studentResult.getTrialCount()} trials for student`);
          const submission = await studentResult.submit();
          
          if (submission.success) {
            console.log('[VISUAL_SEARCH DEBUG] Successfully submitted all trial data');
          } else {
            console.warn('[VISUAL_SEARCH DEBUG] Data submission failed, but saved locally:', submission.error);
          }
        } catch (error) {
          console.error('[VISUAL_SEARCH DEBUG] Error during data submission:', error);
        }
      }
    }
  });

  // Check for session data on mount
  useEffect(() => {
    const initializeTask = async () => {
      try {
        // Check if we're in a session by looking for session data
        const sessionData = JSON.parse(sessionStorage.getItem('sessionData') || 'null');
        
        if (sessionData && sessionData.session_id) {
          // Session mode: use session data, no setup needed
          console.log('Visual Search: Running in session mode with data:', sessionData);
          setStudentInfo({
            name: sessionData.student_name || 'Session Student',
            id: sessionData.student_id || sessionData.session_id,
            shareData: sessionData.share_data !== false
          });
          setSessionStartTime(new Date().toISOString());
          
          // Initialize StudentResult for aggregated data collection
          const result = StudentResult.create('visual_search');
          setStudentResult(result);
          
          setIsInitializing(false);
        } else {
          // Standalone mode: use defaults, no setup needed
          console.log('Visual Search: Running in standalone mode');
          setStudentInfo({
            name: 'Anonymous',
            id: 'local',
            shareData: false
          });
          setSessionStartTime(new Date().toISOString());
          
          // Initialize StudentResult for standalone mode
          const result = StudentResult.create('visual_search');
          setStudentResult(result);
          
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Error initializing Visual Search task:', error);
        // Fallback to standalone mode
        setStudentInfo({
          name: 'Anonymous',
          id: 'local',
          shareData: false
        });
        setSessionStartTime(new Date().toISOString());
        
        // Initialize StudentResult for fallback mode
        const result = StudentResult.create('visual_search');
        setStudentResult(result);
        
        setIsInitializing(false);
      }
    };

    initializeTask();
  }, []);

  // Auto-start practice when ready
  useEffect(() => {
    if (!isInitializing && sessionStartTime && phase === 'setup') {
      console.log('Auto-starting Visual Search practice');
      setTimeout(() => startPractice(), 100);
    }
  }, [isInitializing, sessionStartTime, phase, startPractice]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      
      const key = e.key.toLowerCase();
      const validKeys = ['j', 'k'];
      
      if (validKeys.includes(key)) {
        // Pass currentStimulus to ensure we're recording response against the correct trial
        handleResponse(key, Date.now(), currentStimulus);
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [awaitingResponse, handleResponse, currentStimulus]);

  // Setup handlers
  const startTask = (info) => {
    setStudentInfo(info);
    setSessionStartTime(new Date().toISOString());
    startPractice();
  };

  const startMainExperiment = () => {
    startMainTask();
  };

  const handleTaskComplete = () => {
    navigate('/');
  };

  // Show loading/initialization screen
  if (isInitializing || phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Visual Search task...</p>
        </div>
      </div>
    );
  }

  if (phase === "practice_complete") {
    return <PracticeComplete results={practiceResults} onContinue={startMainExperiment} config={VISUAL_SEARCH_PRACTICE_CONFIG} />;
  }

  if (phase === "complete") {
    return <TaskComplete results={results} studentInfo={studentInfo} config={VISUAL_SEARCH_COMPLETE_CONFIG} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-slate-900">
                Visual Search Task
              </h1>
            </div>
            <p className="text-slate-600">
              {phase === "practice" ? "Practice Trials" : "Main Task"}
            </p>
            
            {/* Progress */}
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Trial {currentTrial + 1} of {totalTrials}</span>
                <span>{Math.round(((currentTrial + 1) / totalTrials) * 100)}%</span>
              </div>
              <Progress value={((currentTrial + 1) / totalTrials) * 100} className="h-2" />
            </div>
          </div>

          {/* Stimulus Display */}
          <StimulusDisplay 
            stimulus={currentStimulus}
            showStimulus={showStimulus}
            showingFixation={showingFixation}
            interTrialDelay={inInterTrialDelay}
            isPractice={phase === "practice"}
            colors={COLORS}
          />

          {/* Instructions */}
          <div className="text-center mt-8">
            <div className="bg-slate-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-slate-700 mb-3">
                Press <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">J</kbd> if target present, 
                <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono ml-2">K</kbd> if target absent
              </p>
              <p className="text-xs text-slate-500">
                Target: {phase === "practice" ? "Blue vertical line" : "Look for blue vertical or orange horizontal lines"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
