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
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        {/* Main stimulus display */}
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-[280px] flex items-center justify-center border border-slate-200 shadow-sm">
          <div 
            className="text-3xl sm:text-4xl lg:text-5xl font-mono tracking-wider text-slate-800 select-none transition-all duration-300 whitespace-nowrap"
            style={{ fontFamily: 'Monaco, Consolas, monospace' }}
          >
            {stimuli[currentStimulus]}
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
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        {/* Stroop stimulus */}
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-[280px] flex items-center justify-center border border-slate-200 shadow-sm">
          <div className="flex justify-center items-center w-full">
            <div 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold select-none transition-all duration-300 text-center"
              style={{ 
                color: stroopItems[currentWord].color,
                display: 'inline-block'
              }}
            >
              {stroopItems[currentWord].word}
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
      { color: '#0066CC', orientation: 'horizontal' },
      { color: '#FF6600', orientation: 'vertical' },
      { color: '#0066CC', orientation: 'horizontal' },
      { color: '#0066CC', orientation: 'horizontal' },
    ],
    // Conjunction: blue vertical among blue horizontal + orange vertical
    [
      { color: '#0066CC', orientation: 'vertical' },
      { color: '#0066CC', orientation: 'horizontal' },
      { color: '#FF6600', orientation: 'vertical' },
      { color: '#0066CC', orientation: 'horizontal' },
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
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        {/* Search array */}
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-[280px] flex items-center justify-center border border-slate-200 shadow-sm">
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6 w-[60px] h-[60px]">
            {currentItems.map((item, index) => (
              <div 
                key={index}
                className="transition-all duration-300 flex items-center justify-center"
              >
                <div
                  style={{
                    backgroundColor: item.color,
                    width: item.orientation === 'vertical' ? '3px' : '20px',
                    height: item.orientation === 'vertical' ? '20px' : '3px',
                    borderRadius: '1px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NBackThumbnail = ({ className = "" }) => {
  const [showLetter, setShowLetter] = useState(true);
  const [currentLetter, setCurrentLetter] = useState(0);
  
  // Letters to cycle through - same smaller set as the task
  const letters = ['F', 'H', 'K', 'L'];
  
  useEffect(() => {
    // Toggle between showing letter and blank screen
    const blinkInterval = setInterval(() => {
      setShowLetter(prev => !prev);
    }, 1000); // 1000ms on, 1000ms off (slower)
    
    // Change letter every full cycle
    const letterInterval = setInterval(() => {
      setCurrentLetter(prev => (prev + 1) % letters.length);
    }, 6000); // Change letter every 6 seconds (slower)
    
    return () => {
      clearInterval(blinkInterval);
      clearInterval(letterInterval);
    };
  }, []);

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        {/* Letter display */}
        <div className="bg-black rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-[280px] flex items-center justify-center border border-slate-200 shadow-sm min-h-[120px]">
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-mono transition-all duration-200 h-[60px] flex items-center justify-center">
            {showLetter ? letters[currentLetter] : ' '}
          </div>
        </div>
      </div>
    </div>
  );
};
