// Task configurations for the unified TaskSetup component
import { Play, Eye, Search } from "lucide-react";

export const FLANKER_CONFIG = {
  taskName: "Flanker Task Setup",
  theme: "blue",
  icon: <Play className="w-6 h-6" />,
  description: "Please enter your information to begin",
  instructions: [],
  keyBindings: [],
  buttonText: "Begin Task",
  showInstructions: false,
  gradientFrom: "from-slate-50",
  gradientTo: "to-blue-50"
};

export const STROOP_CONFIG = {
  taskName: "Stroop Task Setup",
  theme: "purple",
  icon: <Eye className="w-6 h-6" />,
  description: "Enter your information to begin",
  instructions: [],
  keyBindings: [],
  buttonText: "Start Practice Trials",
  showInstructions: false,
  gradientFrom: "from-slate-50",
  gradientTo: "to-purple-50"
};

export const VISUAL_SEARCH_CONFIG = {
  taskName: "Visual Search Task",
  theme: "purple",
  icon: <Search className="w-8 h-8" />,
  description: "Search for targets among distractors",
  instructions: [
    "Look for target shapes among distractor shapes",
    "Respond as quickly and accurately as possible",
    "You'll start with practice trials, then the main task"
  ],
  keyBindings: [
    { key: "J", description: "if you see the target" },
    { key: "K", description: "if no target is present" }
  ],
  buttonText: "Start Practice Trials",
  showInstructions: true,
  gradientFrom: "from-slate-50",
  gradientTo: "to-purple-50"
};

// PracticeComplete configurations
export const FLANKER_PRACTICE_CONFIG = {
  taskName: "Flanker Task",
  theme: "blue",
  title: "Practice Complete!",
  description: "You're ready to begin the main experiment. The following trials will be recorded.",
  buttonText: "Start Experiment",
  showStats: false,
  reminders: ["Respond as quickly and accurately as possible"],
  keyBindings: [],
  gradientFrom: "from-slate-50",
  gradientTo: "to-blue-50"
};

export const STROOP_PRACTICE_CONFIG = {
  taskName: "Stroop Task",
  theme: "purple",
  title: "Practice Complete!",
  description: "Great job! Here's how you performed:",
  buttonText: "Begin Main Task",
  showStats: true,
  reminders: [
    "Press the key for the color of the text",
    "Ignore what the word says",
    "Respond as quickly and accurately as possible"
  ],
  keyBindings: [
    { key: "B", description: "Blue" },
    { key: "R", description: "Red" },
    { key: "G", description: "Green" },
    { key: "Y", description: "Yellow" }
  ],
  gradientFrom: "from-slate-50",
  gradientTo: "to-purple-50"
};

export const VISUAL_SEARCH_PRACTICE_CONFIG = {
  taskName: "Visual Search Task",
  theme: "purple",
  title: "Practice Complete!",
  description: "Great job! Here's how you performed in the practice trials.",
  buttonText: "Continue to Main Task",
  showStats: true,
  reminders: [
    "Try to maintain both speed and accuracy",
    "Some searches will be easier (pop-out) than others (conjunction)",
    "Take your time if needed - there's no rush"
  ],
  keyBindings: [],
  gradientFrom: "from-slate-50",
  gradientTo: "to-purple-50",
  accuracyWarningThreshold: 70,
  lowAccuracyMessage: "Your accuracy was a bit low. Remember to look carefully for the target before responding. Don't worry - the main task will give you more practice!"
};

// TaskComplete configurations
export const FLANKER_COMPLETE_CONFIG = {
  taskName: "Flanker Task",
  theme: "blue",
  title: "Flanker Task Complete!",
  description: "Thank you for participating! Here are your results:",
  gradientFrom: "from-slate-50",
  gradientTo: "to-blue-50",
  showDetailedStats: true,
  calculateCustomStats: (results) => {
    const congruentTrials = results.filter(r => r.stimulus_type === "congruent");
    const incongruentTrials = results.filter(r => r.stimulus_type === "incongruent");
    
    const congruentAccuracy = congruentTrials.length > 0 
      ? (congruentTrials.filter(r => r.is_correct).length / congruentTrials.length) * 100 
      : 0;
    const incongruentAccuracy = incongruentTrials.length > 0 
      ? (incongruentTrials.filter(r => r.is_correct).length / incongruentTrials.length) * 100 
      : 0;
    
    const congruentRT = congruentTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);
    
    const incongruentRT = incongruentTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

    const flankerEffect = incongruentRT - congruentRT;

    return {
      congruent_accuracy: congruentAccuracy,
      incongruent_accuracy: incongruentAccuracy,
      congruent_rt: congruentRT,
      incongruent_rt: incongruentRT,
      flanker_effect: flankerEffect
    };
  },
  downloadFields: [
    "Student Name", "Student ID", "Trial", "Stimulus Type", "Stimulus Display", 
    "Correct Response", "Participant Response", "Reaction Time (ms)", "Correct", "Session Start"
  ]
};

export const STROOP_COMPLETE_CONFIG = {
  taskName: "Stroop Task",
  theme: "purple",
  title: "Stroop Task Complete!",
  description: "Thank you for participating! Here are your results:",
  gradientFrom: "from-slate-50",
  gradientTo: "to-purple-50",
  showDetailedStats: true,
  calculateCustomStats: (results) => {
    const congruentTrials = results.filter(r => r.stimulus_type === "congruent");
    const incongruentTrials = results.filter(r => r.stimulus_type === "incongruent");
    
    const congruentAccuracy = congruentTrials.length > 0 
      ? (congruentTrials.filter(r => r.is_correct).length / congruentTrials.length) * 100 
      : 0;
    const incongruentAccuracy = incongruentTrials.length > 0 
      ? (incongruentTrials.filter(r => r.is_correct).length / incongruentTrials.length) * 100 
      : 0;
    
    const congruentRT = congruentTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);
    
    const incongruentRT = incongruentTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

    const stroopEffect = incongruentRT - congruentRT;

    return {
      congruent_accuracy: congruentAccuracy,
      incongruent_accuracy: incongruentAccuracy,
      congruent_rt: congruentRT,
      incongruent_rt: incongruentRT,
      stroop_effect: stroopEffect
    };
  },
  downloadFields: [
    "Student Name", "Student ID", "Trial", "Color", "Word", "Stimulus Type",
    "Correct Response", "Participant Response", "Reaction Time (ms)", "Correct", "Session Start"
  ]
};

export const VISUAL_SEARCH_COMPLETE_CONFIG = {
  taskName: "Visual Search Task",
  theme: "purple",
  title: "Visual Search Task Complete!",
  description: "Thank you for participating! Here are your results:",
  gradientFrom: "from-slate-50",
  gradientTo: "to-purple-50",
  showDetailedStats: true,
  calculateCustomStats: (results) => {
    const targetPresentTrials = results.filter(r => r.target_present === true);
    const targetAbsentTrials = results.filter(r => r.target_present === false);
    
    const presentAccuracy = targetPresentTrials.length > 0 
      ? (targetPresentTrials.filter(r => r.is_correct).length / targetPresentTrials.length) * 100 
      : 0;
    const absentAccuracy = targetAbsentTrials.length > 0 
      ? (targetAbsentTrials.filter(r => r.is_correct).length / targetAbsentTrials.length) * 100 
      : 0;
    
    const presentRT = targetPresentTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);
    
    const absentRT = targetAbsentTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

    // Calculate by set size and search type if available
    const setSize4 = results.filter(r => r.set_size === 4);
    const setSize8 = results.filter(r => r.set_size === 8);
    
    const setSize4RT = setSize4
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);
    
    const setSize8RT = setSize8
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

    return {
      target_present_accuracy: presentAccuracy,
      target_absent_accuracy: absentAccuracy,
      target_present_rt: presentRT,
      target_absent_rt: absentRT,
      set_size_4_rt: setSize4RT,
      set_size_8_rt: setSize8RT,
      search_slope: setSize8RT - setSize4RT
    };
  },
  downloadFields: [
    "Student Name", "Student ID", "Trial", "Condition", "Set Size", "Target Present",
    "Search Type", "Correct Response", "Participant Response", "Reaction Time (ms)", 
    "Correct", "Session Start"
  ]
};
