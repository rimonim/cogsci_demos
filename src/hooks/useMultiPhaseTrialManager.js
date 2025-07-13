import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Multi-phase trial management hook for complex cognitive science experiments
 * Handles trials with multiple phases (e.g., fixation → memory → retention → test)
 * Built from scratch to avoid the complexity and circular dependencies of the general trial manager
 */
export function useMultiPhaseTrialManager({
  practiceTrials = [],
  mainTrials = [],
  phases = [], // Array of phase definitions: [{ name, duration }]
  responseTimeout = 5000,
  interTrialDelay = 1000,
  calculateStats = null,
  onTrialStart = null,
  onTrialEnd = null,
  onPhaseStart = null,
  onPhaseEnd = null
}) {
  // Core state
  const [experimentPhase, setExperimentPhase] = useState('setup'); // setup, practice, practice_complete, task, complete
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentPhaseName, setCurrentPhaseName] = useState(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [results, setResults] = useState([]);
  const [practiceResults, setPracticeResults] = useState([]);
  const [practiceStats, setPracticeStats] = useState(null);

  // Refs for stable access in timeouts
  const timeoutsRef = useRef([]);
  const isRunningRef = useRef(false);
  const phaseStartTimeRef = useRef(null);
  const advancingTrialRef = useRef(false);

  // Get current trial sequence
  const getCurrentSequence = () => {
    return experimentPhase === 'practice' ? practiceTrials : mainTrials;
  };

  // Get current trial data
  const getCurrentTrial = () => {
    const sequence = getCurrentSequence();
    return sequence[currentTrialIndex];
  };

  // Default stats calculator
  const defaultCalculateStats = useCallback((results) => {
    if (!results || results.length === 0) {
      return { accuracy: 0, avgReactionTime: 0, trialsResponded: 0 };
    }
    
    const responded = results.filter(r => r.response !== 'timeout');
    const correct = results.filter(r => r.is_correct === true);
    const accuracy = responded.length > 0 ? (correct.length / responded.length) * 100 : 0;
    const avgReactionTime = responded.length > 0 ? 
      responded.reduce((sum, r) => sum + (r.reaction_time || 0), 0) / responded.length : 0;
    
    return {
      accuracy: Math.round(accuracy),
      avgReactionTime: Math.round(avgReactionTime),
      trialsResponded: responded.length
    };
  }, []);

  const statsCalculator = calculateStats || defaultCalculateStats;

  // Cleanup function
  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Handle response
  const handleResponse = useCallback((response, reactionTime = Date.now()) => {
    if (!awaitingResponse || !isRunningRef.current) return;

    console.log(`[Multi-Phase] Response received: ${response}`);
    
    cleanup(); // Clear any pending timeouts
    setAwaitingResponse(false);
    setShowStimulus(false);
    isRunningRef.current = false;
    advancingTrialRef.current = true; // Prevent auto-restart

    const trial = getCurrentTrial();
    const actualReactionTime = response === 'timeout' ? responseTimeout : 
      (reactionTime - phaseStartTimeRef.current);

    // Calculate correctness
    const correctResponse = trial?.correct || trial?.correctResponse;
    const isCorrect = correctResponse ? response === correctResponse : null;

    const trialResult = {
      trial_number: currentTrialIndex + 1,
      phase: experimentPhase,
      response,
      participant_response: response,
      reaction_time: actualReactionTime,
      is_correct: isCorrect,
      correct: isCorrect,
      timestamp: new Date().toISOString(),
      ...trial
    };

    // Call user callback
    const processedResult = onTrialEnd?.(trialResult, trial, currentTrialIndex, experimentPhase) || trialResult;

    // Store result
    if (experimentPhase === 'practice') {
      setPracticeResults(prev => [...prev, processedResult]);
    } else {
      setResults(prev => [...prev, processedResult]);
    }

    // Schedule next trial after delay
    const delayTimeout = setTimeout(() => {
      const currentPhase = experimentPhase;
      const currentIndex = currentTrialIndex;
      const sequence = currentPhase === 'practice' ? practiceTrials : mainTrials;
      const nextTrialIndex = currentIndex + 1;

      console.log(`[Multi-Phase] Timeout fired: currentIndex=${currentIndex}, nextIndex=${nextTrialIndex}, sequenceLength=${sequence.length}`);

      if (nextTrialIndex >= sequence.length) {
        // Phase complete
        if (currentPhase === 'practice') {
          // Calculate practice stats - we already have the latest results
          const allPracticeResults = [...practiceResults, processedResult];
          const stats = statsCalculator(allPracticeResults);
          setPracticeStats(stats);
          console.log('[Multi-Phase] Practice complete, moving to review. Stats:', stats);
          
          // Move to practice review screen
          setExperimentPhase('practice_complete');
        } else {
          // Experiment complete
          console.log('[Multi-Phase] Experiment complete');
          setExperimentPhase('complete');
        }
      } else {
        // Next trial
        console.log(`[Multi-Phase] Advancing to trial ${nextTrialIndex + 1}`);
        setCurrentTrialIndex(nextTrialIndex);
      }
      
      advancingTrialRef.current = false; // Allow auto-restart
    }, interTrialDelay);

    timeoutsRef.current.push(delayTimeout);
  }, [awaitingResponse, responseTimeout, interTrialDelay, practiceTrials, mainTrials, statsCalculator, onTrialEnd]);

  // Start a specific phase of the current trial
  const startPhase = useCallback((phaseIndex) => {
    if (phaseIndex >= phases.length) {
      console.error('[Multi-Phase] Invalid phase index:', phaseIndex);
      return;
    }

    const phase = phases[phaseIndex];
    const trial = getCurrentTrial();
    
    console.log(`[Multi-Phase] Starting phase ${phaseIndex}: ${phase.name}`);
    
    setCurrentPhaseIndex(phaseIndex);
    setCurrentPhaseName(phase.name);
    setShowStimulus(phase.showStimulus !== false); // Allow explicit false to hide stimulus
    setAwaitingResponse(phase.acceptResponses === true);

    // Call phase start callback and get dynamic duration if returned
    const dynamicDuration = onPhaseStart?.(phase.name, phaseIndex, trial, experimentPhase);

    // Determine the actual duration to use
    let phaseDuration = phase.duration;
    if (typeof dynamicDuration === 'number' && dynamicDuration > 0) {
      phaseDuration = dynamicDuration;
      console.log(`[Multi-Phase] Using dynamic duration for ${phase.name}: ${phaseDuration}ms`);
    }

    if (phaseIndex === phases.length - 1) {
      // Last phase - start accepting responses if configured
      if (phase.acceptResponses) {
        phaseStartTimeRef.current = Date.now();
        setAwaitingResponse(true);
        
        // Set up response timeout
        if (responseTimeout > 0) {
          const timeout = setTimeout(() => {
            if (awaitingResponse && isRunningRef.current) {
              handleResponse('timeout', Date.now());
            }
          }, responseTimeout);
          timeoutsRef.current.push(timeout);
        }
      }
    }

    // Set up phase duration timeout
    if (phaseDuration && phaseDuration > 0) {
      const phaseTimeout = setTimeout(() => {
        // Call phase end callback
        onPhaseEnd?.(phase.name, phaseIndex, trial, experimentPhase);
        
        if (phaseIndex < phases.length - 1) {
          // Move to next phase
          startPhase(phaseIndex + 1);
        }
      }, phaseDuration);
      
      timeoutsRef.current.push(phaseTimeout);
    } else if (phaseIndex < phases.length - 1) {
      // No duration, move immediately to next phase
      setTimeout(() => startPhase(phaseIndex + 1), 0);
    }
  }, [phases, awaitingResponse, responseTimeout, handleResponse, onPhaseStart, onPhaseEnd]);

  // Start a trial
  const startTrial = useCallback(() => {
    if (experimentPhase !== 'practice' && experimentPhase !== 'task') return;
    if (isRunningRef.current) return;

    const sequence = getCurrentSequence();
    const trial = sequence[currentTrialIndex];
    
    if (!trial) {
      console.error('[Multi-Phase] No trial data for index:', currentTrialIndex);
      return;
    }

    console.log(`[Multi-Phase] Starting trial ${currentTrialIndex + 1} in ${experimentPhase} phase`);
    
    isRunningRef.current = true;
    cleanup();

    // Call trial start callback
    onTrialStart?.(trial, currentTrialIndex, experimentPhase);

    // Start the first phase
    startPhase(0);
  }, [experimentPhase, currentTrialIndex, startPhase, onTrialStart]);

  // Auto-start trials when phase or trial index changes
  useEffect(() => {
    if ((experimentPhase === 'practice' || experimentPhase === 'task') && !isRunningRef.current && !advancingTrialRef.current) {
      const timer = setTimeout(startTrial, 100);
      return () => clearTimeout(timer);
    }
  }, [experimentPhase, currentTrialIndex, startTrial]);

  // Start experiment phases
  const startPractice = useCallback(() => {
    console.log('[Multi-Phase] Starting practice phase');
    setExperimentPhase('practice');
    setCurrentTrialIndex(0);
  }, []);

  const startMainTask = useCallback(() => {
    console.log('[Multi-Phase] Starting main task');
    setExperimentPhase('task');
    setCurrentTrialIndex(0);
  }, []);

  // For compatibility with existing UI components
  const skipToMainTask = useCallback(() => {
    console.log('[Multi-Phase] Skipping to main task from practice review');
    setExperimentPhase('task');
    setCurrentTrialIndex(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Clean up when experiment ends
  useEffect(() => {
    if (experimentPhase === 'complete') {
      cleanup();
      setAwaitingResponse(false);
      setShowStimulus(false);
      isRunningRef.current = false;
    }
  }, [experimentPhase, cleanup]);

  return {
    // State
    phase: experimentPhase,
    currentTrial: currentTrialIndex,
    currentPhaseIndex,
    currentPhaseName,
    trialPhase: currentPhaseName, // Alias for compatibility
    showStimulus,
    awaitingResponse,
    results,
    practiceResults,
    practiceStats,
    
    // Actions
    startPractice,
    startMainTask,
    skipToMainTask, // For transitioning from practice review to main task
    handleResponse,
    
    // Utilities
    getCurrentTrial,
    getCurrentSequence,
    
    // Progress info
    totalTrials: experimentPhase === 'practice' ? practiceTrials.length : mainTrials.length,
    isComplete: experimentPhase === 'complete',
    isPracticeComplete: experimentPhase === 'practice_complete',
    
    // Cleanup
    cleanup
  };
}
