import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Target } from "lucide-react";

export default function PracticeComplete({ results, onContinue }) {
  const correctResponses = results.filter(r => r.is_correct).length;
  const accuracy = (correctResponses / results.length) * 100;
  const avgRT = results
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r) => sum + r.reaction_time, 0) / correctResponses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white border-slate-200">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Practice Complete!</CardTitle>
          <p className="text-slate-600">Great job! Here's how you performed:</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900">{accuracy.toFixed(1)}%</div>
              <div className="text-sm text-slate-600">Accuracy</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900">{avgRT ? avgRT.toFixed(0) : '0'}ms</div>
              <div className="text-sm text-slate-600">Avg Response Time</div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">🎯 Remember:</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Press the key for the <strong>color</strong> of the text</li>
              <li>• Ignore what the word says</li>
              <li>• <kbd className="px-1 py-0.5 bg-white rounded text-xs">B</kbd>=Blue, <kbd className="px-1 py-0.5 bg-white rounded text-xs">R</kbd>=Red, <kbd className="px-1 py-0.5 bg-white rounded text-xs">G</kbd>=Green, <kbd className="px-1 py-0.5 bg-white rounded text-xs">Y</kbd>=Yellow</li>
              <li>• Respond as quickly and accurately as possible</li>
            </ul>
          </div>
          
          <Button onClick={onContinue} className="w-full" size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Begin Main Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
