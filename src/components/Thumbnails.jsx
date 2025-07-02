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
        
        {/* Keyboard response instructions */}
        <div className="bg-white rounded-full px-5 py-2 border border-slate-200">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">B</kbd>
              <span className="text-blue-600 font-medium">Blue</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">R</kbd>
              <span className="text-red-600 font-medium">Red</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">G</kbd>
              <span className="text-green-600 font-medium">Green</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">Y</kbd>
              <span className="text-yellow-600 font-medium">Yellow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VisualSearchThumbnail = ({ className = "" }) => {
  const [currentArray, setCurrentArray] = useState(0);
  
  // Different search arrays to cycle through
  const searchArrays = [
    // Pop-out: orange vertical among blue horizontals
    [
      { color: '#0066CC', orientation: 'horizontal', isTarget: false },
      { color: '#FF6600', orientation: 'vertical', isTarget: true },
      { color: '#0066CC', orientation: 'horizontal', isTarget: false },
      { color: '#0066CC', orientation: 'horizontal', isTarget: false },
    ],
    // Conjunction: blue vertical among blue horizontal + orange vertical
    [
      { color: '#0066CC', orientation: 'vertical', isTarget: true },
      { color: '#0066CC', orientation: 'horizontal', isTarget: false },
      { color: '#FF6600', orientation: 'vertical', isTarget: false },
      { color: '#0066CC', orientation: 'horizontal', isTarget: false },
    ]
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArray(prev => (prev + 1) % searchArrays.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentItems = searchArrays[currentArray];

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-emerald-50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="p-8 flex flex-col items-center justify-center h-full">
        {/* Search array */}
        <div className="bg-white rounded-xl p-6 mb-4 min-h-[120px] flex items-center justify-center border border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            {currentItems.map((item, index) => (
              <div 
                key={index}
                className={`transition-all duration-300 ${item.isTarget ? 'ring-2 ring-emerald-400 ring-opacity-50' : ''}`}
                style={{
                  backgroundColor: item.color,
                  width: item.orientation === 'vertical' ? '3px' : '20px',
                  height: item.orientation === 'vertical' ? '20px' : '3px',
                  borderRadius: '1px'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Response instructions */}
        <div className="bg-white rounded-full px-5 py-2 border border-slate-200">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">J</kbd>
              <span className="text-emerald-600 font-medium">Present</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">K</kbd>
              <span className="text-red-600 font-medium">Absent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
