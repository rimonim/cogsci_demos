import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Standardized trial management hook for cognitive science experiments
 * Handles trial sequencing, timing, and state management consistently
 */
export function useTrialManager({
  practiceTrials = [],
  mainTrials = [],
  responseTimeout = 5000,
  interTrialDelay = 500,
  fixationDelay = 500,
  showFixation = true,
  stimulusDuration = null, // Duration to show stimulus before blanking (but still allowing responses)
  manualResponseControl = false, // If true, task handles its own response timing and timeouts
  onTrialStart,
  onTrialEnd,
  onPhaseComplete,
  onExperimentComplete
}) {
  // Helper to get current inter-trial delay
  const getCurrentInterTrialDelay = useCallback(() => {
    if (typeof interTrialDelay === 'function') {
      return interTrialDelay(phaseRef.current);
    } else if (typeof interTrialDelay === 'object') {
      return interTrialDelay[phaseRef.current] || interTrialDelay.default || 500;
    }
    return interTrialDelay;
  }, [interTrialDelay]);
  // Core trial state
  const [phase, setPhase] = useState('setup'); // setup, practice, practice_complete, task, complete
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [showingFixation, setShowingFixation] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [inInterTrialDelay, setInInterTrialDelay] = useState(false);
  const [results, setResults] = useState([]);
  const [practiceResults, setPracticeResults] = useState([]);

  // Refs for stable references in callbacks
  const phaseRef = useRef(phase);
  const currentTrialRef = useRef(currentTrial);
  const awaitingResponseRef = useRef(awaitingResponse);
  const isAdvancingRef = useRef(false);
  const timeoutsRef = useRef([]);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentTrialRef.current = currentTrial; }, [currentTrial]);
  useEffect(() => { awaitingResponseRef.current = awaitingResponse; }, [awaitingResponse]);

  // Cleanup function
  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Get current trial sequence
  const getCurrentSequence = useCallback(() => {
    return phaseRef.current === 'practice' ? practiceTrials : mainTrials;
  }, [practiceTrials, mainTrials]);

  // Get current trial data
  const getCurrentTrial = useCallback(() => {
    const sequence = getCurrentSequence();
    return sequence[currentTrialRef.current];
  }, [getCurrentSequence]);

  // Start a trial
  const startTrial = useCallback(() => {
    if (phaseRef.current !== 'practice' && phaseRef.current !== 'task') return;
    if (isAdvancingRef.current) return;

    const sequence = getCurrentSequence();
    const trialIndex = currentTrialRef.current;
    
    if (trialIndex >= sequence.length) {
      // No more trials in this phase
      if (phaseRef.current === 'practice') {
        setPhase('practice_complete');
      } else {
        setPhase('complete');
      }
      return;
    }

    const trial = sequence[trialIndex];
    cleanup(); // Clear any existing timeouts

    // Call user-defined trial start callback
    onTrialStart?.(trial, trialIndex, phaseRef.current);

    if (showFixation && fixationDelay > 0) {
      // Show fixation first
      setShowingFixation(true);
      setShowStimulus(false);
      setAwaitingResponse(false);

      const fixationTimeout = setTimeout(() => {
        if (phaseRef.current !== 'practice' && phaseRef.current !== 'task') return;

        setShowingFixation(false);
        setTrialStartTime(Date.now());
        setShowStimulus(true);
        
        // Only auto-manage responses if not in manual mode
        if (!manualResponseControl) {
          setAwaitingResponse(true);

          // If stimulusDuration is set, hide stimulus after that time (but continue to accept responses)
          if (stimulusDuration) {
            const hideStimTimeout = setTimeout(() => {
              // Only hide the stimulus, keep accepting responses
              setShowStimulus(false);
            }, stimulusDuration);
            
            timeoutsRef.current.push(hideStimTimeout);
          }

          // Response timeout
          const responseTimeoutId = setTimeout(() => {
            if (awaitingResponseRef.current) {
              handleResponse('timeout', Date.now());
            }
          }, responseTimeout);

          timeoutsRef.current.push(responseTimeoutId);
        }
      }, fixationDelay);

      timeoutsRef.current.push(fixationTimeout);
    } else {
      // No fixation - show stimulus immediately
      setShowingFixation(false);
      setTrialStartTime(Date.now());
      setShowStimulus(true);
      
      // Only auto-manage responses if not in manual mode
      if (!manualResponseControl) {
        setAwaitingResponse(true);
        
        // If stimulusDuration is set, hide stimulus after that time (but continue to accept responses)
        if (stimulusDuration) {
          const hideStimTimeout = setTimeout(() => {
            // Only hide the stimulus, keep accepting responses
            setShowStimulus(false);
          }, stimulusDuration);
          
          timeoutsRef.current.push(hideStimTimeout);
        }

        // Response timeout
        const responseTimeoutId = setTimeout(() => {
          if (awaitingResponseRef.current) {
            handleResponse('timeout', Date.now());
          }
        }, responseTimeout);

        timeoutsRef.current.push(responseTimeoutId);
      }
    }
  }, [getCurrentSequence, onTrialStart, responseTimeout, fixationDelay, showFixation, manualResponseControl, stimulusDuration]);

  // Handle response
  const handleResponse = useCallback((response, reactionTime, trialData = null) => {
    if (!awaitingResponseRef.current || isAdvancingRef.current) return;

    isAdvancingRef.current = true;
    setAwaitingResponse(false);
    setShowStimulus(false);
    setShowingFixation(false);
    setInInterTrialDelay(true);

    // Use provided trial data if available, otherwise fall back to getCurrentTrial
    const trial = trialData || getCurrentTrial();
    const currentTrialIndex = currentTrialRef.current;
    const currentPhase = phaseRef.current;
    
    console.log(`[TRIAL MANAGER DEBUG] Processing response for trial ${currentTrialIndex + 1}:`, {
      stimulus: trial?.display || trial?.stimulus,
      correctResponse: trial?.correct || trial?.correctResponse,
      participantResponse: response,
      usingProvidedTrialData: !!trialData
    });
    
    const actualReactionTime = response === 'timeout' ? responseTimeout : (reactionTime - trialStartTime);

    const trialResult = {
      trial_number: currentTrialIndex + 1,
      phase: currentPhase,
      response,
      reaction_time: actualReactionTime,
      timestamp: new Date().toISOString(),
      ...trial // Include all trial data
    };

    // Call user-defined trial end callback with the correct trial data
    const processedResult = onTrialEnd?.(trialResult, trial, currentTrialIndex, currentPhase) || trialResult;

    // Store result
    if (currentPhase === 'practice') {
      setPracticeResults(prev => [...prev, processedResult]);
    } else {
      setResults(prev => [...prev, processedResult]);
    }

    // Inter-trial delay before advancing
    const currentDelay = getCurrentInterTrialDelay();
    const advanceTimeout = setTimeout(() => {
      setInInterTrialDelay(false);
      
      const sequence = getCurrentSequence();
      const nextTrialIndex = currentTrialIndex + 1;

      if (nextTrialIndex >= sequence.length) {
        // Phase complete
        if (currentPhase === 'practice') {
          onPhaseComplete?.('practice', practiceResults);
          setPhase('practice_complete');
        } else {
          onPhaseComplete?.('task', results);
          onExperimentComplete?.(results, practiceResults);
          setPhase('complete');
        }
        isAdvancingRef.current = false;
      } else {
        // Next trial
        setCurrentTrial(nextTrialIndex);
        setTimeout(() => {
          isAdvancingRef.current = false;
          startTrial();
        }, 100);
      }
    }, currentDelay);

    timeoutsRef.current.push(advanceTimeout);
  }, [awaitingResponse, getCurrentTrial, trialStartTime, responseTimeout, onTrialEnd, getCurrentSequence, onPhaseComplete, onExperimentComplete, results, practiceResults, getCurrentInterTrialDelay, startTrial]);

  // Start experiment phases
  const startPractice = useCallback(() => {
    setPhase('practice');
    setCurrentTrial(0);
    setTimeout(startTrial, 100);
  }, [startTrial]);

  const startMainTask = useCallback(() => {
    setPhase('task');
    setCurrentTrial(0);
    setTimeout(startTrial, 100);
  }, [startTrial]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Phase change cleanup
  useEffect(() => {
    if (phase === 'practice_complete' || phase === 'complete') {
      cleanup();
      setShowStimulus(false);
      setShowingFixation(false);
      setAwaitingResponse(false);
      setInInterTrialDelay(false);
      isAdvancingRef.current = false;
    }
  }, [phase, cleanup]);

  // Manual control functions for complex tasks
  const startAcceptingResponses = useCallback(() => {
    if (manualResponseControl) {
      setAwaitingResponse(true);
    }
  }, [manualResponseControl]);

  const stopAcceptingResponses = useCallback(() => {
    if (manualResponseControl) {
      setAwaitingResponse(false);
    }
  }, [manualResponseControl]);

  return {
    // State
    phase,
    currentTrial,
    showStimulus,
    showingFixation,
    awaitingResponse,
    inInterTrialDelay,
    results,
    practiceResults,
    
    // Actions
    startPractice,
    startMainTask,
    handleResponse,
    
    // Manual control (for complex timing scenarios)
    startAcceptingResponses,
    stopAcceptingResponses,
    
    // Utilities
    getCurrentTrial,
    getCurrentSequence,
    
    // For progress display
    totalTrials: phaseRef.current === 'practice' ? practiceTrials.length : mainTrials.length,
    isComplete: phase === 'complete',
    
    // For advanced control
    setPhase,
    cleanup
  };
}
