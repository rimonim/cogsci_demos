import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, BarChart3, RotateCcw, ArrowRight, Home } from "lucide-react";

/**
 * Unified TaskComplete component for all cognitive science tasks
 * 
 * @param {Object} props
 * @param {Array} props.results - Main experiment results
 * @param {Object} props.studentInfo - Student information
 * @param {Object} props.config - Task configuration
 * @param {string} props.config.taskName - Display name for the task
 * @param {string} props.config.theme - Color theme ('blue', 'purple', 'green', etc.)
 * @param {string} props.config.title - Title text (default: "Task Complete!")
 * @param {string} props.config.description - Description text
 * @param {Function} props.config.calculateCustomStats - Function to calculate task-specific statistics
 * @param {Array} props.config.downloadFields - Fields to include in CSV download
 * @param {string} props.config.gradientFrom - Gradient start color class
 * @param {string} props.config.gradientTo - Gradient end color class
 * @param {boolean} props.config.showDetailedStats - Whether to show detailed performance breakdown
 */
export default function TaskComplete({ results, studentInfo, config }) {
  // Default configuration
  const defaultConfig = {
    taskName: "Cognitive Task",
    theme: "blue",
    title: "Task Complete!",
    description: "Thank you for participating! Here are your results:",
    calculateCustomStats: null,
    downloadFields: [
      "Student Name", "Student ID", "Trial", "Stimulus Type", 
      "Correct Response", "Participant Response", "Reaction Time (ms)", 
      "Correct", "Session Start"
    ],
    gradientFrom: "from-slate-50",
    gradientTo: "to-blue-50",
    showDetailedStats: true
  };

  const taskConfig = { ...defaultConfig, ...config };

  // Theme configuration
  const themes = {
    blue: {
      primary: "bg-blue-600 hover:bg-blue-700",
      accent: "text-blue-600",
      card: "bg-blue-50 border-blue-200",
      icon: "text-blue-600"
    },
    purple: {
      primary: "bg-purple-600 hover:bg-purple-700",
      accent: "text-purple-600",
      card: "bg-purple-50 border-purple-200",
      icon: "text-purple-600"
    },
    green: {
      primary: "bg-green-600 hover:bg-green-700",
      accent: "text-green-600",
      card: "bg-green-50 border-green-200",
      icon: "text-green-600"
    }
  };

  const currentTheme = themes[taskConfig.theme] || themes.blue;

  // Calculate basic statistics
  const correctResponses = results.filter(r => r.is_correct).length;
  const accuracy = (correctResponses / results.length) * 100;
  const avgRT = results.length > 0 
    ? results
        .filter(r => r.is_correct && r.participant_response !== "timeout")
        .reduce((sum, r) => sum + r.reaction_time, 0) / correctResponses
    : 0;

  // Calculate custom statistics if provided
  const customStats = taskConfig.calculateCustomStats 
    ? taskConfig.calculateCustomStats(results) 
    : null;

  // Download CSV function
  const downloadCSV = () => {
    const headers = taskConfig.downloadFields;
    
    const csvContent = [
      headers.join(","),
      ...results.map(r => [
        `"${r.student_name || studentInfo?.name || 'Unknown'}"`,
        `"${r.student_id || studentInfo?.id || 'Unknown'}"`,
        r.trial_number || '',
        `"${r.stimulus_type || r.condition || ''}"`,
        `"${r.correct_response || ''}"`,
        `"${r.participant_response || r.response || ''}"`,
        r.reaction_time || 0,
        r.is_correct || false,
        `"${r.session_start || new Date().toISOString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${taskConfig.taskName.toLowerCase().replace(/\s+/g, '_')}_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${taskConfig.gradientFrom} ${taskConfig.gradientTo} p-6`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              {taskConfig.title}
            </CardTitle>
            <p className="text-lg text-slate-600 mt-2">
              {taskConfig.description}
            </p>
          </CardHeader>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-3xl font-bold text-emerald-800">
                  {accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-emerald-600">Overall Accuracy</div>
              </div>
              
              <div className={`text-center p-4 rounded-lg border ${currentTheme.card}`}>
                <div className={`text-3xl font-bold ${currentTheme.accent.replace('-600', '-800')}`}>
                  {avgRT > 0 ? avgRT.toFixed(0) : '0'}ms
                </div>
                <div className={`text-sm ${currentTheme.icon}`}>Average Response Time</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-3xl font-bold text-slate-800">
                  {results.length}
                </div>
                <div className="text-sm text-slate-600">Total Trials</div>
              </div>
            </div>

            {/* Custom Statistics */}
            {customStats && taskConfig.showDetailedStats && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(customStats).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xl font-bold text-slate-800">
                        {typeof value === 'number' ? 
                          (key.includes('hits') || key.includes('misses') || key.includes('alarms') || key.includes('rejections') ? 
                            Math.round(value) : 
                            value.toFixed(value > 10 ? 0 : 1)) 
                          : value}
                        {typeof value === 'number' && key.toLowerCase().includes('time') ? 'ms' : ''}
                        {typeof value === 'number' && key.toLowerCase().includes('accuracy') ? '%' : ''}
                      </div>
                      <div className="text-sm text-slate-600 capitalize">
                        {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={downloadCSV}
            variant="outline"
            className="flex items-center gap-2 h-12 px-6"
          >
            <Download className="w-5 h-5" />
            Download Results (CSV)
          </Button>
          
          <Link to="/">
            <Button className={`${currentTheme.primary} text-white h-12 px-6`}>
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
