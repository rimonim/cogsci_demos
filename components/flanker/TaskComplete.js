import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, BarChart3, RotateCcw, ArrowRight } from "lucide-react";

export default function TaskComplete({ results, studentInfo }) {
  const correctResponses = results.filter(r => r.is_correct).length;
  const accuracy = (correctResponses / results.length) * 100;
  const avgRT = results
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r) => sum + r.reaction_time, 0) / correctResponses;

  const congruentTrials = results.filter(r => r.stimulus_type === "congruent");
  const incongruentTrials = results.filter(r => r.stimulus_type === "incongruent");
  
  const congruentAccuracy = (congruentTrials.filter(r => r.is_correct).length / congruentTrials.length) * 100;
  const incongruentAccuracy = (incongruentTrials.filter(r => r.is_correct).length / incongruentTrials.length) * 100;
  
  const congruentRT = congruentTrials
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r) => sum + r.reaction_time, 0) / congruentTrials.filter(r => r.is_correct).length;
  
  const incongruentRT = incongruentTrials
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r) => sum + r.reaction_time, 0) / incongruentTrials.filter(r => r.is_correct).length;

  const flankerEffect = incongruentRT - congruentRT;

  const downloadCSV = () => {
    const headers = [
      "Student Name", "Student ID", "Trial", "Stimulus Type", "Stimulus Display", 
      "Correct Response", "Participant Response", "Reaction Time (ms)", "Correct", "Session Start"
    ];
    
    const csvContent = [
      headers.join(","),
      ...results.map(r => [
        `"${r.student_name}"`,
        `"${r.student_id}"`,
        r.trial_number,
        r.stimulus_type,
        `"${r.stimulus_display}"`,
        r.correct_response,
        r.participant_response,
        r.reaction_time,
        r.is_correct,
        r.session_start_time
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flanker_results_${studentInfo.name.replace(/\s+/g, "_")}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Experiment Complete!
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Thank you for participating, {studentInfo.name}
          </p>
          <p className="text-lg text-slate-500">
            Your data has been successfully recorded for analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-700">{accuracy.toFixed(1)}%</p>
                  <p className="text-sm text-emerald-600">Accuracy</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{avgRT.toFixed(0)}ms</p>
                  <p className="text-sm text-blue-600">Avg Response Time</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Flanker Effect:</span>
                  <span className="font-semibold text-lg text-purple-600">
                    +{flankerEffect.toFixed(0)}ms
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Difference between incongruent and congruent trials
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Your individual results contribute to class-wide data analysis. 
                View the results dashboard to see how your performance compares 
                with other students and explore the cognitive patterns revealed by the Flanker task.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Class Discussion Points:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• How does attention affect response time?</li>
                  <li>• What causes the flanker effect?</li>
                  <li>• Individual vs. group differences</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-6">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore the Class Results</h2>
            <p className="text-blue-100 mb-6 text-lg">
              See how your performance fits into the broader cognitive psychology patterns 
              and compare results across all participants.
            </p>
            <Link to={createPageUrl("Results")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 py-3">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Results Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={downloadCSV}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white font-semibold px-6"
          >
            <Download className="w-4 h-4 mr-2" />
            Download My Data (CSV)
          </Button>
          
          <Link to={createPageUrl("FlankerTask")}>
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white font-semibold px-6">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Task Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}