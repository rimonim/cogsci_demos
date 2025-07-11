import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const FlankerDemo = lazy(() => import('./demos/Flanker'));
const FlankerInstructions = lazy(() => import('./pages/FlankerInstructions'));
const StroopDemo = lazy(() => import('./demos/Stroop'));
const StroopInstructions = lazy(() => import('./pages/StroopInstructions'));
const VisualSearchDemo = lazy(() => import('./demos/VisualSearch'));
const VisualSearchInstructions = lazy(() => import('./pages/VisualSearchInstructions'));
const NBackDemo = lazy(() => import('./demos/NBack'));
const NBackInstructions = lazy(() => import('./pages/NBackInstructions'));
const PosnerDemo = lazy(() => import('./demos/Posner'));
const PosnerInstructions = lazy(() => import('./pages/PosnerInstructions'));
const MentalRotationDemo = lazy(() => import('./demos/MentalRotation'));
const MentalRotationInstructions = lazy(() => import('./pages/MentalRotationInstructions'));
const Results = lazy(() => import('./pages/Results'));
const Instructions = lazy(() => import('./pages/Instructions'));
const SessionJoin = lazy(() => import('./pages/SessionJoin'));
const SessionManager = lazy(() => import('./components/SessionManager'));
const InstructorLogin = lazy(() => import('./pages/InstructorLogin'));

// Loading component for better UX during chunk loading
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-slate-600 mt-4 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<InstructorLogin />} />
        <Route path="/session/:sessionId" element={<SessionJoin />} />
        <Route path="/sessions" element={<SessionManager />} />
        <Route path="/flanker" element={<FlankerInstructions />} />
        <Route path="/flanker/task" element={<FlankerDemo />} />
        <Route path="/stroop" element={<StroopInstructions />} />
        <Route path="/stroop/task" element={<StroopDemo />} />
        <Route path="/visual-search" element={<VisualSearchInstructions />} />
        <Route path="/visual-search/task" element={<VisualSearchDemo />} />
        <Route path="/nback" element={<NBackInstructions />} />
        <Route path="/nback/task" element={<NBackDemo />} />
        <Route path="/posner" element={<PosnerInstructions />} />
        <Route path="/demos/posner" element={<PosnerDemo />} />
        <Route path="/mental-rotation" element={<MentalRotationInstructions />} />
        <Route path="/mental-rotation/task" element={<MentalRotationDemo />} />
        <Route path="/results" element={<Results />} />
        <Route path="/instructions" element={<Instructions />} />
      </Routes>
    </Suspense>
  );
}

export default App;
