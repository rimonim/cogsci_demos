import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Eye } from 'lucide-react';

export default function TaskSetup({ onComplete }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [shareData, setShareData] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && id.trim()) {
      onComplete({ name: name.trim(), id: id.trim(), shareData });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Search className="w-8 h-8 text-purple-600" />
            <CardTitle className="text-2xl text-slate-900">Visual Search Task</CardTitle>
          </div>
          <p className="text-slate-600">
            Search for targets among distractors
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="id">Student ID</Label>
                <Input
                  id="id"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter your student ID"
                  required
                />
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  id="shareData"
                  type="checkbox"
                  checked={shareData}
                  onChange={(e) => setShareData(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <Label htmlFor="shareData" className="font-medium text-blue-900 cursor-pointer">
                    Share my data with the class
                  </Label>
                  <p className="text-sm text-blue-700 mt-1">
                    Your data will be included in class results for analysis. You can always download your individual results regardless of this setting.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Task Instructions
              </h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• Look for target shapes among distractor shapes</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">J</kbd> if you see the target</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">K</kbd> if no target is present</li>
                <li>• Respond as quickly and accurately as possible</li>
                <li>• You'll start with practice trials, then the main task</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!name.trim() || !id.trim()}
            >
              Start Practice Trials
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
