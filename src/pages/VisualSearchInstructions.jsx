import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import TaskSwitchDialog from '@/components/TaskSwitchDialog';
import { detectExistingTaskData, clearAllTaskData } from '@/utils';

export default function VisualSearchInstructions() {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [checkingData, setCheckingData] = useState(false);

  const checkForExistingData = async () => {
    setCheckingData(true);
    try {
      const data = await detectExistingTaskData();
      if (data.hasData && !data.tasks.includes('visual_search')) {
        setExistingData(data);
        setShowDialog(true);
      } else {
        navigate('/visual-search/task');
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
      navigate('/visual-search/task');
    } finally {
      setCheckingData(false);
    }
  };

  const handleClearAndContinue = async () => {
    try {
      await clearAllTaskData();
      setShowDialog(false);
      navigate('/visual-search/task');
    } catch (error) {
      console.error('Error clearing data:', error);
      navigate('/visual-search/task');
    }
  };

  const handleContinueWithExisting = () => {
    setShowDialog(false);
    navigate('/visual-search/task');
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-xl bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Search className="w-8 h-8 text-purple-600" />
              <CardTitle className="text-2xl text-slate-900">Visual Search Task</CardTitle>
            </div>
            <p className="text-slate-600 text-base mt-2">
              Find the <span className='font-semibold text-blue-700'>blue vertical bar</span> (target) among distractors as quickly and accurately as possible.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-1 h-8 bg-blue-600 rounded"></div>
              <span className="text-slate-700 text-sm">= Target</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-slate-700 text-base space-y-2 mb-6">
              <li>• Press <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">J</kbd> if the target is present</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">K</kbd> if absent</li>
              <li>• Practice comes first, then the main task</li>
            </ul>
            <div className="text-center">
              <Button
                onClick={checkForExistingData}
                disabled={checkingData}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
              >
                {checkingData ? 'Checking...' : <>Start Visual Search Task</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {showDialog && (
        <TaskSwitchDialog
          isOpen={showDialog}
          onClearAndContinue={handleClearAndContinue}
          onContinueWithExisting={handleContinueWithExisting}
          onCancel={handleCancel}
          existingTasks={existingData?.tasks || []}
          currentTask="visual_search"
          dataCount={existingData?.count || 0}
          newTaskName="Visual Search"
        />
      )}
    </>
  );
}
