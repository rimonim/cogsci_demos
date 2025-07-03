import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Target, Clock, Check } from 'lucide-react';

/**
 * Unified PracticeComplete component for all cognitive science tasks
 * 
 * @param {Object} props
 * @param {Array} props.results - Practice trial results (optional for simple mode)
 * @param {Function} props.onContinue - Callback for continuing to main task
 * @param {Function} props.onStartExperiment - Alternative callback name (for backward compatibility)
 * @param {Object} props.config - Task configuration
 * @param {string} props.config.taskName - Display name for the task
 * @param {string} props.config.theme - Color theme ('blue', 'purple', 'green', etc.)
 * @param {string} props.config.title - Title text (default: "Practice Complete!")
 * @param {string} props.config.description - Description text
 * @param {string} props.config.buttonText - Button text (default: "Continue to Main Task")
 * @param {boolean} props.config.showStats - Whether to show performance statistics
 * @param {Array} props.config.reminders - Array of reminder strings to display
 * @param {Object} props.config.keyBindings - Key binding reminders {key, description}
 * @param {string} props.config.gradientFrom - Gradient start color class
 * @param {string} props.config.gradientTo - Gradient end color class
 * @param {number} props.config.accuracyWarningThreshold - Threshold below which to show warning (0-100)
 * @param {string} props.config.lowAccuracyMessage - Message to show for low accuracy
 */
export default function PracticeComplete({ 
  results, 
  onContinue, 
  onStartExperiment, 
  config 
}) {
  // Default configuration
  const defaultConfig = {
    taskName: "Cognitive Task",
    theme: "blue",
    title: "Practice Complete!",
    description: "Great job! You're ready to begin the main experiment.",
    buttonText: "Continue to Main Task",
    showStats: true,
    reminders: ["Respond as quickly and accurately as possible"],
    keyBindings: [],
    gradientFrom: "from-slate-50",
    gradientTo: "to-blue-50",
    accuracyWarningThreshold: 70,
    lowAccuracyMessage: "Your accuracy was a bit low. Take your time in the main task to look carefully before responding."
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
    },
    emerald: {
      primary: "bg-emerald-600 hover:bg-emerald-700",
      accent: "text-emerald-600",
      card: "bg-emerald-50 border-emerald-200",
      icon: "text-emerald-600"
    }
  };

  const currentTheme = themes[taskConfig.theme] || themes.blue;

  // Calculate performance statistics
  let accuracy = 0;
  let avgRT = 0;
  let showLowAccuracyWarning = false;

  if (results && results.length > 0 && taskConfig.showStats) {
    const correctResponses = results.filter(r => r.is_correct);
    accuracy = (correctResponses.length / results.length) * 100;
    
    const validRTs = correctResponses.filter(r => r.participant_response !== "timeout" && r.reaction_time > 0);
    if (validRTs.length > 0) {
      avgRT = validRTs.reduce((sum, r) => sum + r.reaction_time, 0) / validRTs.length;
    }
    
    showLowAccuracyWarning = accuracy < taskConfig.accuracyWarningThreshold;
  }

  // Handle both callback styles for backward compatibility
  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (onStartExperiment) {
      onStartExperiment();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${taskConfig.gradientFrom} ${taskConfig.gradientTo} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-xl border-slate-200">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {taskConfig.title}
          </CardTitle>
          <p className="text-slate-600 mt-2">
            {taskConfig.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Performance Statistics */}
          {taskConfig.showStats && results && results.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
                <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-800">
                  {accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-emerald-600">Accuracy</div>
              </div>
              
              <div className={`rounded-lg p-4 text-center border ${currentTheme.card}`}>
                <Clock className={`w-6 h-6 ${currentTheme.icon} mx-auto mb-2`} />
                <div className={`text-2xl font-bold ${currentTheme.accent.replace('text-', 'text-').replace('-600', '-800')}`}>
                  {avgRT > 0 ? avgRT.toFixed(0) : '0'}ms
                </div>
                <div className={`text-sm ${currentTheme.icon}`}>Avg Response Time</div>
              </div>
            </div>
          )}

          {/* Reminders Section */}
          {(taskConfig.reminders.length > 0 || taskConfig.keyBindings.length > 0) && (
            <div className={`rounded-lg p-4 border ${currentTheme.card}`}>
              <h4 className={`font-semibold mb-2 ${currentTheme.accent.replace('-600', '-900')}`}>
                🎯 Remember:
              </h4>
              <ul className={`text-sm space-y-1 ${currentTheme.accent.replace('-600', '-800')}`}>
                {taskConfig.reminders.map((reminder, index) => (
                  <li key={index}>• {reminder}</li>
                ))}
                {taskConfig.keyBindings.map((binding, index) => (
                  <li key={`binding-${index}`} className="flex items-center gap-1">
                    <span>• </span>
                    <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">
                      {binding.key}
                    </kbd>
                    <span>={binding.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Low Accuracy Warning */}
          {showLowAccuracyWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> {taskConfig.lowAccuracyMessage}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <Button 
            onClick={handleContinue}
            className={`w-full h-12 ${currentTheme.primary} text-white font-semibold shadow-lg`}
            size="lg"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            {taskConfig.buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
