// Task configurations for the unified TaskSetup component
import { Play, Eye, Search, Brain } from "lucide-react";

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

export const NBACK_CONFIG = {
  taskName: "N-Back Task",
  theme: "indigo",
  icon: <Brain className="w-6 h-6" />,
  description: "Test your working memory with this n-back challenge",
  instructions: [
    "Watch the sequence of letters appearing on the screen",
    "Press SPACE when the current letter matches the one from 2 positions back",
    "Try to be both fast and accurate - it's challenging!"
  ],
  keyBindings: [
    { key: "SPACE", description: "when letter matches 2-back" }
  ],
  buttonText: "Start Practice Trials",
  showInstructions: true,
  gradientFrom: "from-slate-50",
  gradientTo: "to-indigo-50"
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

export const NBACK_PRACTICE_CONFIG = {
  taskName: "N-Back Task",
  theme: "indigo",
  title: "Practice Complete!",
  description: "Great job! Here's how you performed in the practice trials.",
  buttonText: "Continue to Main Task",
  showStats: true,
  reminders: [
    "Remember: press SPACE when the current letter matches 2 positions back",
    "Don't worry about missed targets - this task is very challenging",
    "Focus on accuracy first, speed will come with practice"
  ],
  keyBindings: [
    { key: "SPACE", description: "when letter matches 2-back" }
  ],
  gradientFrom: "from-slate-50",
  gradientTo: "to-indigo-50",
  accuracyWarningThreshold: 60,
  lowAccuracyMessage: "The n-back task is very challenging - don't worry if your accuracy was low! Focus on identifying when the current letter is the same as 2 trials back."
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
    "student_name", "student_id", "trial_number", "stimulus_type", "stimulus_display", 
    "correct_response", "participant_response", "reaction_time", "is_correct", "session_start_time"
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
    "student_name", "student_id", "trial_number", "stimulus_color", "stimulus_word", "stimulus_type",
    "correct_response", "participant_response", "reaction_time", "is_correct", "session_start_time"
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
    // Group by search type
    const colorPopoutTrials = results.filter(r => r.search_type === "color_popout");
    const orientationPopoutTrials = results.filter(r => r.search_type === "orientation_popout");
    const conjunctionTrials = results.filter(r => r.search_type === "conjunction");
    
    // Calculate accuracy for each search type
    const colorPopoutAccuracy = colorPopoutTrials.length > 0 
      ? (colorPopoutTrials.filter(r => r.is_correct).length / colorPopoutTrials.length) * 100 
      : 0;
    const orientationPopoutAccuracy = orientationPopoutTrials.length > 0 
      ? (orientationPopoutTrials.filter(r => r.is_correct).length / orientationPopoutTrials.length) * 100 
      : 0;
    const conjunctionAccuracy = conjunctionTrials.length > 0 
      ? (conjunctionTrials.filter(r => r.is_correct).length / conjunctionTrials.length) * 100 
      : 0;
    
    // Calculate RT for each search type (correct trials only)
    const colorPopoutRT = colorPopoutTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);
    
    const orientationPopoutRT = orientationPopoutTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);
      
    const conjunctionRT = conjunctionTrials
      .filter(r => r.is_correct && r.participant_response !== "timeout")
      .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

    return {
      color_popout_accuracy: colorPopoutAccuracy,
      color_popout_rt: colorPopoutRT,
      orientation_popout_accuracy: orientationPopoutAccuracy,
      orientation_popout_rt: orientationPopoutRT,
      conjunction_accuracy: conjunctionAccuracy,
      conjunction_rt: conjunctionRT
    };
  },
  downloadFields: [
    "student_name", "student_id", "trial_number", "search_type", "set_size", "target_present",
    "correct_response", "participant_response", "reaction_time", 
    "is_correct", "session_start_time"
  ]
};

export const NBACK_COMPLETE_CONFIG = {
  taskName: "N-Back Task",
  theme: "indigo",
  title: "N-Back Task Complete!",
  description: "Thank you for participating! Here are your results:",
  gradientFrom: "from-slate-50",
  gradientTo: "to-indigo-50",
  showDetailedStats: true,
  calculateCustomStats: (results) => {
    const targetTrials = results.filter(r => r.is_target === true);
    const nonTargetTrials = results.filter(r => r.is_target === false);
    
    // Calculate hits, misses, false alarms, correct rejections
    const hits = targetTrials.filter(r => r.participant_response === "match").length;
    const misses = targetTrials.filter(r => r.participant_response !== "match").length;
    const falseAlarms = nonTargetTrials.filter(r => r.participant_response === "match").length;
    const correctRejections = nonTargetTrials.filter(r => r.participant_response !== "match").length;
    
    // Calculate accuracy
    const totalCorrect = hits + correctRejections;
    const accuracy = (totalCorrect / results.length) * 100;
    
    // Response times for hits only
    const hitTrials = targetTrials.filter(r => r.participant_response === "match" && r.reaction_time > 0);
    const avgHitRT = hitTrials.length > 0 
      ? hitTrials.reduce((sum, r) => sum + r.reaction_time, 0) / hitTrials.length 
      : 0;

    // Simplified stats that show as integers (explicitly cast to integers to avoid decimal display)
    return {
      hits: parseInt(hits, 10),
      misses: parseInt(misses, 10),
      false_alarms: parseInt(falseAlarms, 10),
      correct_rejections: parseInt(correctRejections, 10)
    };
  },
  downloadFields: [
    "student_name", "student_id", "trial_number", "stimulus_letter", "is_target", "n_back_level",
    "correct_response", "participant_response", "reaction_time", "is_correct", "session_start_time"
  ]
};
