import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Play, Clock, Target } from "lucide-react";

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Flanker Task Instructions
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The Flanker task measures selective attention and cognitive control. 
            You'll respond to arrow directions while ignoring distracting flankers.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Target className="w-6 h-6 text-blue-600" />
                Your Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Focus on the <strong>center arrow</strong> and respond to its direction:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <kbd className="px-3 py-1 bg-white rounded border font-mono">←</kbd>
                  <span>Press <strong>Left Arrow</strong> if center points left</span>
                </div>
                <div className="flex items-center gap-4">
                  <kbd className="px-3 py-1 bg-white rounded border font-mono">→</kbd>
                  <span>Press <strong>Right Arrow</strong> if center points right</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock className="w-6 h-6 text-emerald-600" />
                Response Speed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Respond as <strong>quickly and accurately</strong> as possible:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Response window:</span>
                  <span className="font-semibold">2 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Total trials:</span>
                  <span className="font-semibold">40 trials</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated time:</span>
                  <span className="font-semibold">3-4 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-center">Stimulus Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-emerald-50 rounded-lg">
                <h3 className="font-semibold text-emerald-800 mb-3">Congruent Trials</h3>
                <p className="text-sm text-slate-600 mb-4">All arrows point the same direction</p>
                <div className="space-y-3">
                  <div className="text-3xl font-mono">&lt;&lt;&lt;&lt;&lt;</div>
                  <div className="text-sm text-slate-500">Response: Left Arrow</div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="text-3xl font-mono">&gt;&gt;&gt;&gt;&gt;</div>
                  <div className="text-sm text-slate-500">Response: Right Arrow</div>
                </div>
              </div>

              <div className="text-center p-6 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-3">Incongruent Trials</h3>
                <p className="text-sm text-slate-600 mb-4">Center arrow conflicts with flankers</p>
                <div className="space-y-3">
                  <div className="text-3xl font-mono">&gt;&gt;&lt;&gt;&gt;</div>
                  <div className="text-sm text-slate-500">Response: Left Arrow</div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="text-3xl font-mono">&lt;&lt;&gt;&lt;&lt;</div>
                  <div className="text-sm text-slate-500">Response: Right Arrow</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to={createPageUrl("FlankerTask")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg">
              <Play className="w-5 h-5 mr-2" />
              Start Flanker Task
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}