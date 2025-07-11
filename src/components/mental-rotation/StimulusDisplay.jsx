import React from "react";

// Generate challenging mental rotation shapes using real fonts
const generateShape = (rotation = 0, shape = 'F') => {
  const shapeStyles = {
    'F': 'F',
    'F_MIRROR': 'F', // We'll mirror with CSS transform
    'R': 'R', 
    'R_MIRROR': 'R', // We'll mirror with CSS transform
    'P': 'P',
    'P_MIRROR': 'P', // We'll mirror with CSS transform
    'G': 'G',
    'G_MIRROR': 'G' // We'll mirror with CSS transform
  };

  const isMirrored = shape.includes('_MIRROR');
  const baseShape = shapeStyles[shape];
  
  return (
    <div 
      className="flex items-center justify-center w-[120px] h-[120px] transition-transform duration-200"
      style={{ 
        transform: `rotate(${rotation}deg) ${isMirrored ? 'scaleX(-1)' : ''}`,
        fontSize: '80px',
        fontFamily: 'Georgia, serif', // Use a serif font for better asymmetry
        fontWeight: 'bold',
        color: '#374151',
        userSelect: 'none'
      }}
    >
      {baseShape}
    </div>
  );
};

export default function StimulusDisplay({ 
  stimulus, 
  showStimulus, 
  showingFixation, 
  interTrialDelay, 
  isPractice,
  feedback 
}) {
  const getFeedbackStyles = () => {
    if (!feedback || !feedback.show) return "opacity-0";
    return feedback.correct 
      ? "text-emerald-600 opacity-100" 
      : "text-red-600 opacity-100";
  };
  // Show inter-trial delay indicator
  if (interTrialDelay) {
    return (
      <div className="text-center min-h-[300px] flex items-center justify-center">
        {/* Show feedback during inter-trial delay for practice */}
        {isPractice && feedback && feedback.show ? (
          <div className="text-center">
            <div className="w-2 h-2 bg-slate-400 rounded-full mx-auto mb-4"></div>
            <div className={`text-xl font-semibold transition-opacity duration-300 ${
              feedback.correct ? "text-emerald-600" : "text-red-600"
            }`}>
              {feedback.text}
            </div>
          </div>
        ) : (
          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
        )}
      </div>
    );
  }

  // Show fixation cross
  if (showingFixation || (!showStimulus && !stimulus)) {
    return (
      <div className="text-center min-h-[300px] flex items-center justify-center">
        <div className="text-2xl text-slate-400">+</div>
      </div>
    );
  }

  // Show stimulus pair
  if (showStimulus && stimulus) {
    return (
      <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
        {/* Shape pair */}
        <div className="flex items-center justify-center gap-16 mb-8">
          {/* Left shape */}
          <div className="flex flex-col items-center">
            <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
              {generateShape(stimulus.leftRotation, stimulus.shapeType)}
            </div>
            <div className="text-xs text-slate-500 mt-2">Left</div>
          </div>
          
          {/* Right shape */}
          <div className="flex flex-col items-center">
            <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
              {generateShape(stimulus.rightRotation, stimulus.rightShapeType || stimulus.shapeType)}
            </div>
            <div className="text-xs text-slate-500 mt-2">Right</div>
          </div>
        </div>

        {/* Key reminder for practice trials only */}
        {isPractice && (
          <div className="text-sm text-slate-500 space-y-2">
            <div className="text-center font-medium mb-3">Are these the same shape?</div>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-2 bg-slate-100 rounded text-sm font-mono">S</kbd>
                <span className="font-medium">Same Shape</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-2 bg-slate-100 rounded text-sm font-mono">D</kbd>
                <span className="font-medium">Different Shape</span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Area (for practice) */}
        <div className="h-8 mt-4 text-xl font-semibold transition-opacity duration-300">
          {feedback && (
            <span className={getFeedbackStyles()}>
              {feedback.text}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="text-center min-h-[300px] flex items-center justify-center">
      <div className="text-2xl text-slate-400">+</div>
    </div>
  );
}
