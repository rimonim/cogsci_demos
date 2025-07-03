# Unified Trial Management Framework

This document describes the `useTrialManager` hook, a standardized framework for managing trials in cognitive science experiments.

## Overview

The `useTrialManager` hook provides a robust, reusable solution for trial sequencing, timing, and state management across different cognitive experiments. It eliminates common race conditions and timing bugs by centralizing trial flow logic.

## Key Features

- **Standardized trial phases**: Setup → Practice → Main Task → Complete
- **Robust timing management**: Handles response timeouts, inter-trial delays, fixation displays
- **Race condition prevention**: Uses refs and cleanup mechanisms to prevent stale closures
- **Flexible callback system**: Customizable trial start/end and phase completion handlers
- **Automatic result collection**: Built-in state management for practice and main results

## Basic Usage

```jsx
import { useTrialManager } from '@/hooks/useTrialManager';

export function MyExperiment() {
  const {
    phase,
    currentTrial,
    showStimulus,
    awaitingResponse,
    results,
    startPractice,
    startMainTask,
    handleResponse,
    getCurrentTrial,
    totalTrials
  } = useTrialManager({
    practiceTrials: [...], // Array of trial objects
    mainTrials: [...],     // Array of trial objects
    responseTimeout: 5000, // MS before trial times out
    interTrialDelay: 500,  // MS between trials
    fixationDelay: 500,    // MS to show fixation cross
    showFixation: true,    // Whether to show fixation
    
    // Callbacks
    onTrialStart: (trial, trialIndex, phase) => {
      // Called when each trial begins
      setCurrentStimulus(trial);
    },
    
    onTrialEnd: (result, trial, trialIndex, phase) => {
      // Called when each trial ends
      // Enhance result object with experiment-specific data
      return {
        ...result,
        participant_id: participantInfo.id,
        condition: trial.condition,
        is_correct: result.response === trial.correctResponse
      };
    },
    
    onPhaseComplete: (completedPhase, phaseResults) => {
      // Called when practice or main phase completes
    },
    
    onExperimentComplete: (mainResults, practiceResults) => {
      // Called when entire experiment completes
    }
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      
      let response = null;
      if (e.key === 'j') response = 'absent';
      else if (e.key === 'k') response = 'present';
      
      if (response) {
        handleResponse(response, Date.now());
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [awaitingResponse, handleResponse]);

  // Render based on phase
  if (phase === 'setup') return <TaskSetup onStart={startPractice} />;
  if (phase === 'practice_complete') return <PracticeComplete onContinue={startMainTask} />;
  if (phase === 'complete') return <TaskComplete results={results} />;
  
  return (
    <div>
      <ProgressBar value={(currentTrial + 1) / totalTrials * 100} />
      <StimulusDisplay 
        showStimulus={showStimulus}
        stimulus={getCurrentTrial()}
        awaitingResponse={awaitingResponse}
      />
    </div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `practiceTrials` | Array | `[]` | Array of practice trial objects |
| `mainTrials` | Array | `[]` | Array of main experiment trial objects |
| `responseTimeout` | Number | `5000` | Milliseconds before trial times out |
| `interTrialDelay` | Number/Object/Function | `500` | Milliseconds between trials. Can be a number, object with phase-specific delays `{practice: 1200, task: 500}`, or function `(phase) => phase === 'practice' ? 1200 : 500` |
| `fixationDelay` | Number | `500` | Milliseconds to show fixation cross |
| `showFixation` | Boolean | `true` | Whether to show fixation cross |

## Callbacks

### onTrialStart(trial, trialIndex, phase)
Called when each trial begins. Use this to:
- Set the current stimulus
- Reset feedback states
- Log trial start events

### onTrialEnd(result, trial, trialIndex, phase)
Called when each trial ends. Use this to:
- Enhance the result object with experiment-specific data
- Save results to API/database
- Show feedback (for practice trials)
- Return the enhanced result object

### onPhaseComplete(completedPhase, phaseResults)
Called when practice or main phase completes.

### onExperimentComplete(mainResults, practiceResults)
Called when the entire experiment completes.

## Returned State and Functions

| Property | Type | Description |
|----------|------|-------------|
| `phase` | String | Current phase: 'setup', 'practice', 'practice_complete', 'task', 'complete' |
| `currentTrial` | Number | Current trial index (0-based) |
| `showStimulus` | Boolean | Whether to show the stimulus |
| `showingFixation` | Boolean | Whether currently showing fixation cross |
| `awaitingResponse` | Boolean | Whether waiting for participant response |
| `inInterTrialDelay` | Boolean | Whether in inter-trial delay period |
| `results` | Array | Main experiment results |
| `practiceResults` | Array | Practice phase results |
| `totalTrials` | Number | Total trials in current phase |
| `startPractice()` | Function | Start the practice phase |
| `startMainTask()` | Function | Start the main experiment |
| `handleResponse(response, timestamp)` | Function | Record a participant response |
| `getCurrentTrial()` | Function | Get current trial object |

## Trial Object Structure

Trial objects should contain all the information needed for a single trial:

```jsx
const exampleTrial = {
  // Required for framework
  id: 'trial_001',
  
  // Experiment-specific
  condition: 'congruent',
  stimulus: '<<<<<',
  correctResponse: 'left',
  setSize: 4,
  targetPresent: true,
  // ... any other trial-specific data
};
```

## Result Object Structure

The framework automatically creates result objects with this structure:

```jsx
const result = {
  trial_number: 1,           // 1-based trial number
  phase: 'practice',         // 'practice' or 'task'
  response: 'left',          // Participant response or 'timeout'
  reaction_time: 650,        // MS from stimulus onset to response
  timestamp: '2024-01-15T10:30:00.000Z',
  
  // Plus all properties from the original trial object
  ...trial
};
```

## Advanced Features

### Phase-Specific Inter-Trial Delays

The `interTrialDelay` parameter supports three formats for maximum flexibility:

```jsx
// Simple constant delay
interTrialDelay: 500

// Object with phase-specific delays
interTrialDelay: { 
  practice: 1200,  // Longer delay for practice to show feedback
  task: 500        // Shorter delay for main task
}

// Function for dynamic calculation
interTrialDelay: (phase) => phase === 'practice' ? 1200 : 500
```

This is particularly useful for:
- **Practice phases**: Longer delays to display feedback
- **Main tasks**: Shorter delays for efficiency
- **Different conditions**: Varying delays based on trial type

## Examples

See these files for complete examples:
- `/src/demos/Flanker.jsx` - Flanker task implementation
- `/src/demos/Stroop.jsx` - Stroop task implementation
- `/src/demos/VisualSearch.jsx` - Visual search task implementation
- `/src/examples/VisualSearchWithFramework.jsx` - Visual search example (alternate version)

## Migration from Custom Trial Management

To migrate an existing experiment:

1. Replace custom state variables with `useTrialManager` return values
2. Move trial sequencing logic to the framework configuration
3. Replace custom timeout handling with framework callbacks
4. Update render logic to use framework phase states
5. Remove manual cleanup code (framework handles this)

## Best Practices

1. **Generate trial sequences upfront** - Don't generate trials during the experiment
2. **Use callbacks for side effects** - Keep trial logic in `onTrialStart`/`onTrialEnd`
3. **Return enhanced results** - Add experiment-specific data in `onTrialEnd`
4. **Handle keyboard input carefully** - Check `awaitingResponse` before calling `handleResponse`
5. **Use absolute timestamps** - Pass `Date.now()` to `handleResponse` for accurate RT calculation

## Debugging

The framework includes extensive console logging. Enable debug mode by:
1. Opening browser dev tools
2. Looking for trial management logs
3. Checking for cleanup warnings or race condition messages

## Technical Implementation Notes

- Uses `useRef` to maintain stable references and prevent stale closures
- Implements cleanup mechanisms to prevent memory leaks
- Guards against race conditions with advancement flags
- Supports both fixation and non-fixation experiments
- Handles phase transitions automatically
