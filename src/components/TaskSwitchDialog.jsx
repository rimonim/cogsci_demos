import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2, ArrowRight } from "lucide-react";
import { getTaskDisplayName } from "@/utils";

export default function TaskSwitchDialog({ 
  currentTask, 
  existingTasks = [], // Default to empty array
  dataCount,
  onClearAndContinue, 
  onCancel, 
  onContinueWithExisting 
}) {
  const isSameTask = existingTasks.includes(currentTask);
  const isMultipleExistingTasks = existingTasks.length > 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-xl">
            {isSameTask ? 'Continue Existing Session?' : 'Switch Tasks?'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700 mb-2">
              <strong>Existing data found:</strong>
            </p>
            <ul className="text-sm text-slate-600 space-y-1">
              {existingTasks.map(task => (
                <li key={task} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  {getTaskDisplayName(task)}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-2">
              Total records: {dataCount}
            </p>
          </div>

          {isSameTask ? (
            <p className="text-sm text-slate-600">
              You're starting the same task type that already has data. You can:
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              You're switching to <strong>{getTaskDisplayName(currentTask)}</strong>, but there's existing data from other tasks. You can:
            </p>
          )}

          <div className="space-y-3">
            <Button 
              onClick={onContinueWithExisting}
              className="w-full"
              variant="outline"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {isSameTask ? 'Add to Existing Data' : 'Keep Both Task Types'}
            </Button>
            
            <Button 
              onClick={onClearAndContinue}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data & Start Fresh
            </Button>
            
            <Button 
              onClick={onCancel}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>💡 Instructor tip:</strong> Clear data between different class sessions 
              to avoid mixing student results from different days.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
