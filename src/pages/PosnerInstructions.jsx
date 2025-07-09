import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PosnerInstructions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const startPractice = () => {
    const destination = '/demos/posner' + (sessionId ? `?session=${sessionId}` : '');
    navigate(destination);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="bg-white border-slate-200">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Posner Cueing Task Instructions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Your Task</h3>
              <p className="text-slate-600">
                Keep your eyes on the <strong>center cross</strong> and press <strong>SPACEBAR</strong> when you see the target <strong>dot</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <h4 className="font-semibold mb-3">Display Layout</h4>
                <div className="relative flex items-center justify-center h-16 mb-4">
                  <div className="absolute left-8 w-10 h-10 border-2 border-gray-300 rounded bg-white"></div>
                  <div className="text-2xl font-bold">+</div>
                  <div className="absolute right-8 w-10 h-10 border-2 border-gray-300 rounded bg-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Target <strong>dot</strong> will appear in the left or right box
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <ArrowRight className="w-4 h-4" />
                  Arrow Cues
                </h4>
                <p className="text-sm text-blue-700">
                  Central arrows (← →) help predict target location. Use them to guide your attention.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  Flash Cues
                </h4>
                <p className="text-sm text-yellow-700">
                  Boxes may briefly flash. These are not predictive - try to ignore them.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Remember:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Keep your eyes on the center cross at all times</li>
                <li>• Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">SPACEBAR</kbd> when you see the target dot</li>
                <li>• Respond as quickly and accurately as possible</li>
                <li>• Some trials may have no target - just wait for the next trial</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
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
