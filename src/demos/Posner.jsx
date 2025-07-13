import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StudentResult } from "@/entities/StudentResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMultiPhaseTrialManager } from "@/hooks/useMultiPhaseTrialManager";

import { POSNER_CONFIG, POSNER_PRACTICE_CONFIG, POSNER_COMPLETE_CONFIG } from "@/components/ui/taskConfigs";
import StimulusDisplay from "@/components/posner/StimulusDisplay";
import TaskComplete from "@/components/ui/TaskComplete";
import PracticeComplete from "@/components/ui/PracticeComplete";

const TOTAL_TRIALS = 100;
const PRACTICE_TRIALS = 16;
const RESPONSE_TIMEOUT = 2000;
const FIXATION_DURATION = 500;

// SOA values (stimulus onset asynchrony) - time from cue to target
const SOA_VALUES = [50, 150, 300, 500];

// Cue types and locations
const CUE_TYPES = ['endogenous', 'exogenous'];
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
          let targetLocation;
          let cueValidity;
          
          if (cueType === 'endogenous') {
            // For endogenous cues: 80% valid, 20% invalid
            if (Math.random() < 0.8) {
              // Valid trial - target appears at cued location
              targetLocation = cueLocation;
              cueValidity = 'valid';
            } else {
              // Invalid trial - target appears at opposite location
              targetLocation = cueLocation === 'left' ? 'right' : 'left';
              cueValidity = 'invalid';
            }
          } else {
            // For exogenous cues: 50% valid, 50% invalid (random)
            targetLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            cueValidity = cueLocation === targetLocation ? 'valid' : 'invalid';
          }
          
          trials.push({
            cueType,
            cueLocation,
            targetLocation, // Target always present
            targetPresent: true, // Always have a target
            soa,
            cueValidity,
            correctResponse: 'space' // Always expect spacebar response
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
    
    console.log(`[POSNER] Generated ${trials.length} trials with conditions:`, {
      cueTypes: CUE_TYPES,
      soaValues: SOA_VALUES,
      sampleTrials: trials.slice(0, 3)
    });
    
    // Debug: Check validity distribution
    const endogenousTrials = trials.filter(t => t.cueType === 'endogenous');
    const exogenousTrials = trials.filter(t => t.cueType === 'exogenous');
    const endogenousValid = endogenousTrials.filter(t => t.cueValidity === 'valid').length;
    const exogenousValid = exogenousTrials.filter(t => t.cueValidity === 'valid').length;
    
    console.log(`[POSNER] Validity distribution:`, {
      endogenous: {
        total: endogenousTrials.length,
        valid: endogenousValid,
        validPercent: (endogenousValid / endogenousTrials.length * 100).toFixed(1) + '%'
      },
      exogenous: {
        total: exogenousTrials.length,
        valid: exogenousValid,
        validPercent: (exogenousValid / exogenousTrials.length * 100).toFixed(1) + '%'
      }
    });
    
    return trials.slice(0, numTrials);
  }, []);

  const practiceTrials = useMemo(() => generateTrials(PRACTICE_TRIALS), [generateTrials]);
  const mainTrials = useMemo(() => generateTrials(TOTAL_TRIALS), [generateTrials]);

  // Define phase sequence for Posner trials
  const phaseConfig = [
    { name: 'fixation', duration: FIXATION_DURATION, showStimulus: false, acceptResponses: false },
    { name: 'cue', duration: 200, showStimulus: true, acceptResponses: false }, // Increased from 100ms
    { name: 'delay', duration: null, showStimulus: false, acceptResponses: false }, // Duration auto-calculated from SOA
    { name: 'target', duration: null, showStimulus: true, acceptResponses: true } // Wait for response
  ];

  const {
    phase,
    currentTrial,
    trialPhase,
    showStimulus,
    awaitingResponse,
    results,
    practiceResults,
    startPractice,
    startMainTask,
    handleResponse,
    getCurrentTrial,
    totalTrials
  } = useMultiPhaseTrialManager({
    practiceTrials,
    mainTrials,
    responseTimeout: RESPONSE_TIMEOUT,
    interTrialDelay: () => 800 + Math.random() * 400, // Variable ITI: 800-1200ms
    
    // Multi-phase configuration
    phases: phaseConfig,
    
    onPhaseStart: (phaseName, phaseIndex, trial, experimentPhase) => {
      setCurrentStimulus(trial);
      setCurrentPhase(phaseName);
      
      console.log(`[POSNER] Phase started: ${phaseName}, trial:`, trial);
      
      if (phaseName === 'fixation') {
        setShowingCue(false);
        setShowingTarget(false);
        setStimulusOnsetTime(null);
      } else if (phaseName === 'cue') {
        setShowingCue(true);
        setShowingTarget(false);
      } else if (phaseName === 'delay') {
        setShowingCue(false);
        setShowingTarget(false);
        // Return the delay duration based on SOA - cue duration
        const delayDuration = trial.soa - 200; // SOA minus cue duration (200ms)
        console.log(`[POSNER] Delay phase: SOA=${trial.soa}ms, delay=${delayDuration}ms`);
        return Math.max(0, delayDuration); // Ensure non-negative delay
      } else if (phaseName === 'target') {
        if (trial.targetPresent) {
          setShowingTarget(true);
          setStimulusOnsetTime(Date.now());
        }
        setShowingCue(false);
      }
    },
    
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      // Reset display state
      setShowingCue(false);
      setShowingTarget(false);
      
      // In Posner task, correct response is always 'space' since target is always present
      const isCorrect = result.response === 'space';
      
      // Calculate correct reaction time from stimulus onset
      let actualRT = result.reaction_time;
      if (stimulusOnsetTime && result.response === 'space') {
        // Calculate RT from target onset time
        const responseTimestamp = typeof result.timestamp === 'string' ? new Date(result.timestamp).getTime() : result.timestamp || Date.now();
        actualRT = responseTimestamp - stimulusOnsetTime;
      } else if (result.response === 'timeout') {
        // Timeout - RT is the timeout duration
        actualRT = RESPONSE_TIMEOUT;
      }
      
      console.log(`[POSNER DEBUG] Trial ${trialIndex + 1} Ended:`, {
        phase: currentPhase,
        cueType: trial.cueType,
        cueValidity: trial.cueValidity,
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
        targetPresent: true, // Always true now
        soa: trial.soa,
        correctResponse: 'space', // Always space now
        response: result.response,
        reaction_time: actualRT, // Use corrected RT
        is_correct: isCorrect,
        timestamp: new Date().toISOString()
      };

      // Add to batch for optimized storage
      if (studentResult && currentPhase === 'task') {
        studentResult.addTrial(resultData);
      }

      // Reset display state for next trial
      setShowingCue(false);
      setShowingTarget(false);
      setCurrentPhase('fixation');
      setStimulusOnsetTime(null);

      return resultData;
    },

    onExperimentComplete: async (mainResults, practiceResults) => {
      console.log('Posner experiment completed!', { 
        mainTrials: mainResults.length, 
        practiceTrials: practiceResults.length 
      });
      
      // Submit all collected trial data as a single student record
      if (studentResult && mainResults.length > 0) {
        try {
          console.log(`[POSNER DEBUG] Submitting ${studentResult.getTrialCount()} trials for student`);
          const submission = await studentResult.submit();
          
          if (submission.success) {
            console.log('[POSNER DEBUG] Successfully submitted all trial data');
          } else {
            console.warn('[POSNER DEBUG] Data submission failed, but saved locally:', submission.error);
          }
        } catch (error) {
          console.error('[POSNER DEBUG] Error during data submission:', error);
        }
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
  const showingFixation = trialPhase === 'fixation';

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
        trial={getCurrentTrial()}
        showingFixation={showingFixation}
        showStimulus={showStimulus}
        showingCue={showingCue}
        showingTarget={showingTarget}
        currentPhase={trialPhase || currentPhase}
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
