import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TaskSetup from "@/components/stroop/TaskSetup";
import StimulusDisplay from "@/components/stroop/StimulusDisplay";
import TaskComplete from "@/components/stroop/TaskComplete";
import PracticeComplete from "@/components/stroop/PracticeComplete";

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
  const [phase, setPhase] = useState("setup"); // setup, practice, practice_complete, task, complete
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
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

  const navigate = useNavigate();

  // Generate randomized trial sequences
  const generateTrialSequence = useCallback((numTrials) => {
    const sequence = [];
    for (let i = 0; i < numTrials; i++) {
      sequence.push(stimuli[Math.floor(Math.random() * stimuli.length)]);
    }
    return sequence;
  }, []);

  useEffect(() => {
    if (phase === "practice") {
      setPracticeSequence(generateTrialSequence(PRACTICE_TRIALS));
      setCurrentTrial(0);
    } else if (phase === "task") {
      setTrialSequence(generateTrialSequence(TOTAL_TRIALS));
      setCurrentTrial(0);
    }
  }, [phase, generateTrialSequence]);

  // Handle keyboard responses
  const handleKeyPress = useCallback((event) => {
    if (phase !== "practice" && phase !== "task") return;
    if (!showStimulus || interTrialDelay) return;

    const key = event.key.toLowerCase();
    const validKeys = ['b', 'r', 'g', 'y'];
    
    if (!validKeys.includes(key)) return;

    const reactionTime = Date.now() - trialStartTime;
    const currentSequence = phase === "practice" ? practiceSequence : trialSequence;
    const stimulus = currentSequence[currentTrial];
    const isCorrect = key === stimulus.correct;

    const trialData = {
      student_name: studentInfo.name,
      student_id: studentInfo.id,
      trial_number: currentTrial + 1,
      stimulus_type: stimulus.type,
      stimulus_word: stimulus.word,
      stimulus_color: stimulus.color,
      correct_response: stimulus.correct,
      participant_response: key,
      reaction_time: reactionTime,
      is_correct: isCorrect,
      session_start_time: sessionStartTime,
      timestamp: new Date().toISOString()
    };

    if (phase === "practice") {
      setPracticeResults(prev => [...prev, trialData]);
    } else {
      setResults(prev => [...prev, trialData]);
    }

    nextTrial();
  }, [phase, showStimulus, interTrialDelay, trialStartTime, currentTrial, practiceSequence, trialSequence, studentInfo, sessionStartTime]);

  // Handle timeouts
  useEffect(() => {
    if (!showStimulus || interTrialDelay) return;

    const timeoutId = setTimeout(() => {
      const currentSequence = phase === "practice" ? practiceSequence : trialSequence;
      const stimulus = currentSequence[currentTrial];

      const trialData = {
        student_name: studentInfo.name,
        student_id: studentInfo.id,
        trial_number: currentTrial + 1,
        stimulus_type: stimulus.type,
        stimulus_word: stimulus.word,
        stimulus_color: stimulus.color,
        correct_response: stimulus.correct,
        participant_response: "timeout",
        reaction_time: RESPONSE_TIMEOUT,
        is_correct: false,
        session_start_time: sessionStartTime,
        timestamp: new Date().toISOString()
      };

      if (phase === "practice") {
        setPracticeResults(prev => [...prev, trialData]);
      } else {
        setResults(prev => [...prev, trialData]);
      }

      nextTrial();
    }, RESPONSE_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [showStimulus, interTrialDelay, phase, currentTrial, practiceSequence, trialSequence, studentInfo, sessionStartTime]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const nextTrial = () => {
    setShowStimulus(false);
    setInterTrialDelay(true);

    setTimeout(() => {
      const maxTrials = phase === "practice" ? PRACTICE_TRIALS : TOTAL_TRIALS;
      
      if (currentTrial + 1 >= maxTrials) {
        if (phase === "practice") {
          setPhase("practice_complete");
        } else {
          handleTaskComplete();
        }
      } else {
        setCurrentTrial(prev => prev + 1);
        setInterTrialDelay(false);
        startTrial();
      }
    }, 1000);
  };

  const startTrial = () => {
    setTimeout(() => {
      setTrialStartTime(Date.now());
      setShowStimulus(true);
    }, 500 + Math.random() * 1000);
  };

  const handleSetupComplete = (info) => {
    setStudentInfo(info);
    setSessionStartTime(new Date().toISOString());
    setPhase("practice");
  };

  const handlePracticeComplete = () => {
    setCurrentTrial(0); // Reset trial counter for main task
    setShowStimulus(false); // Reset stimulus display
    setInterTrialDelay(false); // Reset delay state
    setPhase("task");
  };

  const handleTaskComplete = async () => {
    // Don't change phase yet, save data first
    try {
      for (const result of results) {
        await fetch('/api/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        });
      }
    } catch (error) {
      console.error('Error saving results:', error);
      // Fallback to localStorage
      const existingResults = JSON.parse(localStorage.getItem('stroopResults') || '[]');
      localStorage.setItem('stroopResults', JSON.stringify([...existingResults, ...results]));
    }
    // Now change phase
    setPhase("complete");
  };

  // Start first trial when practice or task begins
  useEffect(() => {
    if ((phase === "practice" && practiceSequence.length > 0) || 
        (phase === "task" && trialSequence.length > 0)) {
      startTrial();
    }
  }, [phase, practiceSequence.length, trialSequence.length]);

  // Set current stimulus
  useEffect(() => {
    const currentSequence = phase === "practice" ? practiceSequence : trialSequence;
    if (currentSequence.length > 0 && currentTrial < currentSequence.length) {
      setCurrentStimulus(currentSequence[currentTrial]);
    }
  }, [phase, currentTrial, practiceSequence, trialSequence]);

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
    return <TaskComplete results={results} studentInfo={studentInfo} />;
  }

  const totalTrials = phase === "practice" ? PRACTICE_TRIALS : TOTAL_TRIALS;
  const progressPercentage = ((currentTrial + 1) / totalTrials) * 100;

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
              <Progress value={progressPercentage} className="h-2" />
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
              interTrialDelay={interTrialDelay}
              isPractice={phase === "practice"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
