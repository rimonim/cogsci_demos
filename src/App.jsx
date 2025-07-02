import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Flanker from './demos/Flanker';
import Results from './pages/Results';
import Instructions from './pages/Instructions';

// Placeholder for Stroop task
const StroopPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Stroop Task</h1>
      <p className="text-slate-600">Coming Soon!</p>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flanker" element={<Flanker />} />
      <Route path="/stroop" element={<StroopPlaceholder />} />
      <Route path="/results" element={<Results />} />
      <Route path="/instructions" element={<Instructions />} />
    </Routes>
  );
}

export default App;
