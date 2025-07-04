import React, { useState, useEffect, useCallback } from "react";
import { FlankerResult } from "@/entities/FlankerResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import TaskSetup from "../components/flanker/TaskSetup";
import StimulusDisplay from "../components/flanker/StimulusDisplay";
import TaskComplete from "../components/flanker/TaskComplete";
import PracticeComplete from "../components/flanker/PracticeComplete";

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
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [phase, setPhase] = useState("loading"); // loading, setup, practice, practice_complete, task, complete
  const [studentInfo, setStudentInfo] = useState({ name: "Anonymous", id: "local" });
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [trialStartTime, setTrialStartTime] = useState(null);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [trialResults, setTrialResults] = useState([]);
  const [trialSequence, setTrialSequence] = useState([]);
  const [feedback, setFeedback] = useState(null);
  
  const responseGivenRef = React.useRef(false);
  const timeoutIdRef = React.useRef(null);

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

  // Check for session data on component mount
  useEffect(() => {
    if (sessionId && window.sessionData) {
      console.log('Found session data:', window.sessionData);
      const { studentInfo: sessionStudentInfo } = window.sessionData;
      if (sessionStudentInfo && sessionStudentInfo.name) {
        setStudentInfo({
          name: sessionStudentInfo.name,
          id: sessionStudentInfo.studentId || sessionStudentInfo.id || ''
        });
        setIsSessionMode(true);
        setSessionStartTime(new Date().toISOString());
        setTrialSequence(generateTrials(PRACTICE_TRIALS));
        setCurrentTrial(0);
        setPhase("practice");
        console.log('Auto-starting task with session data for:', sessionStudentInfo.name);
      }
    } else {
      // No session data - standalone mode, start directly
      console.log('No session data found, starting in standalone mode');
      setIsSessionMode(false);
      setSessionStartTime(new Date().toISOString());
      setTrialSequence(generateTrials(PRACTICE_TRIALS));
      setCurrentTrial(0);
      setPhase("practice");
    }
  }, [sessionId, generateTrials]);

  const handleResponse = useCallback(async (response, reactionTime) => {
    if (responseGivenRef.current || !currentStimulus) return;
    
    responseGivenRef.current = true;
    setAwaitingResponse(false);
    clearTimeout(timeoutIdRef.current);

    const isCorrect = response === currentStimulus.correct;
    
    if (phase === 'practice') {
      const feedbackText = response === 'timeout' ? 'Too Slow' : (isCorrect ? 'Correct!' : 'Incorrect');
      setFeedback({ show: true, text: feedbackText, correct: isCorrect });

      setTimeout(() => {
        if (currentTrial + 1 >= PRACTICE_TRIALS) {
          setPhase("practice_complete");
        } else {
          setCurrentTrial(prev => prev + 1);
        }
      }, 800);
    } else { // 'task' phase
      const actualRT = reactionTime || (performance.now() - trialStartTime);
      const result = {
        student_name: studentInfo.name, 
        student_id: studentInfo.id, 
        trial_number: currentTrial + 1,
        stimulus_type: currentStimulus.type, 
        stimulus_display: currentStimulus.display,
        correct_response: currentStimulus.correct, 
        participant_response: response,
        reaction_time: Math.round(actualRT), 
        is_correct: isCorrect, 
        session_start_time: sessionStartTime,
        // Include session data if available
        ...(isSessionMode && window.sessionData && {
          session_id: window.sessionData.sessionId,
          task_type: 'flanker'
        })
      };
      setTrialResults(prev => [...prev, result]);
      try {
        await FlankerResult.create(result);
      } catch (error) { console.error("Error saving result:", error); }
      setShowStimulus(false);
      if (currentTrial + 1 >= TOTAL_TRIALS) {
        setTimeout(() => setPhase("complete"), 500);
      } else {
        setTimeout(() => setCurrentTrial(prev => prev + 1), 200);
      }
    }
  }, [phase, currentStimulus, trialStartTime, studentInfo, currentTrial, sessionStartTime]);

  const startTrial = useCallback(() => {
    const trialsInPhase = phase === 'practice' ? PRACTICE_TRIALS : TOTAL_TRIALS;
    if (currentTrial >= trialsInPhase) return;
    
    responseGivenRef.current = false;
    setFeedback(null);
    clearTimeout(timeoutIdRef.current);

    const stimulus = trialSequence[currentTrial];
    setCurrentStimulus(stimulus);
    setShowStimulus(false);
    
    setTimeout(() => {
      setShowStimulus(true);
      setTrialStartTime(performance.now());
      setAwaitingResponse(true);
      timeoutIdRef.current = setTimeout(() => handleResponse("timeout", RESPONSE_TIMEOUT), RESPONSE_TIMEOUT);
    }, 500);
  }, [currentTrial, trialSequence, phase, handleResponse]);

  const startTask = (name, id) => {
    setStudentInfo({ name, id });
    setSessionStartTime(new Date().toISOString());
    setTrialSequence(generateTrials(PRACTICE_TRIALS));
    setCurrentTrial(0);
    setPhase("practice");
  };

  const startMainExperiment = () => {
    setPhase('task');
    setCurrentTrial(0);
    setTrialSequence(generateTrials(TOTAL_TRIALS));
    setFeedback(null);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!awaitingResponse) return;
      if (e.key === "ArrowLeft") handleResponse("left");
      else if (e.key === "ArrowRight") handleResponse("right");
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [awaitingResponse, handleResponse]);

  useEffect(() => {
    if ((phase === 'task' || phase === 'practice') && trialSequence.length > 0) {
      const delay = currentTrial === 0 ? 1000 : 800;
      const timerId = setTimeout(startTrial, delay);
      return () => clearTimeout(timerId);
    }
  }, [phase, currentTrial, trialSequence, startTrial]);

  useEffect(() => () => clearTimeout(timeoutIdRef.current), []);

  // Show loading while initializing
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (phase === "practice_complete") return <PracticeComplete onStartExperiment={startMainExperiment} />;
  if (phase === "complete") return <TaskComplete results={trialResults} studentInfo={studentInfo} />;

  const trialsForProgress = phase === 'practice' ? PRACTICE_TRIALS : TOTAL_TRIALS;
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
                {progressTitle} {currentTrial + 1} of {trialsForProgress}
              </div>
            </div>
            <Progress value={((currentTrial + 1) / trialsForProgress) * 100} className="h-2" />
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