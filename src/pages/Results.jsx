import React, { useState, useEffect } from "react";
import { FlankerResult } from "@/entities/FlankerResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, TrendingUp, Clock } from "lucide-react";

import ResultsSummary from "@/components/results/ResultsSummary";
import ParticipantTable from "@/components/results/ParticipantTable";
import ResultsChart from "@/components/results/ResultsChart";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await FlankerResult.list("-created_date");
      setResults(data);
    } catch (error) {
      console.error("Error loading results:", error);
    }
    setLoading(false);
  };

  const downloadAllResults = () => {
    if (results.length === 0) return;

    const headers = [
      "student_name", "student_id", "trial_number", "stimulus_type", "stimulus_display",
      "correct_response", "participant_response", "reaction_time_ms", "is_correct", 
      "session_start_time", "date_completed"
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
        r.session_start_time,
        r.created_date
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flanker_all_results_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group results by participant
  const participantData = results.reduce((acc, result) => {
    const key = `${result.student_name}_${result.student_id}`;
    if (!acc[key]) {
      acc[key] = {
        name: result.student_name,
        id: result.student_id,
        sessionStart: result.session_start_time,
        trials: []
      };
    }
    acc[key].trials.push(result);
    return acc;
  }, {});

  const participants = Object.values(participantData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Results Dashboard</h1>
            <p className="text-slate-600 mt-1">Flanker task performance analysis</p>
          </div>
          <Button
            onClick={downloadAllResults}
            disabled={results.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="bg-white border-slate-200 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Yet</h3>
              <p className="text-slate-600 mb-6">
                Students haven't started taking experiments yet. Once they begin, results will appear here in real-time.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">📝 For Instructors:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Have students visit the homepage and start an experiment</li>
                  <li>• Results will automatically aggregate here</li>
                  <li>• Download CSV data for R analysis when ready</li>
                  <li>• Use "Reset Data" before each new class session</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <ResultsSummary results={results} participants={participants} />
            <ResultsChart participants={participants} />
            <ParticipantTable participants={participants} />
          </div>
        )}
      </div>
    </div>
  );
}