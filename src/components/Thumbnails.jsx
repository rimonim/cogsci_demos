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

export const PosnerThumbnail = ({ className = "" }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showCue, setShowCue] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [cueType, setCueType] = useState('endogenous'); // 'endogenous' or 'exogenous'
  const [targetSide, setTargetSide] = useState('right');
  
  useEffect(() => {
    const runCycle = () => {
      // Reset
      setShowCue(false);
      setShowTarget(false);
      setCurrentPhase(0);
      
      // Randomly choose cue type and target side
      setCueType(Math.random() > 0.5 ? 'endogenous' : 'exogenous');
      setTargetSide(Math.random() > 0.5 ? 'left' : 'right');
      
      // Phase 1: Fixation (500ms)
      setTimeout(() => {
        setCurrentPhase(1);
        setShowCue(true);
        
        // Phase 2: Cue (200ms)
        setTimeout(() => {
          setShowCue(false);
          setCurrentPhase(2);
          
          // Phase 3: Delay (300ms)
          setTimeout(() => {
            setCurrentPhase(3);
            setShowTarget(true);
            
            // Phase 4: Target (500ms)
            setTimeout(() => {
              setShowTarget(false);
              setCurrentPhase(0);
            }, 500);
          }, 300);
        }, 200);
      }, 500);
    };
    
    runCycle(); // Initial run
    const interval = setInterval(runCycle, 3000); // Repeat every 3 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-green-50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        {/* Main display area */}
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-[280px] flex items-center justify-center border border-slate-200 shadow-sm relative min-h-[120px]">
          
          {/* Left box */}
          <div 
            className={`absolute left-6 border-2 w-8 h-8 flex items-center justify-center rounded transition-all duration-200 ${
              cueType === 'exogenous' && showCue && targetSide === 'left' 
                ? 'border-yellow-400 bg-yellow-100 shadow-md' 
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            {showTarget && targetSide === 'left' && (
              <div className="w-3 h-3 bg-black rounded-full"></div>
            )}
          </div>

          {/* Central fixation and endogenous cue */}
          <div className="relative">
            {cueType === 'endogenous' && showCue ? (
              <span className="text-2xl text-blue-600 font-bold">
                {targetSide === 'left' ? '←' : '→'}
              </span>
            ) : (
              <span className="text-2xl font-bold text-black">+</span>
            )}
          </div>

          {/* Right box */}
          <div 
            className={`absolute right-6 border-2 w-8 h-8 flex items-center justify-center rounded transition-all duration-200 ${
              cueType === 'exogenous' && showCue && targetSide === 'right' 
                ? 'border-yellow-400 bg-yellow-100 shadow-md' 
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            {showTarget && targetSide === 'right' && (
              <div className="w-3 h-3 bg-black rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MentalRotationThumbnail = ({ className = "" }) => {
  const [currentPair, setCurrentPair] = useState(0);
  
  // Different challenging shape pairs to cycle through
  const shapePairs = [
    {
      left: { shape: 'F', rotation: 45 },
      right: { shape: 'F', rotation: 135 },
      type: 'same'
    },
    {
      left: { shape: 'R', rotation: 30 },
      right: { shape: 'R_MIRROR', rotation: 60 },
      type: 'different'
    },
    {
      left: { shape: 'P', rotation: 180 },
      right: { shape: 'P', rotation: 270 },
      type: 'same'
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPair(prev => (prev + 1) % shapePairs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateShape = (shapeType, rotation) => {
    const shapeMap = {
      'F': 'F',
      'F_MIRROR': 'F',
      'R': 'R', 
      'R_MIRROR': 'R',
      'P': 'P'
    };
    
    const isMirrored = shapeType.includes('_MIRROR');
    const baseShape = shapeMap[shapeType] || 'F';
    
    return (
      <div 
        className="flex items-center justify-center w-8 h-8 transition-transform duration-500"
        style={{ 
          transform: `rotate(${rotation}deg) ${isMirrored ? 'scaleX(-1)' : ''}`,
          fontSize: '24px',
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
          color: '#374151',
          userSelect: 'none'
        }}
      >
        {baseShape}
      </div>
    );
  };

  const currentShapes = shapePairs[currentPair];

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-[280px] flex items-center justify-center border border-slate-200 shadow-sm">
          <div className="flex items-center justify-center gap-8">
            {/* Left shape */}
            <div className="flex flex-col items-center">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                {generateShape(currentShapes.left.shape, currentShapes.left.rotation)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Left</div>
            </div>
            
            {/* Right shape */}
            <div className="flex flex-col items-center">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                {generateShape(currentShapes.right.shape, currentShapes.right.rotation)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Right</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicator for same/different */}
      <div className="absolute bottom-2 right-2">
        <div className={`text-xs px-2 py-1 rounded-full ${
          currentShapes.type === 'same' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {currentShapes.type}
        </div>
      </div>
    </div>
  );
};

export const ChangeDetectionThumbnail = ({ className = "" }) => {
  const [currentPhase, setCurrentPhase] = useState(0); // 0: memory array, 1: blank, 2: probe
  const [currentArray, setCurrentArray] = useState(0);
  
  // Different memory arrays to cycle through
  const memoryArrays = [
    // Set size 4
    [
      { color: '#EF4444', position: 0 }, // red
      { color: '#3B82F6', position: 5 }, // blue
      { color: '#22C55E', position: 10 }, // green
      { color: '#EAB308', position: 15 }, // yellow
    ],
    // Set size 6
    [
      { color: '#A855F7', position: 1 }, // purple
      { color: '#F97316', position: 4 }, // orange
      { color: '#EC4899', position: 7 }, // pink
      { color: '#06B6D4', position: 9 }, // cyan
      { color: '#EF4444', position: 12 }, // red
      { color: '#22C55E', position: 14 }, // green
    ]
  ];
  
  const probes = [
    { color: '#EF4444', position: 0 }, // matches first array
    { color: '#A855F7', position: 1 }, // matches second array
  ];
  
  useEffect(() => {
    const runCycle = () => {
      setCurrentPhase(0); // Memory array
      
      setTimeout(() => {
        setCurrentPhase(1); // Blank retention
        
        setTimeout(() => {
          setCurrentPhase(2); // Test probe
          
          setTimeout(() => {
            // Switch to next array
            setCurrentArray(prev => (prev + 1) % memoryArrays.length);
            setCurrentPhase(0);
          }, 1000);
        }, 800);
      }, 800);
    };
    
    runCycle();
    const interval = setInterval(runCycle, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const currentMemoryArray = memoryArrays[currentArray];
  const currentProbe = probes[currentArray];

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-teal-50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        {/* Main display */}
        <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 w-full max-w-[280px] flex items-center justify-center border border-slate-200 shadow-sm min-h-[120px]">
          
          {currentPhase === 0 ? (
            // Memory array phase
            <div className="grid grid-cols-4 gap-2 w-[80px] h-[80px]">
              {Array.from({ length: 16 }, (_, index) => {
                const square = currentMemoryArray.find(s => s.position === index);
                return (
                  <div key={index} className="flex items-center justify-center">
                    {square ? (
                      <div
                        className="w-3 h-3 rounded border border-slate-300"
                        style={{ backgroundColor: square.color }}
                      />
                    ) : (
                      <div className="w-3 h-3" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : currentPhase === 1 ? (
            // Blank retention phase
            <div className="text-3xl text-slate-400 font-bold">+</div>
          ) : (
            // Test probe phase
            <div className="grid grid-cols-4 gap-2 w-[80px] h-[80px]">
              {Array.from({ length: 16 }, (_, index) => {
                const isProbe = index === currentProbe.position;
                return (
                  <div key={index} className="flex items-center justify-center">
                    {isProbe ? (
                      <div
                        className="w-3 h-3 rounded border-2 border-slate-400"
                        style={{ backgroundColor: currentProbe.color }}
                      />
                    ) : (
                      <div className="w-3 h-3" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Phase indicator */}
      <div className="absolute bottom-2 right-2">
        <div className={`text-xs px-2 py-1 rounded-full ${
          currentPhase === 0 ? 'bg-blue-100 text-blue-700' :
          currentPhase === 1 ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {currentPhase === 0 ? 'memory' : currentPhase === 1 ? 'retention' : 'test'}
        </div>
      </div>
    </div>
  );
};
