import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard, Play, Shield, AlertTriangle, Eye, Search } from "lucide-react";

/**
 * Unified TaskSetup component for all cognitive science tasks
 * 
 * @param {Object} props
 * @param {Function} props.onStart - Callback for Flanker-style start (name, studentId, shareData)
 * @param {Function} props.onComplete - Callback for Stroop/VisualSearch-style complete ({name, id, shareData})
 * @param {Object} props.config - Task configuration
 * @param {string} props.config.taskName - Display name for the task
 * @param {string} props.config.theme - Color theme ('blue', 'purple', 'green', etc.)
 * @param {React.ReactNode} props.config.icon - Icon component to display
 * @param {string} props.config.description - Task description text
 * @param {Array} props.config.instructions - Array of instruction strings
 * @param {Object} props.config.keyBindings - Key binding objects {key, description}
 * @param {string} props.config.buttonText - Text for the start button
 * @param {boolean} props.config.showInstructions - Whether to show instructions section
 * @param {string} props.config.gradientFrom - Gradient start color class
 * @param {string} props.config.gradientTo - Gradient end color class
 */
export default function TaskSetup({ onStart, onComplete, config }) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [shareData, setShareData] = useState(false);

  // Default configuration
  const defaultConfig = {
    taskName: "Cognitive Task",
    theme: "blue",
    icon: <Play className="w-6 h-6" />,
    description: "Please enter your information to begin",
    instructions: [],
    keyBindings: [],
    buttonText: "Begin Task",
    showInstructions: false,
    gradientFrom: "from-slate-50",
    gradientTo: "to-blue-50"
  };

  const taskConfig = { ...defaultConfig, ...config };

  // Theme configuration
  const themes = {
    blue: {
      primary: "bg-blue-600 hover:bg-blue-700",
      accent: "text-blue-600",
      checkbox: "text-blue-600 focus:ring-blue-500",
      iconBg: "bg-blue-100",
      border: "focus:border-blue-400"
    },
    purple: {
      primary: "bg-purple-600 hover:bg-purple-700",
      accent: "text-purple-600",
      checkbox: "text-purple-600 focus:ring-purple-500",
      iconBg: "bg-purple-100",
      border: "focus:border-purple-400"
    },
    green: {
      primary: "bg-green-600 hover:bg-green-700",
      accent: "text-green-600",
      checkbox: "text-green-600 focus:ring-green-500",
      iconBg: "bg-green-100",
      border: "focus:border-green-400"
    }
  };

  const currentTheme = themes[taskConfig.theme] || themes.blue;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && studentId.trim()) {
      // Support both callback styles for backward compatibility
      if (onStart) {
        onStart(name.trim(), studentId.trim(), shareData);
      } else if (onComplete) {
        onComplete({ name: name.trim(), id: studentId.trim(), shareData });
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${taskConfig.gradientFrom} ${taskConfig.gradientTo} flex items-center justify-center p-4 md:p-6`}>
      <div className="w-full max-w-md">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className={`w-12 h-12 ${currentTheme.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <div className={currentTheme.accent}>
                {taskConfig.icon}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {taskConfig.taskName}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {taskConfig.description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-12 bg-white/60 border-slate-200 ${currentTheme.border}`}
                  required
                />
              </div>

              {/* Student ID Input */}
              <div className="space-y-2">
                <Label htmlFor="studentId" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CreditCard className="w-4 h-4" />
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className={`h-12 bg-white/60 border-slate-200 ${currentTheme.border}`}
                  required
                />
              </div>

              {/* Data Sharing Checkbox */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    id="shareData"
                    type="checkbox"
                    checked={shareData}
                    onChange={(e) => setShareData(e.target.checked)}
                    className={`w-4 h-4 rounded ${currentTheme.checkbox}`}
                  />
                  <div className="flex-1">
                    <Label htmlFor="shareData" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="w-4 h-4 text-slate-600" />
                      <span className="font-medium text-slate-700">Share my data with class</span>
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">
                      {shareData 
                        ? "Your results will be included in class aggregates and visible to instructors."
                        : "Your data will be kept private and not shared with the class."
                      }
                    </p>
                  </div>
                </div>
                
                {!shareData && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      <strong>Private mode:</strong> Your individual results will still be available for download at the end, 
                      but won't appear in class statistics or instructor dashboards.
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions Section */}
              {taskConfig.showInstructions && (taskConfig.instructions.length > 0 || taskConfig.keyBindings.length > 0) && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Task Instructions
                  </h3>
                  
                  {taskConfig.instructions.length > 0 && (
                    <ul className="text-sm text-slate-700 space-y-2 mb-3">
                      {taskConfig.instructions.map((instruction, index) => (
                        <li key={index}>• {instruction}</li>
                      ))}
                    </ul>
                  )}
                  
                  {taskConfig.keyBindings.length > 0 && (
                    <div className="text-sm text-slate-700 space-y-1">
                      {taskConfig.keyBindings.map((binding, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span>• Press </span>
                          <kbd className="px-1 py-0.5 bg-white rounded text-xs font-mono">
                            {binding.key}
                          </kbd>
                          <span> {binding.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full h-12 ${currentTheme.primary} text-white font-semibold shadow-lg`}
                disabled={!name.trim() || !studentId.trim()}
              >
                <Play className="w-5 h-5 mr-2" />
                {taskConfig.buttonText}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
