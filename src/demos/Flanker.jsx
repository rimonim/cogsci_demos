import React, { useState, useEffect, useCallback } from "react";
import { FlankerResult } from "@/entities/FlankerResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrialManager } from "@/hooks/useTrialManager";

import TaskSetup from "@/components/flanker/TaskSetup";
import StimulusDisplay from "@/components/flanker/StimulusDisplay";
import TaskComplete from "@/components/flanker/TaskComplete";
import PracticeComplete from "@/components/flanker/PracticeComplete";

const TOTAL_TRIALS = 40;
const PRACTICE_TRIALS = 10;
const RESPONSE_TIMEOUT = 2000;

const stimuli = [
  { display: "<<<<<", type: "congruent", correct: "left" },
  { display: ">>>>>", type: "congruent", correct: "right" },
  { display: "<<><<", type: "incongruent", correct: "right" },
  { display: ">><>>", type: "incongruent", correct: "left" },
];

export default function FlankerTask() {
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "", shareData: false });
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const navigate = useNavigate();

  // Generate trial sequences
  const generateTrials = useCallback((numTrials) => {
    const trials = [];
    const congruentCount = Math.ceil(numTrials / 2);
    const incongruentCount = Math.floor(numTrials / 2);
    
    for (let i = 0; i < congruentCount; i++) trials.push(stimuli[Math.floor(Math.random() * 2)]);
    for (let i = 0; i < incongruentCount; i++) trials.push(stimuli[2 + Math.floor(Math.random() * 2)]);
    
    for (let i = trials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trials[i], trials[j]] = [trials[j], trials[i]];
    }
    return trials.slice(0, numTrials);
  }, []);

  const practiceTrials = generateTrials(PRACTICE_TRIALS);
  const mainTrials = generateTrials(TOTAL_TRIALS);

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
    interTrialDelay: { practice: 1200, task: 500 }, // Longer delay for practice to show feedback
    fixationDelay: 500,
    showFixation: false, // Flanker doesn't use fixation crosses
    
    onTrialStart: (trial, trialIndex, currentPhase) => {
      setCurrentStimulus(trial);
      setFeedback(null);
    },
    
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      const isCorrect = result.response === trial.correct;
      
      // Enhanced result object
      const enhancedResult = {
        ...result,
        student_name: studentInfo.name,
        student_id: studentInfo.id,
        stimulus_type: trial.type,
        stimulus_display: trial.display,
        correct_response: trial.correct,
        participant_response: result.response,
        is_correct: isCorrect,
        session_start_time: sessionStartTime,
        task_type: 'flanker',
        share_data: studentInfo.shareData
      };

      // Show feedback for practice trials
      if (currentPhase === 'practice') {
        const feedbackText = result.response === 'timeout' ? 'Too Slow' : (isCorrect ? 'Correct!' : 'Incorrect');
        setFeedback({ show: true, text: feedbackText, correct: isCorrect });
      }

      // Save to API for main task
      if (currentPhase === 'task') {
        try {
          FlankerResult.create(enhancedResult, studentInfo.shareData);
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
      console.log('Flanker experiment completed!', { mainResults, practiceResults });
    }
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      
      let response = null;
      if (e.key === "ArrowLeft") response = "left";
      else if (e.key === "ArrowRight") response = "right";
      
      if (response) {
        handleResponse(response, Date.now());
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

  // Render phases
  if (phase === "setup") {
    return <TaskSetup onStart={startTask} />;
  }

  if (phase === "practice_complete") {
    return <PracticeComplete onStartExperiment={startMainExperiment} />;
  }

  if (phase === "complete") {
    return <TaskComplete results={results} studentInfo={studentInfo} />;
  }

  const progressTitle = phase === 'practice' ? 'Practice Trial' : 'Trial';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
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
              stimulus={currentStimulus}
              awaitingResponse={awaitingResponse}
              feedback={feedback}
            />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">←</kbd><span>Left Arrow</span>
            </div>
            <div className="w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">→</kbd><span>Right Arrow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}