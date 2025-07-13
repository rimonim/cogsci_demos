import React from "react";

const COLORS = {
  red: '#EF4444',
  blue: '#3B82F6', 
  green: '#22C55E',
  yellow: '#EAB308',
  purple: '#A855F7',
  orange: '#F97316',
  pink: '#EC4899',
  cyan: '#06B6D4'
};

export default function StimulusDisplay({ 
  trial, 
  showStimulus, 
  awaitingResponse,
  feedback,
  phase,
  trialPhase
}) {

  // Show fixation cross during fixation phase or when waiting
  if (trialPhase === 'fixation' || (!trial && phase !== 'complete')) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-5xl text-slate-400 font-bold">+</div>
        {/* Show feedback during fixation for practice trials */}
        {feedback && feedback.show && (
          <div className="absolute text-center mt-16">
            <div className={`text-lg font-medium ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.text}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show inter-trial delay between trials (when not showing stimulus and not awaiting response)
  if (!showStimulus && !awaitingResponse && phase !== 'complete' && trial) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-5xl text-slate-400 font-bold">+</div>
        {/* Show feedback during inter-trial delay for practice trials */}
        {feedback && feedback.show && (
          <div className="absolute text-center mt-16">
            <div className={`text-lg font-medium ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.text}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show retention interval (blank screen between memory and test)
  if (trialPhase === 'retention') {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-5xl text-slate-400 font-bold">+</div>
      </div>
    );
  }

  const gridSize = trial.grid_size || 6;
  const gridWidth = 500; // Larger display for better visibility
  const gridHeight = 500;
  
  // All squares should be the same size for proper spatial correspondence
  const squareSize = 'w-12 h-12';

  // Determine which array to show based on trial phase
  let displayArray;
  
  if (trialPhase === 'memory' && showStimulus) {
    // Memory phase - show memory array (only when trial manager says stimulus is active)
    displayArray = trial.memory_array;
  } else if (trialPhase === 'test' && awaitingResponse) {
    // Test phase - show only the probe square (but only when actively awaiting response)
    displayArray = trial.test_array; // This should contain only one square
  } else {
    // Default blank state (includes memory phase before stimulus shows, retention, inter-trial, and after response)
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-5xl text-slate-400 font-bold">+</div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center">
      {/* Grid display */}
      <div 
        className="grid gap-2 mb-8"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `${gridWidth}px`,
          height: `${gridHeight}px`
        }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, index) => {
          // Find if there's a colored square at this position
          const square = displayArray?.find(s => s.position === index);
          
          return (
            <div key={index} className="flex items-center justify-center">
              {square ? (
                <div
                  className={`${squareSize}`}
                  style={{
                    backgroundColor: COLORS[square.color]
                  }}
                />
              ) : (
                <div className={squareSize} /> // Empty cell
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback for practice trials */}
      {feedback && feedback.show && (
        <div className="text-center">
          <div className={`text-lg font-medium ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
            {feedback.text}
          </div>
        </div>
      )}
    </div>
  );
}
