import React from 'react';

const StimulusDisplay = ({ 
  showStimulus, 
  currentLetter,
  awaitingResponse, 
  feedback, 
  showFixation 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-black rounded-lg p-8">
      {/* Fixation cross removed */}
      
      {/* Letter display */}
      {showStimulus && currentLetter && (
        <div className="text-8xl font-bold text-white font-mono select-none">
          {currentLetter}
        </div>
      )}

      {/* Feedback display */}
      {feedback?.show && (
        <div className={`
          text-xl font-semibold px-6 py-2 rounded-lg mt-8
          ${feedback.correct 
            ? 'text-green-700 bg-green-100 border border-green-200' 
            : 'text-red-700 bg-red-100 border border-red-200'
          }
        `}>
          {feedback.text}
        </div>
      )}

      {/* Response instruction removed as requested */}
    </div>
  );
};

export default StimulusDisplay;
