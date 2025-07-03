import React, { useState } from 'react';
import { useTrialManager } from '@/hooks/useTrialManager';
import { generateTrialSequence } from './trialGeneration';

export default function VisualSearchWithFramework() {
  const [studentInfo, setStudentInfo] = useState({ name: '', id: '', shareData: false });
  const [currentStimulus, setCurrentStimulus] = useState(null);

  // Generate trial sequences
  const practiceTrials = generateTrialSequence(12);
  const mainTrials = generateTrialSequence(80);

  const {
    phase,
    currentTrial,
    showStimulus,
    awaitingResponse,
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
    responseTimeout: 5000,
    interTrialDelay: 500,
    fixationDelay: 500,
    
    onTrialStart: (trial, trialIndex, phase) => {
      setCurrentStimulus(trial);
    },
    
    onTrialEnd: (result, trial, trialIndex, phase) => {
      // Add experiment-specific data to result
      result.student_name = studentInfo.name;
      result.student_id = studentInfo.id;
      result.condition = trial.condition;
      result.set_size = trial.setSize;
      result.target_present = trial.targetPresent;
      result.correct_response = trial.correctResponse;
      result.is_correct = result.response === trial.correctResponse;
      result.task_type = 'visual_search';
      result.share_data = studentInfo.shareData;
    },
    
    onPhaseComplete: (completedPhase, phaseResults) => {
      console.log(`${completedPhase} phase completed with ${phaseResults.length} trials`);
    },
    
    onExperimentComplete: (mainResults, practiceResults) => {
      console.log('Experiment completed!', { mainResults, practiceResults });
    }
  });

  // Simple keypress handler
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (!awaitingResponse) return;
      
      const key = event.key.toLowerCase();
      if (key === 'j' || key === 'k') {
        handleResponse(key, Date.now());
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [awaitingResponse, handleResponse]);

  // Render logic becomes much simpler
  if (phase === 'setup') {
    return (
      <TaskSetup 
        onComplete={(info) => {
          setStudentInfo(info);
          startPractice();
        }} 
      />
    );
  }

  if (phase === 'practice_complete') {
    return (
      <PracticeComplete 
        results={practiceResults}
        onContinue={startMainTask}
      />
    );
  }

  if (phase === 'complete') {
    return (
      <TaskComplete 
        results={results}
        onComplete={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Progress indicator */}
      <div className="text-center p-4">
        <p>Trial {currentTrial + 1} of {totalTrials}</p>
        <p>{phase === 'practice' ? 'Practice' : 'Main Task'}</p>
      </div>

      {/* Stimulus display */}
      <StimulusDisplay 
        stimulus={currentStimulus}
        showStimulus={showStimulus}
        isPractice={phase === 'practice'}
      />
    </div>
  );
}
