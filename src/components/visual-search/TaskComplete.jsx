import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Target, Clock, TrendingUp, Users } from 'lucide-react';

export default function TaskComplete({ results, onComplete }) {
  const [downloading, setDownloading] = useState(false);

  const accuracy = results.length > 0 
    ? (results.filter(r => r.is_correct).length / results.length) * 100 
    : 0;
    
  const avgRT = results
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

  // Calculate performance by condition
  const conditionStats = results.reduce((acc, result) => {
    if (!acc[result.condition]) {
      acc[result.condition] = { correct: 0, total: 0, rts: [] };
    }
    acc[result.condition].total++;
    if (result.is_correct) {
      acc[result.condition].correct++;
      if (result.participant_response !== "timeout") {
        acc[result.condition].rts.push(result.reaction_time);
      }
    }
    return acc;
  }, {});

  const downloadResults = () => {
    setDownloading(true);
    
    try {
      const headers = [
        "student_name", "student_id", "trial_number", "condition", "set_size", 
        "target_present", "correct_response", "participant_response", 
        "reaction_time", "is_correct", "session_start_time", "timestamp"
      ];

      const csvContent = [
        headers.join(","),
        ...results.map(r => [
          `"${r.student_name}"`,
          `"${r.student_id}"`,
          r.trial_number,
          r.condition,
          r.set_size,
          r.target_present,
          r.correct_response,
          r.participant_response,
          r.reaction_time,
          r.is_correct,
          r.session_start_time,
          r.timestamp
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visual_search_results_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading results:', error);
    }
    
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <CardTitle className="text-3xl text-slate-900">Task Complete!</CardTitle>
          </div>
          <p className="text-slate-600">
            Excellent work! Here's a summary of your visual search performance.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Performance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
              <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-emerald-800">
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-emerald-600">Overall Accuracy</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-800">
                {avgRT.toFixed(0)}ms
              </div>
              <div className="text-sm text-purple-600">Average RT</div>
            </div>
          </div>

          {/* Condition Breakdown */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance by Search Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(conditionStats).map(([condition, stats]) => {
                const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                const avgRT = stats.rts.length > 0 ? stats.rts.reduce((a, b) => a + b, 0) / stats.rts.length : 0;
                
                return (
                  <div key={condition} className="bg-white rounded p-3 border border-slate-200">
                    <div className="font-medium text-slate-800 capitalize mb-1">
                      {condition.replace('_', ' ')}
                    </div>
                    <div className="text-slate-600">
                      {accuracy.toFixed(1)}% correct, {avgRT.toFixed(0)}ms avg
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              What's Next?
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Your data will help analyze visual attention mechanisms. You can download your individual 
              results for personal analysis, and if you opted to share, your data contributes to class 
              research on search slopes and attention theory.
            </p>
            <div className="text-xs text-blue-700">
              <strong>Research Focus:</strong> Compare reaction time slopes between pop-out vs. conjunction search conditions.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={downloadResults}
              disabled={downloading}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download My Results'}
            </Button>
            
            <Button 
              onClick={onComplete}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
