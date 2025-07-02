import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import TaskSwitchDialog from '@/components/TaskSwitchDialog';
import { detectExistingTaskData, clearAllTaskData } from '@/utils';

export default function FlankerInstructions() {
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
        // No existing data, proceed directly
        navigate('/flanker/task');
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
      // On error, proceed anyway
      navigate('/flanker/task');
    } finally {
      setCheckingData(false);
    }
  };

  const handleClearAndContinue = async () => {
    try {
      await clearAllTaskData();
      setShowDialog(false);
      navigate('/flanker/task');
    } catch (error) {
      console.error('Error clearing data:', error);
      // Proceed anyway
      navigate('/flanker/task');
    }
  };

  const handleContinueWithExisting = () => {
    setShowDialog(false);
    navigate('/flanker/task');
  };

  const handleCancel = () => {
    setShowDialog(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="bg-white border-slate-200">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Flanker Task Instructions</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Your Task</h3>
              <p className="text-slate-600">
                Respond to the direction of the <strong>center arrow</strong> while ignoring the surrounding arrows.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="text-2xl font-mono mb-2">&lt;&lt;&lt;&lt;&lt;</div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">←</kbd> (center arrow points left)</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-mono mb-2">&gt;&gt;&gt;&gt;&gt;</div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <ArrowRight className="w-4 h-4" />
                  <span>Press <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">→</kbd> (center arrow points right)</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Focus only on the <strong>center arrow</strong></li>
                <li>• Ignore the surrounding arrows (they may point different directions)</li>
                <li>• Respond as quickly and accurately as possible</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button 
                className="w-full" 
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
            currentTask="flanker"
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
