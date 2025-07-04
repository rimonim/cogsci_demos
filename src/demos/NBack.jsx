import React, { useState, useEffect, useCallback, useMemo } from "react";
import { NBackResult } from "@/entities/NBackResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTrialManager } from "@/hooks/useTrialManager";

import TaskSetup from "@/components/ui/TaskSetup";
import { NBACK_CONFIG, NBACK_PRACTICE_CONFIG, NBACK_COMPLETE_CONFIG } from "@/components/ui/taskConfigs";
import StimulusDisplay from "@/components/nback/StimulusDisplay";
import TaskComplete from "@/components/ui/TaskComplete";
import PracticeComplete from "@/components/ui/PracticeComplete";

const TOTAL_TRIALS = 60;
const PRACTICE_TRIALS = 15;
const RESPONSE_TIMEOUT = 2500;
const N_BACK_LEVEL = 2; // 2-back task

export default function NBackTask() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [studentInfo, setStudentInfo] = useState({ name: "Anonymous", id: "local", shareData: false });
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const navigate = useNavigate();

  // Generate trial sequences for N-back
  const generateTrials = useCallback((numTrials) => {
    const trials = [];
    const letters = ['F', 'H', 'K', 'L']; // Smaller set of 4 letters for more matches
    const letterSequence = [];
    
    // Start with random letters for first N_BACK_LEVEL trials (these can't be targets)
    for (let i = 0; i < N_BACK_LEVEL; i++) {
      letterSequence.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    
    // Generate remaining trials with controlled number of targets
    const targetTrialPositions = [];
    const desiredTargetCount = Math.floor((numTrials - N_BACK_LEVEL) * 0.25); // ~25% of possible target trials
    
    for (let i = N_BACK_LEVEL; i < numTrials; i++) {
      const shouldBeTarget = targetTrialPositions.length < desiredTargetCount && 
                            Math.random() < 0.3; // 30% chance of creating a target
      
      if (shouldBeTarget) {
        // Make this a target by copying the letter from N_BACK_LEVEL positions back
        letterSequence.push(letterSequence[i - N_BACK_LEVEL]);
        targetTrialPositions.push(i);
      } else {
        // Make this a non-target by ensuring it's different from N_BACK_LEVEL positions back
        let newLetter;
        const letterToAvoid = letterSequence[i - N_BACK_LEVEL];
        const availableLetters = letters.filter(l => l !== letterToAvoid);
        newLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        letterSequence.push(newLetter);
      }
    }
    
    // Create trial objects with correct target information and double check each trial
    for (let i = 0; i < numTrials; i++) {
      const letter = letterSequence[i];
      // Explicitly determine if this is a target by comparing with N_BACK_LEVEL positions back
      const isTarget = i >= N_BACK_LEVEL && letter === letterSequence[i - N_BACK_LEVEL];
      
      // Debug log for each trial
      if (i < 10) { // Only log first 10 trials to avoid spam
        console.log(`Trial ${i}: letter=${letter}, previous=${i >= N_BACK_LEVEL ? letterSequence[i - N_BACK_LEVEL] : 'none'}, isTarget=${isTarget}`);
      }
      
      trials.push({
        letter: letter,
        isTarget: isTarget,
        correctResponse: isTarget ? "match" : "no_response",
        nBackLevel: N_BACK_LEVEL,
        previousLetter: i >= N_BACK_LEVEL ? letterSequence[i - N_BACK_LEVEL] : null // For debugging
      });
    }
    
    // Final validation - check number of targets and log each target for debugging
    const actualTargets = trials.filter(t => t.isTarget);
    console.log('Generated sequence:', letterSequence);
    console.log('Target trials:', actualTargets.map(t => trials.indexOf(t)));
    
    return trials;
  }, []);

  const practiceTrials = useMemo(() => generateTrials(PRACTICE_TRIALS), [generateTrials]);
  const mainTrials = useMemo(() => generateTrials(TOTAL_TRIALS), [generateTrials]);

  // Debug: Log trial information
  console.log('Practice trials generated:', practiceTrials.length, 'targets:', practiceTrials.filter(t => t.isTarget).length);
  console.log('Main trials generated:', mainTrials.length, 'targets:', mainTrials.filter(t => t.isTarget).length);

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
    // Faster N-Back timing: 500ms stimulus + 2000ms inter-trial = 2.5 seconds total
    interTrialDelay: { practice: 1500, task: 2000 },
    fixationDelay: 0, // No fixation delay
    showFixation: false, // Remove fixation cross
    stimulusDuration: 500, // Show stimulus for only 500ms, then blank screen for remaining response time
    
    onTrialStart: (trial, trialIndex, currentPhase) => {
      setCurrentLetter(trial.letter);
      setFeedback(null);
    },
    
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      // Handle different response types correctly
      const userResponse = result.response || "no_response";
      const pressedSpace = userResponse === "match";
      const noResponse = userResponse === "no_response" || userResponse === "timeout";
      
      // Signal detection categorization:
      // Hit: Target present (isTarget=true) and user responded (pressedSpace=true)
      // Miss: Target present (isTarget=true) and user didn't respond (noResponse=true)
      // False Alarm: Target absent (isTarget=false) and user responded (pressedSpace=true)
      // Correct Rejection: Target absent (isTarget=false) and user didn't respond (noResponse=true)
      
      const isCorrect = (pressedSpace && trial.isTarget) || (noResponse && !trial.isTarget);
      
      // Log response classification
      const responseType = 
        trial.isTarget && pressedSpace ? "HIT" :
        trial.isTarget && noResponse ? "MISS" :
        !trial.isTarget && pressedSpace ? "FALSE ALARM" :
        "CORRECT REJECTION";
      
      console.log(`Trial ${trialIndex+1} - Letter: ${trial.letter}, isTarget: ${trial.isTarget}, ` +
                 `Response: ${userResponse}, Classification: ${responseType}, Correct: ${isCorrect}`);
      
      // Enhanced result object
      const enhancedResult = {
        ...result,
        student_name: studentInfo.name,
        student_id: studentInfo.id,
        trial_number: trialIndex + 1,
        letter: trial.letter,
        is_target: trial.isTarget,
        n_back_level: trial.nBackLevel,
        correct_response: trial.correctResponse,
        participant_response: userResponse,
        is_correct: isCorrect,
        response_type: responseType, // Add signal detection classification
        session_start_time: sessionStartTime,
        task_type: 'nback',
        share_data: studentInfo.shareData
      };

      // Show feedback for practice trials (only after the first N_BACK_LEVEL trials)
      if (currentPhase === 'practice' && trialIndex >= N_BACK_LEVEL) {
        let feedbackText;
        
        // For debug, log the response details
        console.log('Feedback details:', {
          trial: trialIndex,
          letter: trial.letter,
          isTarget: trial.isTarget,
          userResponse: userResponse,
          pressedSpace: pressedSpace,
          isCorrect: isCorrect
        });
        
        if (userResponse === 'timeout') {
          feedbackText = trial.isTarget ? 'Miss! (timeout)' : 'Correct! (no match)';
        } else if (trial.isTarget === true) {
          // Target present case
          feedbackText = pressedSpace ? 'Hit!' : 'Miss!';
        } else {
          // Target absent case
          feedbackText = pressedSpace ? 'False Alarm!' : 'Correct Rejection!';
        }
        setFeedback({ show: true, text: feedbackText, correct: isCorrect });
      }

      // Save to API for main task
      if (currentPhase === 'task') {
        try {
          NBackResult.create(enhancedResult, studentInfo.shareData);
        } catch (error) {
          console.error("Error saving result:", error);
        }
      }

      return enhancedResult;
    },
    
    onPhaseComplete: (completedPhase, phaseResults) => {
      console.log(`${completedPhase} phase completed with ${phaseResults.length} trials`);
    },
    
    onExperimentComplete: (mainResults, practiceResults) => {
      console.log('N-Back experiment completed!', { mainResults, practiceResults });
    }
  });

  // Check for session data on component mount
  useEffect(() => {
    if (sessionId && window.sessionData) {
      console.log('Found session data:', window.sessionData);
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
        console.log('Session mode initialized for:', sessionStudentInfo.name);
      }
    } else {
      // No session data - standalone mode
      console.log('No session data found, starting N-Back in standalone mode');
      setIsSessionMode(false);
      setSessionStartTime(new Date().toISOString());
    }
  }, [sessionId]);

  // Auto-start practice when ready
  useEffect(() => {
    if (sessionStartTime && phase === 'setup') {
      console.log('Auto-starting N-Back practice');
      setTimeout(() => startPractice(), 100);
    }
  }, [sessionId, startPractice]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handleResponse("match", Date.now());
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

  // Show loading while initializing
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading N-Back task...</p>
        </div>
      </div>
    );
  }

  if (phase === "practice_complete") {
    return <PracticeComplete onStartExperiment={startMainExperiment} config={NBACK_PRACTICE_CONFIG} results={practiceResults} />;
  }

  if (phase === "complete") {
    return <TaskComplete results={results} studentInfo={studentInfo} config={NBACK_COMPLETE_CONFIG} />;
  }

  const progressTitle = phase === 'practice' ? 'Practice Trial' : 'Trial';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">{studentInfo.name}</span>
              </div>
              <div className="text-sm text-slate-600">
                {progressTitle} {currentTrial + 1} of {totalTrials}
              </div>
            </div>
            <Progress value={((currentTrial + 1) / totalTrials) * 100} className="h-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-2xl">
          <CardContent className="p-6">
            <StimulusDisplay
              showStimulus={showStimulus}
              currentLetter={currentLetter}
              awaitingResponse={awaitingResponse}
              feedback={feedback}
              showFixation={false} // Always false since we've disabled fixation
            />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <kbd className="px-3 py-1 bg-slate-100 rounded text-xs">SPACE</kbd>
              <span>Match (2-back)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
