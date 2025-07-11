import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCw } from 'lucide-react';

export default function MentalRotationInstructions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const startPractice = () => {
    // Preserve any session parameters when navigating
    const destination = '/mental-rotation/task' + (sessionId ? `?session=${sessionId}` : '');
    navigate(destination);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="bg-white border-slate-200">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCw className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">Mental Rotation Task Instructions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Your Task</h3>
              <p className="text-slate-600">
                Decide whether two shapes are the <strong>same</strong> or <strong>different</strong>, ignoring rotation. Some shapes may be <strong>mirror images</strong> of each other.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-6">
              <div className="text-center">
                <h4 className="font-semibold mb-3">Example: Same Shape</h4>
                <div className="flex items-center justify-center gap-8 mb-2">
                  <div className="bg-white rounded p-3 border flex items-center justify-center w-16 h-16">
                    <div style={{ 
                      fontSize: '32px', 
                      fontFamily: 'Georgia, serif', 
                      fontWeight: 'bold', 
                      color: '#374151',
                      transform: 'rotate(0deg)'
                    }}>
                      F
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 border flex items-center justify-center w-16 h-16">
                    <div style={{ 
                      fontSize: '32px', 
                      fontFamily: 'Georgia, serif', 
                      fontWeight: 'bold', 
                      color: '#374151',
                      transform: 'rotate(135deg)'
                    }}>
                      F
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <span>Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">S</kbd> - These are the same shape, just rotated</span>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="font-semibold mb-3">Example: Different Shape (Mirror Image)</h4>
                <div className="flex items-center justify-center gap-8 mb-2">
                  <div className="bg-white rounded p-3 border flex items-center justify-center w-16 h-16">
                    <div style={{ 
                      fontSize: '32px', 
                      fontFamily: 'Georgia, serif', 
                      fontWeight: 'bold', 
                      color: '#374151',
                      transform: 'rotate(0deg)'
                    }}>
                      R
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 border flex items-center justify-center w-16 h-16">
                    <div style={{ 
                      fontSize: '32px', 
                      fontFamily: 'Georgia, serif', 
                      fontWeight: 'bold', 
                      color: '#374151',
                      transform: 'rotate(45deg) scaleX(-1)'
                    }}>
                      R
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <span>Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">D</kbd> - These are mirror images (different shapes)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Key Mappings:</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-3 py-2 bg-white rounded text-sm font-mono">S</kbd>
                  <span>Same shape (ignoring rotation)</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-3 py-2 bg-white rounded text-sm font-mono">D</kbd>
                  <span>Different shape</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Important:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Focus on the <strong>shape</strong>, not the orientation</li>
                <li>• Watch out for <strong>mirror images</strong> - they look very similar but are different shapes</li>
                <li>• Imagine rotating one shape to see if it matches the other</li>
                <li>• Shapes can be rotated to any angle, not just 90° increments</li>
                <li>• Be as accurate and fast as possible</li>
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
