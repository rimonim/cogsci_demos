import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight } from 'lucide-react';

export default function PracticeComplete({ onStartExperiment }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-2xl">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Practice Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600 text-lg leading-relaxed">
              You're ready to begin the main experiment. The following trials will be recorded.
            </p>
            <p className="text-slate-600">
              Remember to respond as <strong>quickly and accurately</strong> as possible.
            </p>
            <Button
              onClick={onStartExperiment}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg text-lg"
            >
              Start Experiment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}