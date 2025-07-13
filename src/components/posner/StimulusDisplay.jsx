import React from 'react';

const StimulusDisplay = ({ 
  trial, 
  showingFixation, 
  showStimulus, 
  showingCue,
  showingTarget,
  currentPhase // 'fixation', 'cue', 'delay', 'target'
}) => {
  if (!trial) return null;

  // Debug logging
  console.log(`[POSNER DISPLAY] Phase: ${currentPhase}, CueType: ${trial.cueType}, CueLocation: ${trial.cueLocation}, ShowingCue: ${showingCue}, ShowingTarget: ${showingTarget}, TargetLocation: ${trial.targetLocation}`);

  // Display dimensions and positioning
  const boxSize = 80;
  const boxDistance = 280; // Distance from center (increased from 200)
  const targetSize = 24;

  return (
    <div className="flex flex-col items-center bg-gray-100 h-screen pt-16 overflow-hidden">
      {/* Main display area */}
      <div className="relative w-[700px] h-[400px] bg-white rounded-lg shadow-lg flex items-center justify-center">
        
        {/* Left stimulus box */}
        <div 
          className={`absolute border-2 flex items-center justify-center transition-all duration-100
            ${trial.cueType === 'exogenous' && currentPhase === 'cue' && trial.cueLocation === 'left' 
              ? 'border-yellow-400 bg-yellow-200 shadow-lg border-4' 
              : 'border-gray-400 bg-gray-50'}`}
          style={{
            width: `${boxSize}px`,
            height: `${boxSize}px`,
            left: `${350 - boxDistance - boxSize/2}px`,
            top: `${200 - boxSize/2}px`
          }}
        >
          {/* Target in left box */}
          {showingTarget && trial.targetLocation === 'left' && (
            <div className="w-6 h-6 bg-black rounded-full"></div>
          )}
        </div>

        {/* Right stimulus box */}
        <div 
          className={`absolute border-2 flex items-center justify-center transition-all duration-100
            ${trial.cueType === 'exogenous' && currentPhase === 'cue' && trial.cueLocation === 'right' 
              ? 'border-yellow-400 bg-yellow-200 shadow-lg border-4' 
              : 'border-gray-400 bg-gray-50'}`}
          style={{
            width: `${boxSize}px`,
            height: `${boxSize}px`,
            left: `${350 + boxDistance - boxSize/2}px`,
            top: `${200 - boxSize/2}px`
          }}
        >
          {/* Target in right box */}
          {showingTarget && trial.targetLocation === 'right' && (
            <div className="w-6 h-6 bg-black rounded-full"></div>
          )}
        </div>

        {/* Central fixation cross and endogenous cue */}
        <div className="absolute flex items-center justify-center" style={{
          left: '350px',
          top: '200px',
          transform: 'translate(-50%, -50%)'
        }}>
          {/* Show endogenous cue (central arrow) or fixation cross */}
          {trial.cueType === 'endogenous' && currentPhase === 'cue' ? (
            /* Endogenous cue (central arrow) - replaces fixation cross */
            <div className="flex items-center justify-center w-12 h-12">
              <span className={`text-5xl font-bold text-blue-600`}>
                {trial.cueLocation === 'left' ? '←' : '→'}
              </span>
            </div>
          ) : (
            /* Fixation cross - visible during fixation, delay, and target phases */
            <span className="text-2xl font-bold text-black">+</span>
          )}
        </div>

        {/* Instructions at bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm text-gray-600">
            Keep your eyes on the central cross
          </p>
          <p className="text-sm text-gray-600">
            Press <span className="font-bold">SPACEBAR</span> when you see the target dot
          </p>
        </div>
      </div>
    </div>
  );
};

export default StimulusDisplay;
