import React from 'react';

export default function StimulusDisplay({ showStimulus, stimulus, awaitingResponse, feedback }) {
  const getFeedbackStyles = () => {
    if (!feedback || !feedback.show) return "opacity-0";
    return feedback.correct 
      ? "text-emerald-600 opacity-100" 
      : "text-red-600 opacity-100";
  };
  
  return (
    <div className="h-48 w-full flex flex-col items-center justify-center transition-all duration-200">
      {/* Stimulus or Fixation Cross */}
      <div className="h-24 flex items-center justify-center">
        {!showStimulus ? (
          <div className="text-6xl font-bold text-slate-800 select-none">+</div>
        ) : (
          <div className="text-6xl font-mono font-bold text-slate-900 tracking-wider select-none">
            {stimulus?.display}
          </div>
        )}
      </div>

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