import React, { useState, useEffect } from 'react';

export const FlankerThumbnail = ({ className = "" }) => {
  const [currentStimulus, setCurrentStimulus] = useState(0);
  const stimuli = ['<<<<<', '>>>>>', '<<><<', '>><>>'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStimulus(prev => (prev + 1) % stimuli.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="p-8 flex flex-col items-center justify-center h-full">
        {/* Main stimulus display */}
        <div className="bg-white rounded-xl p-8 mb-4 min-h-[120px] flex items-center justify-center border border-slate-200">
          <div 
            className="text-4xl font-mono tracking-wider text-slate-800 select-none transition-all duration-300"
            style={{ fontFamily: 'Monaco, Consolas, monospace' }}
          >
            {stimuli[currentStimulus]}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-full px-5 py-2 border border-slate-200">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">←</kbd>
              <span className="font-medium">Left</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">→</kbd>
              <span className="font-medium">Right</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StroopThumbnail = ({ className = "" }) => {
  const [currentWord, setCurrentWord] = useState(0);
  const stroopItems = [
    { word: 'BLUE', color: '#ef4444' },  // red
    { word: 'RED', color: '#3b82f6' },   // blue  
    { word: 'GREEN', color: '#eab308' }, // yellow
    { word: 'YELLOW', color: '#22c55e' } // green
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % stroopItems.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-purple-50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="p-8 flex flex-col items-center justify-center h-full">
        {/* Stroop stimulus */}
        <div className="bg-white rounded-xl p-8 mb-4 min-h-[120px] flex items-center justify-center border border-slate-200">
          <div 
            className="text-4xl font-bold select-none transition-all duration-300"
            style={{ color: stroopItems[currentWord].color }}
          >
            {stroopItems[currentWord].word}
          </div>
        </div>
        
        {/* Color buttons */}
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-lg bg-red-500 hover:bg-red-600 transition-colors border border-red-600/20"></button>
          <button className="w-12 h-12 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors border border-blue-600/20"></button>
          <button className="w-12 h-12 rounded-lg bg-green-500 hover:bg-green-600 transition-colors border border-green-600/20"></button>
          <button className="w-12 h-12 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition-colors border border-yellow-600/20"></button>
        </div>
      </div>
    </div>
  );
};
