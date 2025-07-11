import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StudentResult } from "@/entities/StudentResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTrialManager } from "@/hooks/useTrialManager";

import TaskSetup from "@/components/ui/TaskSetup";
import { MENTAL_ROTATION_CONFIG, MENTAL_ROTATION_PRACTICE_CONFIG, MENTAL_ROTATION_COMPLETE_CONFIG } from "@/components/ui/taskConfigs";
import StimulusDisplay from "@/components/mental-rotation/StimulusDisplay";
import TaskComplete from "@/components/ui/TaskComplete";
import PracticeComplete from "@/components/ui/PracticeComplete";

const TOTAL_TRIALS = 48; // Increased for more challenging task
const PRACTICE_TRIALS = 12; // More practice for harder task
const RESPONSE_TIMEOUT = 5000; // Longer timeout for more challenging stimuli

// Shape pairs for mental rotation - each base shape has a mirror image
const SHAPE_PAIRS = [
  { base: 'F', mirror: 'F_MIRROR' },
  { base: 'R', mirror: 'R_MIRROR' },
  { base: 'P', mirror: 'P_MIRROR' },
  { base: 'G', mirror: 'G_MIRROR' }
];

// Generate continuous rotation angles (0-360 degrees)
const generateRotationAngle = () => {
  // Generate angles in 15-degree increments for smoother difficulty progression
  const increment = 15;
  return Math.floor(Math.random() * (360 / increment)) * increment;
};

// Generate mental rotation stimuli with challenging shape pairs
const generateStimuli = () => {
  const stimuli = [];
  
  SHAPE_PAIRS.forEach(shapePair => {
    // Same shape trials - same shape at different rotations
    for (let i = 0; i < 8; i++) { // 8 trials per shape pair
      const leftRotation = generateRotationAngle();
      const rightRotation = generateRotationAngle();
      
      // Use the base shape for both sides
      stimuli.push({
        shapeType: shapePair.base,
        leftRotation: leftRotation,
        rightRotation: rightRotation,
        rightShapeType: shapePair.base,
        trialType: 'same',
        correct: 's'
      });
    }
    
    // Different shape trials - base shape vs its mirror image
    for (let i = 0; i < 8; i++) { // 8 trials per shape pair
      const leftRotation = generateRotationAngle();
      const rightRotation = generateRotationAngle();
      
      // Randomly decide which side gets the base vs mirror
      const useBaseOnLeft = Math.random() < 0.5;
      const leftShape = useBaseOnLeft ? shapePair.base : shapePair.mirror;
      const rightShape = useBaseOnLeft ? shapePair.mirror : shapePair.base;
      
      stimuli.push({
        shapeType: leftShape,
        leftRotation: leftRotation,
        rightRotation: rightRotation,
        rightShapeType: rightShape,
        trialType: 'different',
        correct: 'd'
      });
    }
  });
  
  return stimuli;
};

const ALL_STIMULI = generateStimuli();

export default function MentalRotationTask() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [studentInfo, setStudentInfo] = useState({ name: "Anonymous", id: "local", shareData: false });
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [studentResult, setStudentResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const navigate = useNavigate();

  // Generate trial sequences
  const generateTrials = useCallback((numTrials) => {
    const trials = [];
    const shuffledStimuli = [...ALL_STIMULI].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numTrials; i++) {
      trials.push(shuffledStimuli[i % shuffledStimuli.length]);
    }
    return trials;
  }, []);

  const practiceTrials = useMemo(() => generateTrials(PRACTICE_TRIALS), [generateTrials]);
  const mainTrials = useMemo(() => generateTrials(TOTAL_TRIALS), [generateTrials]);

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
    interTrialDelay: { practice: 1500, task: 800 }, // Longer delay for practice to show feedback
    fixationDelay: 800,
    showFixation: true,
    
    onTrialStart: (trial, trialIndex, currentPhase) => {
      setCurrentStimulus(trial);
      // Clear any previous feedback
      setFeedback(null);
    },
    
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      const isCorrect = result.response === trial.correct;
      
      // Enhanced result object with trial info
      const trialData = {
        trial_number: trialIndex + 1,
        shape_type: trial.shapeType,
        left_rotation: trial.leftRotation || 0, // Ensure 0 instead of blank/undefined
        right_rotation: trial.rightRotation || 0, // Ensure 0 instead of blank/undefined
        trial_type: trial.trialType,
        correct_response: trial.correct,
        participant_response: result.response,
        reaction_time: result.reaction_time,
        is_correct: isCorrect // Keep as boolean for practice complete calculations
      };

      // Collect trial data for main task (don't submit individually)
      if (currentPhase === 'task' && studentResult) {
        studentResult.addTrial(trialData);
        console.log(`[MENTAL_ROTATION DEBUG] Added trial ${trialIndex + 1} to collection. Total: ${studentResult.getTrialCount()}`);
      }

      // Show feedback for practice trials
      if (currentPhase === 'practice') {
        const feedbackText = result.response === 'timeout' ? 'Too Slow' : (isCorrect ? 'Correct!' : 'Incorrect');
        const feedbackObj = { show: true, text: feedbackText, correct: isCorrect };
        
        console.log(`[MENTAL_ROTATION DEBUG] Setting feedback:`, feedbackObj);
        setFeedback(feedbackObj);
      }

      return { ...result, ...trialData };
    },
    
    onPhaseComplete: (completedPhase, phaseResults) => {
      console.log(`${completedPhase} phase completed with ${phaseResults.length} trials`);
    },
    
    onExperimentComplete: async (mainResults, practiceResults) => {
      console.log('Mental rotation experiment completed!', { 
        mainTrials: mainResults.length, 
        practiceTrials: practiceResults.length 
      });
      
      // Submit all collected trial data as a single student record
      if (studentResult && mainResults.length > 0) {
        try {
          console.log(`[MENTAL_ROTATION DEBUG] Submitting ${studentResult.getTrialCount()} trials for student`);
          const submission = await studentResult.submit();
          
          if (submission.success) {
            console.log('[MENTAL_ROTATION DEBUG] Successfully submitted all trial data');
          } else {
            console.warn('[MENTAL_ROTATION DEBUG] Data submission failed, but saved locally:', submission.error);
          }
        } catch (error) {
          console.error('[MENTAL_ROTATION DEBUG] Error during data submission:', error);
        }
      }
    }
  });

  // Check for session data on component mount
  useEffect(() => {
    if (sessionId && window.sessionData) {
      console.log('Found session data:', window.sessionData);
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
        const result = StudentResult.create('mental-rotation');
        setStudentResult(result);
        
        console.log('Session mode initialized for:', sessionStudentInfo.name);
      }
    } else {
      // No session data - standalone mode
      console.log('No session data found, starting Mental Rotation in standalone mode');
      setIsSessionMode(false);
      setSessionStartTime(new Date().toISOString());
      
      // Initialize StudentResult for standalone mode
      const result = StudentResult.create('mental-rotation');
      setStudentResult(result);
    }
  }, [sessionId]);

  // Auto-start practice when ready
  useEffect(() => {
    if (sessionStartTime && phase === 'setup') {
      console.log('Auto-starting Mental Rotation practice');
      setTimeout(() => startPractice(), 100);
    }
  }, [sessionId, startPractice]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      
      const key = e.key.toLowerCase();
      const validKeys = ['s', 'd'];
      
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

  // Show loading while initializing
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Mental Rotation task...</p>
        </div>
      </div>
    );
  }

  if (phase === "practice_complete") {
    return <PracticeComplete results={practiceResults} onContinue={startMainExperiment} config={MENTAL_ROTATION_PRACTICE_CONFIG} />;
  }

  if (phase === "complete") {
    return <TaskComplete results={results} studentInfo={studentInfo} config={MENTAL_ROTATION_COMPLETE_CONFIG} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{studentInfo.name}</h3>
              <p className="text-xs text-slate-500">{studentInfo.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">
              {phase === "practice" ? "Practice" : "Task"} Trial {currentTrial + 1} of {totalTrials}
            </p>
            <div className="w-48 mt-1">
              <Progress value={((currentTrial + 1) / totalTrials) * 100} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-4xl bg-white border-slate-200">
          <CardContent className="p-16">
            <StimulusDisplay
              stimulus={currentStimulus}
              showStimulus={showStimulus}
              showingFixation={showingFixation}
              interTrialDelay={inInterTrialDelay}
              isPractice={phase === "practice"}
              feedback={feedback}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
