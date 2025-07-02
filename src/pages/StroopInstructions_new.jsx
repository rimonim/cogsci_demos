import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import TaskSwitchDialog from '@/components/TaskSwitchDialog';
import { detectExistingTaskData, clearAllTaskData } from '@/utils';

export default function StroopInstructions() {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [checkingData, setCheckingData] = useState(false);

  const checkForExistingData = async () => {
    setCheckingData(true);
    try {
      const data = await detectExistingTaskData();
      if (data.hasData) {
        setExistingData(data);
        setShowDialog(true);
      } else {
        navigate('/stroop/task');
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
      navigate('/stroop/task');
    } finally {
      setCheckingData(false);
    }
  };

  const handleClearAndContinue = async () => {
    try {
      await clearAllTaskData();
      setShowDialog(false);
      navigate('/stroop/task');
    } catch (error) {
      console.error('Error clearing data:', error);
      navigate('/stroop/task');
    }
  };

  const handleContinueWithExisting = () => {
    setShowDialog(false);
    navigate('/stroop/task');
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

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
                Identify the <strong>color</strong> of each word, ignoring what the word actually says.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{ color: '#ef4444' }}>BLUE</div>
                <div className="text-sm">
                  <span>Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">R</kbd> for Red (the color, not the word)</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{ color: '#22c55e' }}>GREEN</div>
                <div className="text-sm">
                  <span>Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">G</kbd> for Green (word and color match)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Key Mappings:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">B</kbd>
                  <span>Blue</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Y</kbd>
                  <span>Yellow</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">R</kbd>
                  <span>Red</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">G</kbd>
                  <span>Green</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Important:</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Respond to the <strong>color</strong>, not the word</li>
                <li>• Some words and colors will match, others won't</li>
                <li>• Be as fast and accurate as possible</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                size="lg"
                onClick={checkForExistingData}
                disabled={checkingData}
              >
                {checkingData ? 'Checking...' : 'Start Practice Trials'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showDialog && (
          <TaskSwitchDialog
            currentTask="stroop"
            existingTasks={existingData.tasks}
            dataCount={existingData.count}
            onClearAndContinue={handleClearAndContinue}
            onContinueWithExisting={handleContinueWithExisting}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
