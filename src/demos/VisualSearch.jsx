import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TaskSetup from "@/components/visual-search/TaskSetup";
import StimulusDisplay from "@/components/visual-search/StimulusDisplay";
import TaskComplete from "@/components/visual-search/TaskComplete";
import PracticeComplete from "@/components/visual-search/PracticeComplete";

const TOTAL_TRIALS = 80; // 20 per condition (4 conditions)
const PRACTICE_TRIALS = 12;
const RESPONSE_TIMEOUT = 5000;

// Color-blind friendly colors
const COLORS = {
  blue: "#0066CC",
  orange: "#FF6600"
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
  const [phase, setPhase] = useState("setup"); // setup, practice, practice_complete, task, complete
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "", shareData: false });
  const [currentTrial, setCurrentTrial] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [trialStartTime, setTrialStartTime] = useState(null);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [practiceResults, setPracticeResults] = useState([]);
  const [results, setResults] = useState([]);
  const [trialSequence, setTrialSequence] = useState([]);
  const [practiceSequence, setPracticeSequence] = useState([]);
  const [showStimulus, setShowStimulus] = useState(false);
  const [interTrialDelay, setInterTrialDelay] = useState(false);
  
  // References to manage timers and prevent race conditions
  const timeoutsRef = React.useRef([]);
  const activePhaseRef = React.useRef(phase);
  const isAdvancingRef = React.useRef(false);
  const currentTrialRef = React.useRef(currentTrial);

  const navigate = useNavigate();

  useEffect(() => {
    if (phase === "practice") {
      const sequence = generateTrialSequence(PRACTICE_TRIALS);
      setPracticeSequence(sequence);
      setCurrentTrial(0);
    } else if (phase === "task") {
      const sequence = generateTrialSequence(TOTAL_TRIALS);
      setTrialSequence(sequence);
      setCurrentTrial(0);
    }
  }, [phase]);

  // Handle keyboard responses
  const handleKeyPress = useCallback((event) => {
    // Ignore keypresses if we're not in practice or task phase
    const currentPhase = activePhaseRef.current;
    if (currentPhase !== "practice" && currentPhase !== "task") {
      return;
    }
    
    // Ignore keypresses during inter-trial delay or when stimulus is not shown
    if (!showStimulus || interTrialDelay) {
      return;
    }
    
    // Ignore keypresses if we're already advancing to the next trial
    if (isAdvancingRef.current) {
      return;
    }

    const key = event.key.toLowerCase();
    const validKeys = ['j', 'k'];
    
    if (!validKeys.includes(key)) {
      return;
    }

    const reactionTime = Date.now() - trialStartTime;
    const currentSequence = currentPhase === "practice" ? practiceSequence : trialSequence;
    const currentTrialValue = currentTrialRef.current;
    
    // Guard against invalid current trial
    if (currentTrialValue >= currentSequence.length || !currentSequence[currentTrialValue]) {
      console.error('Invalid current trial:', currentTrialValue, 'max:', currentSequence.length);
      return;
    }
    
    const stimulus = currentSequence[currentTrialValue];
    const isCorrect = key === stimulus.correctResponse;

    const trialData = {
      student_name: studentInfo.name,
      student_id: studentInfo.id,
      trial_number: currentTrialValue + 1,
      condition: stimulus.condition,
      set_size: stimulus.setSize,
      target_present: stimulus.targetPresent,
      correct_response: stimulus.correctResponse,
      participant_response: key,
      reaction_time: reactionTime,
      is_correct: isCorrect,
      session_start_time: sessionStartTime,
      timestamp: new Date().toISOString(),
      task_type: "visual_search",
      share_data: studentInfo.shareData
    };

    if (phase === "practice") {
      setPracticeResults(prev => [...prev, trialData]);
    } else {
      setResults(prev => [...prev, trialData]);
    }

    nextTrial();
  }, [phase, showStimulus, interTrialDelay, currentTrial, trialStartTime, practiceSequence, trialSequence, studentInfo, sessionStartTime]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      // Clean up all timeouts when component unmounts
      clearAllTimeouts();
    };
  }, [handleKeyPress]);



  // Keep refs in sync with state
  useEffect(() => { activePhaseRef.current = phase; }, [phase]);
  useEffect(() => { currentTrialRef.current = currentTrial; }, [currentTrial]);

  // Helper to safely clear all timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };

  // Handle advancing to the next trial with safeguards
  const nextTrial = () => {
    const currentTrialValue = currentTrialRef.current;
    
    // Prevent multiple calls to nextTrial
    if (isAdvancingRef.current) {
      return;
    }
    
    // Mark as advancing and stop showing stimulus
    isAdvancingRef.current = true;
    setShowStimulus(false);
    setInterTrialDelay(true);
    
    // Use the current phase and trial from refs to avoid stale closures
    const currentPhase = activePhaseRef.current;
    const currentTrialAtTimeout = currentTrialRef.current;
    
    const isInPractice = currentPhase === "practice";
    const sequence = isInPractice ? practiceSequence : trialSequence;
    const totalTrials = isInPractice ? PRACTICE_TRIALS : TOTAL_TRIALS;
    
    // Check if we've completed all trials for the current phase
    if (currentTrialAtTimeout + 1 >= totalTrials || currentTrialAtTimeout + 1 >= sequence.length) {
      setTimeout(() => {
        if (isInPractice) {
          setPhase("practice_complete");
        } else {
          setPhase("complete");
        }
        isAdvancingRef.current = false;
      }, 500);
    } else {
      // Advance to next trial if we haven't completed all trials
      setCurrentTrial(prev => prev + 1);
      
      // Short delay before clearing inter-trial delay and starting next trial
      setTimeout(() => {
        setInterTrialDelay(false);
        isAdvancingRef.current = false;
        
        setTimeout(() => {
          startTrial();
        }, 100);
      }, 500);
    }
  };

  const startTrial = () => {
    const currentTrialValue = currentTrialRef.current;
    
    // Don't start a new trial if we're not in practice or task phase
    if (activePhaseRef.current !== "practice" && activePhaseRef.current !== "task") {
      return;
    }
    
    // Make sure we're not already advancing to the next trial
    if (isAdvancingRef.current) {
      return;
    }
    
    const currentPhase = activePhaseRef.current;
    const currentSequence = currentPhase === "practice" ? practiceSequence : trialSequence;
    
    // Check for valid current trial index
    if (currentTrialValue < 0 || currentTrialValue >= currentSequence.length) {
      console.error(`Invalid trial index: ${currentTrialValue}, max: ${currentSequence.length - 1}`);
      
      // If we somehow got an invalid trial index, move to the appropriate completion phase
      if (currentPhase === "practice") {
        setPhase("practice_complete");
      } else {
        setPhase("complete");
      }
      return;
    }
    
    const stimulus = currentSequence[currentTrialValue];
    
    // Guard against invalid stimulus
    if (!stimulus) {
      console.error('No stimulus found for trial:', currentTrialValue);
      return;
    }
    
    setCurrentStimulus(stimulus);
    
    // Clear any existing timeouts
    clearAllTimeouts();
    
    // Show fixation for 500ms, then stimulus
    const fixationTimeout = setTimeout(() => {
      // Double-check we're still in the right phase
      if (activePhaseRef.current !== "practice" && activePhaseRef.current !== "task") {
        return;
      }
      
      // Set the trial start time and show the stimulus
      const now = Date.now();
      setTrialStartTime(now);
      setShowStimulus(true);
      
      // Auto-advance if no response (timeout)
      const responseTimeout = setTimeout(() => {
        // Only record timeout if we're still showing the stimulus
        if (activePhaseRef.current === "practice" || activePhaseRef.current === "task") {
          // Check again if we're advancing to avoid race conditions
          if (isAdvancingRef.current) {
            return;
          }
          
          const currentPhaseAtTimeout = activePhaseRef.current;
          const sequenceAtTimeout = currentPhaseAtTimeout === "practice" ? practiceSequence : trialSequence;
          const currentTrialAtTimeout = currentTrialRef.current;
          
          // Double check that the trial is still valid
          if (currentTrialAtTimeout >= sequenceAtTimeout.length) {
            console.error('Invalid trial at timeout, skipping response recording');
            return;
          }
          
          const stimulusAtTimeout = sequenceAtTimeout[currentTrialAtTimeout];
          
          const timeoutData = {
            student_name: studentInfo.name,
            student_id: studentInfo.id,
            trial_number: currentTrialAtTimeout + 1,
            condition: stimulusAtTimeout.condition,
            set_size: stimulusAtTimeout.setSize,
            target_present: stimulusAtTimeout.targetPresent,
            correct_response: stimulusAtTimeout.correctResponse,
            participant_response: "timeout",
            reaction_time: RESPONSE_TIMEOUT,
            is_correct: false,
            session_start_time: sessionStartTime,
            timestamp: new Date().toISOString(),
            task_type: "visual_search",
            share_data: studentInfo.shareData
          };

          if (currentPhaseAtTimeout === "practice") {
            setPracticeResults(prev => [...prev, timeoutData]);
          } else {
            setResults(prev => [...prev, timeoutData]);
          }

          nextTrial();
        }
      }, RESPONSE_TIMEOUT);
      timeoutsRef.current.push(responseTimeout);
    }, 500);
    timeoutsRef.current.push(fixationTimeout);
  };

  // Clear all timeouts when phase completes
  useEffect(() => {
    if (phase === "practice_complete" || phase === "complete") {
      clearAllTimeouts();
    }
  }, [phase]);

  const handleSetupComplete = (info) => {
    setStudentInfo(info);
    setSessionStartTime(new Date().toISOString());
    setPhase("practice");
  };

  const handlePracticeComplete = () => {
    setPhase("task");
  };

  const handleStartTask = () => {
    setCurrentTrial(0);
    startTrial();
  };

  const handleTaskComplete = async () => {
    // Save results and navigate
    try {
      // Here we would integrate with your existing data saving logic
      // For now, just save to localStorage
      const existingResults = JSON.parse(localStorage.getItem('visualSearchResults') || '[]');
      const newResults = [...existingResults, ...results];
      localStorage.setItem('visualSearchResults', JSON.stringify(newResults));
      
      // If user opted to share data, send to API
      if (studentInfo.shareData) {
        for (const result of results) {
          try {
            const response = await fetch('/api/record', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result)
            });
            
            if (!response.ok) {
              // In development mode, this endpoint might not exist, which is expected
              console.info(`API response: ${response.status} - This is expected in development mode`);
            }
          } catch (error) {
            // In development, this may fail but we don't need to show errors
            console.info('API not available in development mode:', error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
    
    navigate('/');
  };

  // Handle phase changes and trial initialization
  useEffect(() => {
    // Clear all timeouts when phase changes to avoid stale callbacks
    clearAllTimeouts();
    
    // Stop showing stimulus and reset flags when phase changes to complete
    if (phase === "practice_complete" || phase === "complete") {
      setShowStimulus(false);
      setInterTrialDelay(false);
      isAdvancingRef.current = false;
      return;
    }
    
    // Start first trial when entering practice or task phase
    if (phase === "practice" || phase === "task") {
      // Task will start when sequence is ready
    }
  }, [phase]); // Only depend on phase, not the sequences
  
  // Separate effect to start trials when sequences are ready
  useEffect(() => {
    if (
      (phase === "practice" && currentTrial === 0 && practiceSequence.length > 0) ||
      (phase === "task" && currentTrial === 0 && trialSequence.length > 0)
    ) {
      // Short delay to ensure state is settled
      const timer = setTimeout(() => startTrial(), 100);
      timeoutsRef.current.push(timer);
    }
  }, [phase, practiceSequence.length, trialSequence.length, currentTrial]);

  // Calculate values for rendering
  const currentSequence = phase === "practice" ? practiceSequence : trialSequence;
  const totalTrialsForPhase = phase === "practice" ? PRACTICE_TRIALS : TOTAL_TRIALS;
  const trialProgress = Math.max(0, Math.min(currentTrial + 1, totalTrialsForPhase));
  const progressPercentage = totalTrialsForPhase > 0 ? Math.min((trialProgress / totalTrialsForPhase) * 100, 100) : 0;

  if (phase === "setup") {
    return <TaskSetup onComplete={handleSetupComplete} />;
  }

  if (phase === "practice_complete") {
    return (
      <PracticeComplete 
        results={practiceResults}
        onContinue={handlePracticeComplete}
      />
    );
  }

  if (phase === "complete") {
    return (
      <TaskComplete 
        results={results}
        onComplete={handleTaskComplete}
      />
    );
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
                <span>Trial {currentTrial + 1} of {totalTrialsForPhase}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Stimulus Display */}
          <StimulusDisplay 
            stimulus={currentStimulus}
            showStimulus={showStimulus}
            interTrialDelay={interTrialDelay}
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
