// Example of how to implement route-based code splitting in your App.jsx

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load your page components
const Home = lazy(() => import('./pages/Home'));
const FlankerInstructions = lazy(() => import('./pages/FlankerInstructions'));
const StroopInstructions = lazy(() => import('./pages/StroopInstructions'));
const Results = lazy(() => import('./pages/Results'));
const FlankerDemo = lazy(() => import('./demos/Flanker'));
const StroopDemo = lazy(() => import('./demos/Stroop'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flanker/instructions" element={<FlankerInstructions />} />
          <Route path="/flanker/task" element={<FlankerDemo />} />
          <Route path="/stroop/instructions" element={<StroopInstructions />} />
          <Route path="/stroop/task" element={<StroopDemo />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
