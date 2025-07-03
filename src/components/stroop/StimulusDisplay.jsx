import React from "react";

export default function StimulusDisplay({ stimulus, showStimulus, showingFixation, interTrialDelay, isPractice }) {
  // Show inter-trial delay indicator
  if (interTrialDelay) {
    return (
      <div className="text-center min-h-[200px] flex items-center justify-center">
        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
      </div>
    );
  }

  // Show fixation cross
  if (showingFixation || (!showStimulus && !stimulus)) {
    return (
      <div className="text-center min-h-[200px] flex items-center justify-center">
        <div className="text-2xl text-slate-400">+</div>
      </div>
    );
  }

  // Show stimulus
  if (showStimulus && stimulus) {
    return (
      <div className="text-center min-h-[200px] flex flex-col items-center justify-center">
        {/* Main stimulus - word in color */}
        <div 
          className="text-6xl font-bold select-none mb-8"
          style={{ color: stimulus.color }}
        >
          {stimulus.word}
        </div>

        {/* Key reminder for practice trials only */}
        {isPractice && (
          <div className="text-sm text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">B</kbd>
                <span className="text-blue-600 font-medium">Blue</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">R</kbd>
                <span className="text-red-600 font-medium">Red</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">G</kbd>
                <span className="text-green-600 font-medium">Green</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Y</kbd>
                <span className="text-yellow-600 font-medium">Yellow</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className="text-center min-h-[200px] flex items-center justify-center">
      <div className="text-2xl text-slate-400">+</div>
    </div>
  );
}
