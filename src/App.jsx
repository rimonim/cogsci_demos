import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Flanker from './demos/Flanker';
import FlankerInstructions from './pages/FlankerInstructions';
import Stroop from './demos/Stroop';
import StroopInstructions from './pages/StroopInstructions';
import Results from './pages/Results';
import Instructions from './pages/Instructions';

// Placeholder is no longer needed
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flanker" element={<FlankerInstructions />} />
      <Route path="/flanker/task" element={<Flanker />} />
      <Route path="/stroop" element={<StroopInstructions />} />
      <Route path="/stroop/task" element={<Stroop />} />
      <Route path="/results" element={<Results />} />
      <Route path="/instructions" element={<Instructions />} />
    </Routes>
  );
}

export default App;
