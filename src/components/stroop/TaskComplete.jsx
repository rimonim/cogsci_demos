import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, RotateCcw, ArrowRight, TrendingUp } from "lucide-react";

export default function TaskComplete({ results, studentInfo }) {
  const correctResponses = results.filter(r => r.is_correct).length;
  const accuracy = (correctResponses / results.length) * 100;
  const avgRT = results
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r) => sum + r.reaction_time, 0) / correctResponses;

  const congruentTrials = results.filter(r => r.stimulus_type === "congruent" && r.is_correct);
  const incongruentTrials = results.filter(r => r.stimulus_type === "incongruent" && r.is_correct);
  
  const congruentAccuracy = (results.filter(r => r.stimulus_type === "congruent" && r.is_correct).length / 
                           results.filter(r => r.stimulus_type === "congruent").length) * 100;
  const incongruentAccuracy = (results.filter(r => r.stimulus_type === "incongruent" && r.is_correct).length / 
                              results.filter(r => r.stimulus_type === "incongruent").length) * 100;
  
  const congruentRT = congruentTrials.length > 0 ? 
    congruentTrials.reduce((sum, r) => sum + r.reaction_time, 0) / congruentTrials.length : 0;
  
  const incongruentRT = incongruentTrials.length > 0 ? 
    incongruentTrials.reduce((sum, r) => sum + r.reaction_time, 0) / incongruentTrials.length : 0;

  const stroopEffect = incongruentRT - congruentRT;

  const downloadCSV = () => {
    const headers = [
      "student_name", "student_id", "trial_number", "stimulus_type", "stimulus_word", 
      "stimulus_color", "correct_response", "participant_response", "reaction_time_ms", 
      "is_correct", "session_start_time", "timestamp"
    ];
    
    const csvContent = [
      headers.join(","),
      ...results.map(r => [
        `"${r.student_name}"`,
        `"${r.student_id}"`,
        r.trial_number,
        r.stimulus_type,
        r.stimulus_word,
        r.stimulus_color,
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
    a.download = `stroop_${studentInfo.name.replace(/\s+/g, "_")}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="bg-white border-slate-200 mb-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Task Complete!</CardTitle>
            <p className="text-slate-600">Excellent work, {studentInfo.name}!</p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Overall Performance */}
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-slate-900 mb-2">{accuracy.toFixed(1)}%</div>
                <div className="text-slate-600">Overall Accuracy</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-slate-900 mb-2">{avgRT ? avgRT.toFixed(0) : '0'}ms</div>
                <div className="text-slate-600">Average Response Time</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="text-3xl font-bold text-purple-900 mb-2">+{stroopEffect.toFixed(0)}ms</div>
                <div className="text-purple-700 font-medium">Stroop Effect</div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Performance Analysis
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-800">Congruent Trials</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div>Accuracy: <span className="font-medium">{congruentAccuracy.toFixed(1)}%</span></div>
                    <div>Avg RT: <span className="font-medium">{congruentRT.toFixed(0)}ms</span></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-800">Incongruent Trials</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div>Accuracy: <span className="font-medium">{incongruentAccuracy.toFixed(1)}%</span></div>
                    <div>Avg RT: <span className="font-medium">{incongruentRT.toFixed(0)}ms</span></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border border-purple-200">
                <p className="text-sm text-slate-700">
                  <strong>The Stroop Effect:</strong> Your responses were {stroopEffect.toFixed(0)}ms slower 
                  when the word meaning conflicted with the text color, demonstrating automatic word processing 
                  that interferes with color naming.
                </p>
              </div>
            </div>

            {/* Instructions Link */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold text-blue-900 mb-2">Want to see class results?</h4>
                <p className="text-blue-800 text-sm mb-4">
                  View the instructor dashboard to see how your performance compares with your classmates.
                </p>
                <Link to="/results">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Class Results
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-700 font-semibold px-6">
              <ArrowRight className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
          
          <Button
            onClick={downloadCSV}
            variant="outline"
            className="bg-white border-slate-200 hover:bg-slate-50 font-semibold px-6"
          >
            <Download className="w-4 h-4 mr-2" />
            Download My Data
          </Button>
          
          <Link to="/stroop">
            <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 font-semibold px-6">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Task Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
