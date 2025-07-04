import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain } from 'lucide-react';

export default function NBackInstructions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const startPractice = () => {
    // Preserve any session parameters when navigating
    const destination = '/nback/task' + (sessionId ? `?session=${sessionId}` : '');
    navigate(destination);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="bg-white border-slate-200">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">N-Back Task Instructions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Your Task</h3>
              <p className="text-slate-600">
                Watch the sequence of letters and press <strong>SPACE</strong> when the current letter matches the one from <strong>2 trials back</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <p className="text-center text-sm text-slate-600 mb-4">Example sequence:</p>
              
              <div className="flex items-center justify-center gap-1 text-center text-xs">
                <div>
                  <div className="bg-black w-12 h-12 mx-auto mb-1 rounded flex items-center justify-center">
                    <span className="text-white text-lg font-bold font-mono">H</span>
                  </div>
                  <p className="h-8">Trial 1</p>
                </div>
                <div className="text-slate-400 text-lg">→</div>
                <div>
                  <div className="bg-black w-12 h-12 mx-auto mb-1 rounded flex items-center justify-center">
                    <span className="text-white text-lg font-bold font-mono">K</span>
                  </div>
                  <p className="h-8">Trial 2</p>
                </div>
                <div className="text-slate-400 text-lg">→</div>
                <div>
                  <div className="bg-black border-2 border-green-400 w-12 h-12 mx-auto mb-1 rounded flex items-center justify-center">
                    <span className="text-green-400 text-lg font-bold font-mono">H</span>
                  </div>
                  <p className="h-8">Trial 3<br/><span className="text-green-600 font-semibold text-xs">MATCH!</span></p>
                </div>
                <div className="text-slate-400 text-lg">→</div>
                <div>
                  <div className="bg-black w-12 h-12 mx-auto mb-1 rounded flex items-center justify-center">
                    <span className="text-white text-lg font-bold font-mono">L</span>
                  </div>
                  <p className="h-8">Trial 4</p>
                </div>
                <div className="text-slate-400 text-lg">→</div>
                <div>
                  <div className="bg-black border-2 border-green-400 w-12 h-12 mx-auto mb-1 rounded flex items-center justify-center">
                    <span className="text-green-400 text-lg font-bold font-mono">H</span>
                  </div>
                  <p className="h-8">Trial 5<br/><span className="text-green-600 font-semibold text-xs">MATCH!</span></p>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <span className="text-sm">Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">SPACE</kbd> when letter matches 2-back</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Compare each letter to the one from <strong>2 trials back</strong></li>
                <li>• Only press SPACE when you detect a match</li>
                <li>• This task is challenging - focus on accuracy first</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                size="lg"
                onClick={startPractice}
              >
                Start Practice Trials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
