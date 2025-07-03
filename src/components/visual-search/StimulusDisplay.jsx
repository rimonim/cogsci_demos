import React from "react";

export default function StimulusDisplay({ stimulus, showStimulus, showingFixation, interTrialDelay, isPractice, colors }) {
  // Show inter-trial delay indicator
  if (interTrialDelay) {
    return (
      <div className="text-center min-h-[400px] flex items-center justify-center">
        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
      </div>
    );
  }

  // Show fixation cross
  if (showingFixation || (!showStimulus && !stimulus)) {
    return (
      <div className="text-center min-h-[400px] flex items-center justify-center">
        <div className="text-4xl text-slate-400 font-bold">+</div>
      </div>
    );
  }

  // Show stimulus
  if (!showStimulus || !stimulus) {
    return (
      <div className="text-center min-h-[400px] flex items-center justify-center">
        <div className="text-4xl text-slate-400 font-bold">+</div>
      </div>
    );
  }

  // Calculate grid layout based on set size
  const gridSize = Math.ceil(Math.sqrt(stimulus.setSize * 1.5)); // Give some extra space
  const positions = [];
  
  // Generate random positions for stimuli
  const usedPositions = new Set();
  for (let i = 0; i < stimulus.stimuli.length; i++) {
    let pos;
    do {
      pos = Math.floor(Math.random() * (gridSize * gridSize));
    } while (usedPositions.has(pos));
    usedPositions.add(pos);
    positions.push(pos);
  }

  return (
    <div className="text-center min-h-[400px] flex flex-col items-center justify-center">
      {/* Search array */}
      <div 
        className="grid gap-3 mb-8"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `${gridSize * 50}px`,
          height: `${gridSize * 50}px`
        }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, index) => {
          const stimulusIndex = positions.indexOf(index);
          const hasStimulus = stimulusIndex !== -1;
          
          if (!hasStimulus) {
            return <div key={index} className="w-10 h-10" />;
          }
          
          const item = stimulus.stimuli[stimulusIndex];
          const color = colors[item.color];
          const isVertical = item.orientation === 'vertical';
          
          return (
            <div key={index} className="w-10 h-10 flex items-center justify-center">
              <div
                className="transition-all duration-200"
                style={{
                  backgroundColor: color,
                  width: isVertical ? '4px' : '24px',
                  height: isVertical ? '24px' : '4px',
                  borderRadius: '2px'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Response instructions */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 max-w-sm">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">J</kbd>
            <span className="text-emerald-600 font-medium">Target Present</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">K</kbd>
            <span className="text-red-600 font-medium">Target Absent</span>
          </div>
        </div>
      </div>

      {/* Practice trial help */}
      {isPractice && (
        <div className="mt-4 bg-purple-50 rounded-lg p-3 max-w-md">
          <p className="text-xs text-purple-700">
            <strong>Practice:</strong> Look for blue vertical lines (|) or orange horizontal lines (—)
          </p>
        </div>
      )}
    </div>
  );
}
