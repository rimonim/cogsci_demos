import React, { useState, useEffect, useCallback } from "react";
import { StroopResult } from "@/entities/StroopResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrialManager } from "@/hooks/useTrialManager";

import TaskSetup from "@/components/ui/TaskSetup";
import { STROOP_CONFIG, STROOP_PRACTICE_CONFIG, STROOP_COMPLETE_CONFIG } from "@/components/ui/taskConfigs";
import StimulusDisplay from "@/components/stroop/StimulusDisplay";
import TaskComplete from "@/components/ui/TaskComplete";
import PracticeComplete from "@/components/ui/PracticeComplete";

const TOTAL_TRIALS = 40;
const PRACTICE_TRIALS = 10;
const RESPONSE_TIMEOUT = 3000;

// Stroop stimuli with color-word conflicts
const stimuli = [
  // Congruent trials
  { word: "BLUE", color: "#3b82f6", type: "congruent", correct: "b" },
  { word: "RED", color: "#ef4444", type: "congruent", correct: "r" },
  { word: "GREEN", color: "#22c55e", type: "congruent", correct: "g" },
  { word: "YELLOW", color: "#eab308", type: "congruent", correct: "y" },
  
  // Incongruent trials
  { word: "BLUE", color: "#ef4444", type: "incongruent", correct: "r" },
  { word: "BLUE", color: "#22c55e", type: "incongruent", correct: "g" },
  { word: "BLUE", color: "#eab308", type: "incongruent", correct: "y" },
  { word: "RED", color: "#3b82f6", type: "incongruent", correct: "b" },
  { word: "RED", color: "#22c55e", type: "incongruent", correct: "g" },
  { word: "RED", color: "#eab308", type: "incongruent", correct: "y" },
  { word: "GREEN", color: "#3b82f6", type: "incongruent", correct: "b" },
  { word: "GREEN", color: "#ef4444", type: "incongruent", correct: "r" },
  { word: "GREEN", color: "#eab308", type: "incongruent", correct: "y" },
  { word: "YELLOW", color: "#3b82f6", type: "incongruent", correct: "b" },
  { word: "YELLOW", color: "#ef4444", type: "incongruent", correct: "r" },
  { word: "YELLOW", color: "#22c55e", type: "incongruent", correct: "g" },
];

export default function StroopTask() {
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "", shareData: false });
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const navigate = useNavigate();

  // Generate trial sequences
  const generateTrials = useCallback((numTrials) => {
    const trials = [];
    for (let i = 0; i < numTrials; i++) {
      trials.push(stimuli[Math.floor(Math.random() * stimuli.length)]);
    }
    return trials;
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
    interTrialDelay: { practice: 1000, task: 800 }, // Slightly longer delays for Stroop
    fixationDelay: 800, // Base fixation time (original used 500 + random(1000))
    showFixation: true, // Stroop uses fixation crosses
    
    onTrialStart: (trial, trialIndex, currentPhase) => {
      setCurrentStimulus(trial);
    },
    
    onTrialEnd: (result, trial, trialIndex, currentPhase) => {
      const isCorrect = result.response === trial.correct;
      
      // Enhanced result object
      const enhancedResult = {
        ...result,
        student_name: studentInfo.name,
        student_id: studentInfo.id,
        stimulus_type: trial.type,
        stimulus_word: trial.word,
        stimulus_color: trial.color,
        correct_response: trial.correct,
        participant_response: result.response,
        is_correct: isCorrect,
        session_start_time: sessionStartTime,
        task_type: 'stroop',
        share_data: studentInfo.shareData
      };

      // Save to API for main task
      if (currentPhase === 'task') {
        try {
          StroopResult.create(enhancedResult, studentInfo.shareData);
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
      console.log('Stroop experiment completed!', { mainResults, practiceResults });
    }
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      
      const key = e.key.toLowerCase();
      const validKeys = ['b', 'r', 'g', 'y'];
      
      if (validKeys.includes(key)) {
        handleResponse(key, Date.now());
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [awaitingResponse, handleResponse]);

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

  // Render phases
  if (phase === "setup") {
    return <TaskSetup onComplete={startTask} config={STROOP_CONFIG} />;
  }

  if (phase === "practice_complete") {
    return <PracticeComplete results={practiceResults} onContinue={startMainExperiment} config={STROOP_PRACTICE_CONFIG} />;
  }

  if (phase === "complete") {
    return <TaskComplete results={results} studentInfo={studentInfo} config={STROOP_COMPLETE_CONFIG} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
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
        <Card className="w-full max-w-2xl bg-white border-slate-200">
          <CardContent className="p-16">
            <StimulusDisplay
              stimulus={currentStimulus}
              showStimulus={showStimulus}
              showingFixation={showingFixation}
              interTrialDelay={inInterTrialDelay}
              isPractice={phase === "practice"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
