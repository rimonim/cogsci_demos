// Task configurations for the unified TaskSetup component
import { Play, Eye, Search, Brain, Target, RotateCw } from "lucide-react";

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

export const POSNER_CONFIG = {
  taskName: "Posner Cueing Task",
  theme: "green",
  icon: <Target className="w-6 h-6" />,
  description: "Spatial attention and covert orienting experiment",
  instructions: [
    "Focus on the central fixation cross at all times",
    "Watch for arrow cues or peripheral flashes",
    "Respond to the target dot as quickly as possible",
    "You'll start with practice trials, then the main task"
  ],
  keyBindings: [
    { key: "Spacebar", description: "when you see the target dot" }
  ],
  buttonText: "Start Practice Trials",
  showInstructions: true,
  gradientFrom: "from-slate-50",
  gradientTo: "to-green-50"
};

export const MENTAL_ROTATION_CONFIG = {
  taskName: "Mental Rotation Task",
  theme: "indigo",
  icon: <RotateCw className="w-6 h-6" />,
  description: "Decide if two shapes are the same or different",
  instructions: [
    "Compare two shapes and decide if they're the same or different",
    "Ignore rotation - focus only on the shape itself",
    "Watch out for mirror images - they look similar but are different",
    "Shapes can be rotated to any angle (continuous rotation)",
    "You'll start with practice trials, then the main task"
  ],
  keyBindings: [
    { key: "S", description: "if shapes are the same" },
    { key: "D", description: "if shapes are different" }
  ],
  buttonText: "Start Practice Trials",
  showInstructions: true,
  gradientFrom: "from-slate-50",
  gradientTo: "to-indigo-50"
};

export const CHANGE_DETECTION_CONFIG = {
  taskName: "Change Detection Task",
  theme: "teal",
  icon: <Brain className="w-6 h-6" />,
  description: "Test your visual working memory capacity",
  instructions: [
    "You'll see grids of colored squares that appear briefly",
    "After a delay, a single square will appear - decide if its color changed",
    "Try to be both fast and accurate",
    "Your Cowan's K score measures how many items you can hold in visual memory"
  ],
  keyBindings: [
    { key: "S", description: "if the color is the SAME" },
    { key: "D", description: "if the color CHANGED" }
  ],
  buttonText: "Start Practice Trials",
  showInstructions: true,
  gradientFrom: "from-slate-50",
  gradientTo: "to-teal-50",
  exampleDisplay: {
    title: "Example Trial Sequence",
    steps: [
      {
        label: "1. Memory Array",
        description: "Study the colored squares (200ms)",
        visual: "grid"
      },
      {
        label: "2. Blank Delay", 
        description: "Remember the colors (900ms)",
        visual: "blank"
      },
      {
        label: "3. Test",
        description: "Did this square's color change?",
        visual: "probe"
      }
    ]
  }
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

export const POSNER_PRACTICE_CONFIG = {
  taskName: "Posner Cueing Task",
  theme: "green",
  icon: <Target className="w-6 h-6" />,
  title: "Practice Complete!",
  description: "Great job! Here are your reaction times:",
  buttonText: "Continue to Main Task",
  showInstructions: false,
  showStats: true,
  reminders: [
    "Keep your eyes on the central cross",
    "Press SPACEBAR when you see the target dot",
    "Respond as quickly as possible"
  ],
  keyBindings: [
    { key: "Spacebar", description: "when you see the target dot" }
  ],
  gradientFrom: "from-slate-50",
  gradientTo: "to-green-50",
  showAccuracy: false, // Don't show accuracy for Posner task
  calculateStats: (results) => {
    if (!results || results.length === 0) return { validCuedRT: null, invalidCuedRT: null, trialsResponded: 0 };
    
    // Only include target trials with responses (not timeouts)
    const targetTrials = results.filter(r => r.targetPresent && r.response === 'space' && r.reaction_time > 0);
    
    const validCuedTrials = targetTrials.filter(r => r.cueValidity === 'valid');
    const invalidCuedTrials = targetTrials.filter(r => r.cueValidity === 'invalid');
    
    console.log('[POSNER STATS DEBUG] Target trials:', {
      total: targetTrials.length,
      valid: validCuedTrials.map(t => ({ rt: t.reaction_time, cue: t.cueType })),
      invalid: invalidCuedTrials.map(t => ({ rt: t.reaction_time, cue: t.cueType }))
    });
    
    const validCuedRT = validCuedTrials.length > 0 ? 
      Math.round(validCuedTrials.reduce((sum, r) => sum + r.reaction_time, 0) / validCuedTrials.length) : null;
    const invalidCuedRT = invalidCuedTrials.length > 0 ? 
      Math.round(invalidCuedTrials.reduce((sum, r) => sum + r.reaction_time, 0) / invalidCuedTrials.length) : null;
    
    return {
      validCuedRT,
      invalidCuedRT,
      trialsResponded: targetTrials.length,
      totalTargets: results.filter(r => r.targetPresent).length
    };
  }
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

export const POSNER_COMPLETE_CONFIG = {
  taskName: "Posner Cueing Task",
  theme: "green",
  icon: <Target className="w-6 h-6" />,
  title: "Task Complete!",
  description: "Excellent work! Here are your reaction times by cue condition:",
  gradientFrom: "from-slate-50",
  gradientTo: "to-green-50",
  showDetailedStats: true,
  showAccuracy: false, // Don't show accuracy for Posner task
  calculateCustomStats: (results) => {
    if (!results || results.length === 0) return {};
    
    // Only include target trials with valid responses
    const targetTrials = results.filter(r => r.targetPresent && r.response === 'space' && r.reaction_time > 0);
    
    const validCuedTrials = targetTrials.filter(r => r.cueValidity === 'valid');
    const invalidCuedTrials = targetTrials.filter(r => r.cueValidity === 'invalid');
    
    const validCuedRT = validCuedTrials.length > 0 ? 
      validCuedTrials.reduce((sum, r) => sum + r.reaction_time, 0) / validCuedTrials.length : null;
    const invalidCuedRT = invalidCuedTrials.length > 0 ? 
      invalidCuedTrials.reduce((sum, r) => sum + r.reaction_time, 0) / invalidCuedTrials.length : null;
    
    // Calculate cueing effects (only if we have the necessary data)
    const validityEffect = (invalidCuedRT !== null && validCuedRT !== null) ? invalidCuedRT - validCuedRT : null;
    
    // Group by SOA for additional analysis
    const soa50Trials = targetTrials.filter(r => r.soa === 50);
    const soa150Trials = targetTrials.filter(r => r.soa === 150);
    const soa300Trials = targetTrials.filter(r => r.soa === 300);
    const soa500Trials = targetTrials.filter(r => r.soa === 500);
    
    const soa50RT = soa50Trials.length > 0 ? soa50Trials.reduce((sum, r) => sum + r.reaction_time, 0) / soa50Trials.length : null;
    const soa150RT = soa150Trials.length > 0 ? soa150Trials.reduce((sum, r) => sum + r.reaction_time, 0) / soa150Trials.length : null;
    const soa300RT = soa300Trials.length > 0 ? soa300Trials.reduce((sum, r) => sum + r.reaction_time, 0) / soa300Trials.length : null;
    const soa500RT = soa500Trials.length > 0 ? soa500Trials.reduce((sum, r) => sum + r.reaction_time, 0) / soa500Trials.length : null;

    return {
      valid_cued_rt: validCuedRT !== null ? Math.round(validCuedRT) : null,
      invalid_cued_rt: invalidCuedRT !== null ? Math.round(invalidCuedRT) : null,
      validity_effect: validityEffect !== null ? Math.round(validityEffect) : null,
      soa_50ms_rt: soa50RT !== null ? Math.round(soa50RT) : null,
      soa_150ms_rt: soa150RT !== null ? Math.round(soa150RT) : null,
      soa_300ms_rt: soa300RT !== null ? Math.round(soa300RT) : null,
      soa_500ms_rt: soa500RT !== null ? Math.round(soa500RT) : null,
      trials_responded: targetTrials.length,
      total_targets: results.filter(r => r.targetPresent).length
    };
  },
  downloadFields: [
    "student_name", "student_id", "trial_number", "cueType", "cueValidity", "targetLocation", 
    "soa", "targetPresent", "correctResponse", "response", "reaction_time", 
    "is_correct", "session_start_time"
  ]
};

export const MENTAL_ROTATION_PRACTICE_CONFIG = {
  taskName: "Mental Rotation Task",
  theme: "indigo",
  icon: <RotateCw className="w-6 h-6" />,
  title: "Practice Complete!",
  description: "Great job! You're ready for the main task.",
  buttonText: "Continue to Main Task",
  showInstructions: false,
  showStats: true,
  reminders: [
    "Focus on the shape, not the rotation",
    "Watch out for mirror images - they're different shapes",
    "S = Same shape, D = Different shape",
    "Be as accurate and fast as possible"
  ],
  keyBindings: [
    { key: "S", description: "if shapes are the same" },
    { key: "D", description: "if shapes are different" }
  ],
  gradientFrom: "from-slate-50",
  gradientTo: "to-indigo-50",
  accuracyWarningThreshold: 50, // Lower threshold since task is harder
  lowAccuracyMessage: "Remember to focus on the shape itself, not how it's rotated. Try to mentally rotate one shape to see if it matches the other. Watch out for mirror images - they look very similar but are different shapes!"
};

export const MENTAL_ROTATION_COMPLETE_CONFIG = {
  taskName: "Mental Rotation Task",
  theme: "indigo",
  icon: <RotateCw className="w-6 h-6" />,
  title: "Mental Rotation Task Complete!",
  description: "Thank you for completing the mental rotation task!",
  buttonText: "Return to Home",
  showStats: true,
  gradientFrom: "from-slate-50",
  gradientTo: "to-indigo-50",
  calculateStats: (results) => {
    if (!results || results.length === 0) return { sameShapeAcc: 0, differentShapeAcc: 0, overallAcc: 0, sameShapeRT: 0, differentShapeRT: 0, overallRT: 0 };
    
    const validResults = results.filter(r => r.response && r.reaction_time > 0);
    if (validResults.length === 0) return { sameShapeAcc: 0, differentShapeAcc: 0, overallAcc: 0, sameShapeRT: 0, differentShapeRT: 0, overallRT: 0 };
    
    // Split by trial type
    const sameTrials = validResults.filter(r => r.trialType === 'same');
    const differentTrials = validResults.filter(r => r.trialType === 'different');
    
    // Calculate accuracy
    const sameCorrect = sameTrials.filter(r => r.is_correct).length;
    const differentCorrect = differentTrials.filter(r => r.is_correct).length;
    const totalCorrect = validResults.filter(r => r.is_correct).length;
    
    const sameShapeAcc = sameTrials.length > 0 ? (sameCorrect / sameTrials.length) * 100 : 0;
    const differentShapeAcc = differentTrials.length > 0 ? (differentCorrect / differentTrials.length) * 100 : 0;
    const overallAcc = (totalCorrect / validResults.length) * 100;
    
    // Calculate reaction times (only for correct responses)
    const sameCorrectTrials = sameTrials.filter(r => r.is_correct);
    const differentCorrectTrials = differentTrials.filter(r => r.is_correct);
    const allCorrectTrials = validResults.filter(r => r.is_correct);
    
    const sameShapeRT = sameCorrectTrials.length > 0 
      ? sameCorrectTrials.reduce((sum, r) => sum + r.reaction_time, 0) / sameCorrectTrials.length 
      : 0;
    const differentShapeRT = differentCorrectTrials.length > 0 
      ? differentCorrectTrials.reduce((sum, r) => sum + r.reaction_time, 0) / differentCorrectTrials.length 
      : 0;
    const overallRT = allCorrectTrials.length > 0 
      ? allCorrectTrials.reduce((sum, r) => sum + r.reaction_time, 0) / allCorrectTrials.length 
      : 0;

    return {
      same_shape_accuracy: Math.round(sameShapeAcc * 10) / 10,
      different_shape_accuracy: Math.round(differentShapeAcc * 10) / 10,
      overall_accuracy: Math.round(overallAcc * 10) / 10,
      same_shape_rt: Math.round(sameShapeRT),
      different_shape_rt: Math.round(differentShapeRT),
      overall_rt: Math.round(overallRT),
      total_trials: validResults.length
    };
  },
  downloadFields: [
    "student_name", "student_id", "trial_number", "shape_type", "left_rotation", 
    "right_rotation", "trial_type", "correct_response", "participant_response", 
    "reaction_time", "is_correct", "session_start_time"
  ]
};

export const CHANGE_DETECTION_PRACTICE_CONFIG = {
  taskName: "Change Detection Task",
  theme: "teal",
  title: "Practice Complete!",
  description: "Great job! Here's how you performed in the practice trials.",
  buttonText: "Continue to Main Task",
  showStats: true,
  reminders: [
    "Focus on remembering both colors and their locations",
    "Take a moment to study each array carefully",
    "Don't worry if it's challenging - this tests the limits of visual memory"
  ],
  keyBindings: [
    { key: "S", description: "Same color" },
    { key: "D", description: "Different color" }
  ],
  gradientFrom: "from-slate-50",
  gradientTo: "to-teal-50",
  accuracyWarningThreshold: 60,
  lowAccuracyMessage: "Working memory tasks are very challenging! Focus on studying each array carefully. The main task will give you more practice.",
  // Custom stats calculation for practice results
  calculateStats: (results) => {
    if (!results || results.length === 0) return null;
    
    const validResults = results.filter(r => 
      r.reaction_time > 0 && 
      r.participant_response && 
      r.participant_response !== 'timeout'
    );
    
    if (validResults.length === 0) return null;
    
    const correctResponses = validResults.filter(r => r.is_correct);
    const accuracy = (correctResponses.length / validResults.length) * 100;
    const avgRT = correctResponses.length > 0 
      ? correctResponses.reduce((sum, r) => sum + r.reaction_time, 0) / correctResponses.length 
      : 0;
    
    return {
      accuracy: accuracy.toFixed(1),
      avgRT: avgRT.toFixed(0),
      totalTrials: validResults.length,
      correctTrials: correctResponses.length
    };
  }
};

export const CHANGE_DETECTION_COMPLETE_CONFIG = {
  taskName: "Change Detection Task",
  theme: "teal",
  title: "Change Detection Task Complete!",
  description: "Thank you for participating! Here are your visual working memory results:",
  gradientFrom: "from-slate-50",
  gradientTo: "to-teal-50",
  showDetailedStats: true,
  calculateCustomStats: (results) => {
    if (!results || results.length === 0) return {};
    
    const validResults = results.filter(r => 
      r.reaction_time > 0 && 
      r.participant_response && 
      r.participant_response !== 'timeout'
    );
    
    if (validResults.length === 0) return {};
    
    // Group by set size
    const setSize4Trials = validResults.filter(r => r.set_size === 4);
    const setSize8Trials = validResults.filter(r => r.set_size === 8);
    
    // Calculate accuracy for each set size
    const setSize4Accuracy = setSize4Trials.length > 0 
      ? (setSize4Trials.filter(r => r.is_correct).length / setSize4Trials.length) * 100 
      : 0;
    const setSize8Accuracy = setSize8Trials.length > 0 
      ? (setSize8Trials.filter(r => r.is_correct).length / setSize8Trials.length) * 100 
      : 0;
    
    // Calculate reaction times (only for correct responses)
    const setSize4Correct = setSize4Trials.filter(r => r.is_correct);
    const setSize8Correct = setSize8Trials.filter(r => r.is_correct);
    
    const setSize4RT = setSize4Correct.length > 0 
      ? setSize4Correct.reduce((sum, r) => sum + r.reaction_time, 0) / setSize4Correct.length 
      : 0;
    const setSize8RT = setSize8Correct.length > 0 
      ? setSize8Correct.reduce((sum, r) => sum + r.reaction_time, 0) / setSize8Correct.length 
      : 0;
    
    // Calculate Cowan's K (working memory capacity)
    const k4 = 4 * (2 * (setSize4Accuracy / 100) - 1);
    const k8 = 8 * (2 * (setSize8Accuracy / 100) - 1);
    const overallK = (k4 + k8) / 2;
    
    return {
      set_size_4_accuracy: Math.round(setSize4Accuracy * 10) / 10,
      set_size_8_accuracy: Math.round(setSize8Accuracy * 10) / 10,
      set_size_4_rt: Math.round(setSize4RT),
      set_size_8_rt: Math.round(setSize8RT),
      cowan_k_4: Math.round(k4 * 100) / 100,
      cowan_k_8: Math.round(k8 * 100) / 100,
      working_memory_capacity: Math.round(overallK * 100) / 100,
      total_trials: validResults.length
    };
  },
  downloadFields: [
    "student_name", "student_id", "trial_number", "set_size", 
    "participant_response", "correct_response", 
    "reaction_time", "is_correct", "session_start_time"
  ]
};
