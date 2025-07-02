import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target, Clock } from 'lucide-react';

export default function PracticeComplete({ results, onContinue }) {
  const accuracy = results.length > 0 
    ? (results.filter(r => r.is_correct).length / results.length) * 100 
    : 0;
    
  const avgRT = results
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
            <CardTitle className="text-2xl text-slate-900">Practice Complete!</CardTitle>
          </div>
          <p className="text-slate-600">
            Great job! Here's how you performed in the practice trials.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
              <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-800">
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-emerald-600">Accuracy</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">
                {avgRT.toFixed(0)}ms
              </div>
              <div className="text-sm text-purple-600">Avg Response Time</div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Ready for the main task?</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• The main task will have {accuracy >= 80 ? "the same types of" : "similar"} search arrays</li>
              <li>• Try to maintain both speed and accuracy</li>
              <li>• Some searches will be easier (pop-out) than others (conjunction)</li>
              <li>• Take your time if needed - there's no rush</li>
            </ul>
          </div>

          {accuracy < 70 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Your accuracy was a bit low. Remember to look carefully for the target before responding. 
                Don't worry - the main task will give you more practice!
              </p>
            </div>
          )}

          <Button 
            onClick={onContinue}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Continue to Main Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
