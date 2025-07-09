import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StudentResult } from "@/entities/StudentResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTrialManager } from "@/hooks/useTrialManager";

import { POSNER_CONFIG, POSNER_PRACTICE_CONFIG, POSNER_COMPLETE_CONFIG } from "@/components/ui/taskConfigs";
import StimulusDisplay from "@/components/posner/StimulusDisplay";
import TaskComplete from "@/components/ui/TaskComplete";
import PracticeComplete from "@/components/ui/PracticeComplete";

const TOTAL_TRIALS = 100;
const PRACTICE_TRIALS = 16;
const RESPONSE_TIMEOUT = 2000;
const FIXATION_DURATION = 500;

// SOA values (stimulus onset asynchrony) - time from cue to target
const SOA_VALUES = [50, 100, 200, 300, 500];

// Cue types and locations
const CUE_TYPES = ['endogenous', 'exogenous', 'neutral'];
const LOCATIONS = ['left', 'right'];

export default function PosnerTask() {
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "", shareData: false });
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentResult, setStudentResult] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('fixation'); // 'fixation', 'cue', 'delay', 'target'
  const [showingCue, setShowingCue] = useState(false);
  const [showingTarget, setShowingTarget] = useState(false);
  const [stimulusOnsetTime, setStimulusOnsetTime] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  // Initialize student info based on mode
  useEffect(() => {
    const initializeStudentInfo = () => {
      if (sessionId && window.sessionData) {
        setStudentInfo({
          name: window.sessionData.name || 'Session Participant',
          id: window.sessionData.id || sessionId,
          shareData: true
        });
      } else {
        setStudentInfo({
          name: 'Anonymous User',
          id: `standalone_${Date.now()}`,
          shareData: false
        });
      }
      setSessionStartTime(new Date().toISOString());
      
      const result = StudentResult.create('posner');
      setStudentResult(result);
      
      setIsLoading(false);
    };

    setTimeout(initializeStudentInfo, 100);
  }, [sessionId]);

  // Generate trial sequences
  const generateTrials = useCallback((numTrials) => {
    const trials = [];
    const trialsPerCondition = Math.floor(numTrials / (CUE_TYPES.length * SOA_VALUES.length));
    
    // Generate balanced trials for each combination of cue type and SOA
    CUE_TYPES.forEach(cueType => {
      SOA_VALUES.forEach(soa => {
        for (let i = 0; i < trialsPerCondition; i++) {
          const cueLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
          const targetLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
          const targetPresent = Math.random() > 0.2; // 80% target present trials
          
          // Determine cue validity
          let cueValidity;
          if (cueType === 'neutral') {
            cueValidity = 'neutral';
          } else if (cueLocation === targetLocation) {
            cueValidity = 'valid';
          } else {
            cueValidity = 'invalid';
          }
          
          trials.push({
            cueType,
            cueLocation,
            targetLocation: targetPresent ? targetLocation : null,
            targetPresent,
            soa,
            cueValidity,
            correctResponse: targetPresent ? 'space' : 'none'
          });
        }
      });
    });
    
    // Fill remaining trials and shuffle
    while (trials.length < numTrials) {
      const randomCondition = trials[Math.floor(Math.random() * trials.length)];
      trials.push({...randomCondition});
    }
    
    // Shuffle trials
    for (let i = trials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trials[i], trials[j]] = [trials[j], trials[i]];
    }
    
    return trials.slice(0, numTrials);
  }, []);

  const practiceTrials = useMemo(() => generateTrials(PRACTICE_TRIALS), [generateTrials]);
  const mainTrials = useMemo(() => generateTrials(TOTAL_TRIALS), [generateTrials]);

  // Custom trial phases for Posner paradigm
  const runPosnerTrial = useCallback((trial, startAcceptingResponses, handleResponse) => {
    setCurrentStimulus(trial);
    setCurrentPhase('fixation');
    setShowingCue(false);
    setShowingTarget(false);
    setStimulusOnsetTime(null);
    
    // Phase 1: Fixation period
    setTimeout(() => {
      setCurrentPhase('cue');
      setShowingCue(true);
      
      // Phase 2: Cue period (brief)
      setTimeout(() => {
        setShowingCue(false);
        setCurrentPhase('delay');
        
        // Phase 3: SOA delay period
        setTimeout(() => {
          if (trial.targetPresent) {
            setCurrentPhase('target');
            setShowingTarget(true);
            setStimulusOnsetTime(Date.now()); // Record when stimulus actually appears
          }
          
          // NOW we start accepting responses (for both target and catch trials)
          console.log(`[Posner] Starting to accept responses for trial ${trial.targetPresent ? 'with target' : 'catch trial'} at SOA=${trial.soa}ms`);
          startAcceptingResponses();
          
          // Set our own timeout for this trial
          setTimeout(() => {
            handleResponse('timeout', Date.now(), trial);
          }, RESPONSE_TIMEOUT);
          
        }, trial.soa);
      }, 100); // Brief cue duration
    }, FIXATION_DURATION);
  }, []);

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
    totalTrials,
    startAcceptingResponses,
    stopAcceptingResponses
  } = useTrialManager({
    practiceTrials,
    mainTrials,
    responseTimeout: RESPONSE_TIMEOUT,
    interTrialDelay: (phase) => 800 + Math.random() * 400, // Variable ITI: 800-1200ms
    fixationDelay: 0, // We handle timing manually
    showFixation: true,
    manualResponseControl: true, // We handle response timing ourselves
    onTrialStart: (trial, trialIndex, currentPhase) => {
      runPosnerTrial(trial, startAcceptingResponses, handleResponse);
    },
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      // Determine if response was correct
      let isCorrect = false;
      if (trial.targetPresent) {
        // Target present: correct response is 'space'
        isCorrect = result.response === 'space';
      } else {
        // Target absent: correct response is no response (timeout)
        isCorrect = result.response === 'timeout';
      }
      
      // Calculate correct reaction time from stimulus onset
      let actualRT = result.reaction_time;
      if (trial.targetPresent && stimulusOnsetTime && result.response === 'space') {
        // For target present trials with space responses, calculate from stimulus onset
        const responseTimestamp = typeof result.timestamp === 'string' ? new Date(result.timestamp).getTime() : result.timestamp || Date.now();
        actualRT = responseTimestamp - stimulusOnsetTime;
      } else if (trial.targetPresent && result.response === 'timeout') {
        // Target present but timeout - RT is the timeout duration
        actualRT = RESPONSE_TIMEOUT;
      } else if (!trial.targetPresent) {
        // For target absent trials, use the original RT calculation
        actualRT = result.reaction_time;
      }
      
      console.log(`[POSNER DEBUG] Trial ${trialIndex + 1} Ended:`, {
        phase: currentPhase,
        cueType: trial.cueType,
        cueValidity: trial.cueValidity,
        targetPresent: trial.targetPresent,
        targetLocation: trial.targetLocation,
        soa: trial.soa,
        participantResponse: result.response,
        isCorrect: isCorrect,
        responseTime: actualRT,
        stimulusOnset: stimulusOnsetTime,
        originalRT: result.reaction_time
      });

      const resultData = {
        name: studentInfo.name,
        id: studentInfo.id,
        sessionStartTime,
        trial_number: trialIndex + 1,
        phase: currentPhase,
        cueType: trial.cueType,
        cueLocation: trial.cueLocation,
        cueValidity: trial.cueValidity,
        targetLocation: trial.targetLocation,
        targetPresent: trial.targetPresent,
        soa: trial.soa,
        correctResponse: trial.targetPresent ? 'space' : 'timeout',
        response: result.response,
        reaction_time: actualRT, // Use corrected RT
        is_correct: isCorrect,
        timestamp: new Date().toISOString()
      };

      // Add to batch for optimized storage
      if (studentResult) {
        studentResult.addTrial(resultData);
      }

      // Reset display state for next trial
      setShowingCue(false);
      setShowingTarget(false);
      setCurrentPhase('fixation');
      setStimulusOnsetTime(null);

      return resultData;
    },
    onPhaseComplete: async (phase, phaseResults) => {
      // Practice results are handled locally, no submission needed
      if (phase === 'practice') {
        console.log('Practice phase complete, showing practice results');
      }
    },
    onExperimentComplete: async (allResults) => {
      if (studentResult) {
        await studentResult.submit();
      }
    }
  });

  // Auto-start when initialized
  useEffect(() => {
    if (!isLoading && sessionStartTime && phase === 'setup') {
      console.log('Auto-starting Posner practice');
      startPractice();
    }
  }, [isLoading, sessionStartTime, phase, startPractice]);

  // Handle keyboard responses
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only respond if we're awaiting responses
      if (!awaitingResponse) {
        if (event.code === 'Space') {
          event.preventDefault(); // Always prevent scrolling
          console.log(`[Posner] Spacebar pressed but not accepting responses yet (awaitingResponse=${awaitingResponse})`);
        }
        return;
      }

      const key = event.code;
      if (key === 'Space') {
        event.preventDefault();
        const trial = getCurrentTrial();
        console.log(`[Posner] Spacebar response recorded for trial`, trial);
        handleResponse('space', Date.now(), trial);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [awaitingResponse, handleResponse, getCurrentTrial]);

  // Note: Response timeout is now handled in onTrialStart callback
  // No need for a separate useEffect since we manage timing manually

  if (isLoading || phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-slate-600">Loading Posner Cueing Task...</p>
        </div>
      </div>
    );
  }

  if (phase === 'practice_complete') {
    return (
      <PracticeComplete
        config={POSNER_PRACTICE_CONFIG}
        results={practiceResults}
        onContinue={startMainTask}
      />
    );
  }

  if (phase === 'complete') {
    return (
      <TaskComplete
        config={POSNER_COMPLETE_CONFIG}
        results={results}
        studentInfo={studentInfo}
        onNavigateHome={() => navigate('/')}
        taskType="posner"
      />
    );
  }

  // Main task display
  const progress = ((currentTrial + 1) / totalTrials) * 100;
  const trial = getCurrentTrial();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Target className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>
                  {phase === 'practice' ? 'Practice' : 'Main Task'} - Trial {currentTrial + 1} of {totalTrials}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Stimulus Display */}
      <StimulusDisplay
        trial={trial}
        showingFixation={showingFixation}
        showStimulus={showStimulus}
        showingCue={showingCue}
        showingTarget={showingTarget}
        currentPhase={currentPhase}
      />

      {/* Feedback */}
      {feedback && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Card className={`${feedback.correct ? 'border-green-500' : 'border-red-500'}`}>
            <CardContent className="p-4 text-center">
              <p className={`font-bold ${feedback.correct ? 'text-green-700' : 'text-red-700'}`}>
                {feedback.correct ? 'Correct!' : 'Incorrect'}
              </p>
              {feedback.reactionTime && (
                <p className="text-sm text-gray-600">
                  Response time: {feedback.reactionTime}ms
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
