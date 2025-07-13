import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Eye, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChangeDetectionInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <Brain className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">Change Detection Task</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Test your visual working memory capacity by detecting changes in colored square arrays
          </p>
        </div>

        {/* Main Instructions */}
        <div className="grid gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                How the Task Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-lg leading-relaxed">
                You'll see a brief display of colored squares, followed by a blank screen, then a single test square. 
                Your job is to decide whether the test square is the <strong>same color</strong> as the square that was 
                previously in that location, or a <strong>different color</strong>.
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  <strong>Tip:</strong> The colored squares appear very briefly, so focus your attention and try to 
                  remember both the colors and where they appeared.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Response Instructions */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                Your Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">S</div>
                  <h3 className="font-semibold text-slate-800 mb-2">Same Color</h3>
                  <p className="text-sm text-slate-600">
                    Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono border">S</kbd> if the test square is the <strong>same color</strong> as what was in that location in the memory array.
                  </p>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="text-4xl font-bold text-red-600 mb-2">D</div>
                  <h3 className="font-semibold text-slate-800 mb-2">Different Color</h3>
                  <p className="text-sm text-slate-600">
                    Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono border">D</kbd> if the test square is a <strong>different color</strong> from what was in that location.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Important Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-slate-600">You'll see arrays with either 4 or 8 colored squares</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-slate-600">This task is designed to be challenging - it tests the limits of visual working memory</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-slate-600">Focus on both color and location - you need to remember what was where</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Working Memory Explanation */}
        <Card className="border-slate-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600" />
              Cowan's K Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Your performance will be scored using <strong>Cowan's K</strong>, which estimates how many items you can remember at once. Most people score between 3-4 items. Higher scores indicate better memory performance.
            </p>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/change-detection/task')}
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
          >
            Start Change Detection Task
          </Button>
          <p className="text-sm text-slate-500 mt-2">
            You'll begin with practice trials to get familiar with the task
          </p>
        </div>
      </div>
    </div>
  );
}
