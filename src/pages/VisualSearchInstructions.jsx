import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function VisualSearchInstructions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const startPractice = () => {
    // Preserve any session parameters when navigating
    const destination = '/visual-search/task' + (sessionId ? `?session=${sessionId}` : '');
    navigate(destination);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-xl bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Search className="w-8 h-8 text-purple-600" />
              <CardTitle className="text-2xl text-slate-900">Visual Search Task</CardTitle>
            </div>
            <p className="text-slate-600 text-base mt-2">
              Find the <span className='font-semibold text-blue-700'>blue vertical bar</span> (target) among distractors as quickly and accurately as possible.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-1 h-8 bg-blue-600 rounded"></div>
              <span className="text-slate-700 text-sm">= Target</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-slate-700 text-base space-y-2 mb-6">
              <li>• Press <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">J</kbd> if the target is present</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">K</kbd> if absent</li>
              <li>• Practice comes first, then the main task</li>
            </ul>
            <div className="text-center">
              <Button
                onClick={startPractice}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
              >
                Start Visual Search Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
