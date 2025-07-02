import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, AlertTriangle } from 'lucide-react';

export default function StroopInstructions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="bg-white border-slate-200">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Stroop Task Instructions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Your Task</h3>
              <p className="text-slate-600">
                Press the key that corresponds to the <strong>color</strong> of the text, not what the word says.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-3" style={{ color: '#ef4444' }}>BLUE</div>
                <div className="flex items-center justify-center gap-2 text-sm mb-4">
                  <span>Word says "BLUE" but text is RED</span>
                  <span>→</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">R</kbd>
                  <span className="text-red-600 font-medium">Press R for Red</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-3" style={{ color: '#22c55e' }}>GREEN</div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span>Word says "GREEN" and text is GREEN</span>
                  <span>→</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">G</kbd>
                  <span className="text-green-600 font-medium">Press G for Green</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Key Mapping:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">B</kbd>
                  <span className="text-blue-600 font-medium">Blue</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">R</kbd>
                  <span className="text-red-600 font-medium">Red</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">G</kbd>
                  <span className="text-green-600 font-medium">Green</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Y</kbd>
                  <span className="text-yellow-600 font-medium">Yellow</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Important:
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Ignore what the word says - only respond to the color</li>
                <li>• Respond as quickly and accurately as possible</li>
                <li>• Some trials will be tricky when word and color don't match!</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Link to="/stroop/task">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                  Start Practice Trials
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
