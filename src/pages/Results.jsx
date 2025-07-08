import React, { useState, useEffect } from "react";
import { FlankerResult } from "@/entities/FlankerResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, TrendingUp, Clock, Trash2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { clearAllTaskData } from "@/utils";
import { SessionContext } from "@/utils/sessionContext";
import { InstructorAuth } from "@/utils/instructorAuth";

import ResultsSummary from "@/components/results/ResultsSummary";
import ParticipantTable from "@/components/results/ParticipantTable.jsx";
import SessionManagement from "@/components/SessionManagement.jsx";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [isSessionView, setIsSessionView] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  useEffect(() => {
    // Check authentication first
    if (!InstructorAuth.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // Try to get session ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('session');
    if (sessionIdFromUrl) {
      setCurrentSessionId(sessionIdFromUrl);
      setIsSessionView(true);
    }
    
    loadResults(sessionIdFromUrl);
    loadAvailableSessions();
  }, []);

  const loadAvailableSessions = async () => {
    try {
      const response = await fetch('/api/session', {
        headers: {
          ...InstructorAuth.getAuthHeaders()
        }
      });
      if (response.ok) {
        const sessions = await response.json();
        setAvailableSessions(sessions);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const loadResults = async (sessionId = null) => {
    try {
      // If we have a session ID, load from session API
      if (sessionId) {
        const response = await fetch(`/api/session/${sessionId}`, {
          headers: {
            ...InstructorAuth.getAuthHeaders()
          }
        });
        if (response.ok) {
          const sessionData = await response.json();
          setResults(sessionData.results || []);
          setLoading(false);
          return;
        }
      }
      
      // Otherwise load from API (shared data)
      const apiData = await FlankerResult.list("-created_date");
      
      // Also load from local storage for all task types
      const flankerLocal = JSON.parse(localStorage.getItem('flankerResults') || '[]');
      const stroopLocal = JSON.parse(localStorage.getItem('stroopResults') || '[]');
      const visualSearchLocal = JSON.parse(localStorage.getItem('visualSearchResults') || '[]');
      const nBackLocal = JSON.parse(localStorage.getItem('nBackResults') || '[]');
      
      // Add task_type to local data if missing
      const flankerLocalWithType = flankerLocal.map(item => ({
        ...item,
        task_type: item.task_type || 'flanker'
      }));
      
      const stroopLocalWithType = stroopLocal.map(item => ({
        ...item, 
        task_type: item.task_type || 'stroop'
      }));

      const visualSearchLocalWithType = visualSearchLocal.map(item => ({
        ...item, 
        task_type: item.task_type || 'visual_search'
      }));
      
      const nBackLocalWithType = nBackLocal.map(item => ({
        ...item, 
        task_type: item.task_type || 'n_back'
      }));
      
      // Combine API and local data, removing duplicates
      const allData = [
        ...apiData, 
        ...flankerLocalWithType, 
        ...stroopLocalWithType, 
        ...visualSearchLocalWithType,
        ...nBackLocalWithType
      ];
      
      // Remove duplicates based on timestamp and participant
      const uniqueData = allData.filter((item, index, self) => 
        index === self.findIndex(t => 
          t.timestamp === item.timestamp && 
          t.student_id === item.student_id &&
          t.trial_number === item.trial_number
        )
      );
      
      setResults(uniqueData);
    } catch (error) {
      console.error("Error loading results:", error);
    }
    setLoading(false);
  };

  const switchToSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setIsSessionView(true);
    loadResults(sessionId);
    
    // Update URL with session parameter
    const url = new URL(window.location);
    url.searchParams.set('session', sessionId);
    window.history.pushState({}, '', url);
  };

  const handleClearAllData = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      return;
    }
    
    setClearing(true);
    try {
      await clearAllTaskData();
      await loadResults(); // Refresh the results
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setClearing(false);
    }
  };

  // Determine what tasks are represented in the data
  const taskTypes = [...new Set(results.map(r => r.task_type).filter(Boolean))];
  const isMixed = taskTypes.length > 1;
  const primaryTask = taskTypes.length === 1 ? taskTypes[0] : null;

  // Find current session info if we're in session view
  const currentSession = isSessionView && availableSessions.find(s => s.id === currentSessionId);

  const getResultsTitle = () => {
    if (isSessionView && currentSession) {
      return `Session: ${currentSession.name || currentSessionId}`;
    }
    
    if (results.length === 0) return "Results Dashboard";
    if (isMixed) return "Mixed task performance analysis";
    if (primaryTask === 'flanker') return "Flanker task performance analysis";
    if (primaryTask === 'stroop') return "Stroop task performance analysis";
    if (primaryTask === 'visual_search') return "Visual search task performance analysis";
    if (primaryTask === 'n_back') return "N-back task performance analysis";
    return "Cognitive task performance analysis";
  };

  const downloadAllResults = async () => {
    if (results.length === 0) return;

    // If we're viewing a session, use session endpoint for CSV
    if (isSessionView && currentSessionId) {
      try {
        const response = await fetch(`/api/session/${currentSessionId}?format=csv`, {
          headers: {
            ...InstructorAuth.getAuthHeaders()
          }
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `session_${currentSessionId}_results.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      } catch (error) {
        console.error("Error downloading session CSV:", error);
        // Fall back to client-side CSV generation
      }
    }

    // Client-side CSV generation (fallback or non-session view)
    const headers = [
      "task_type", "student_name", "student_id", "trial_number", "stimulus_type", "stimulus_display",
      "correct_response", "participant_response", "reaction_time_ms", "is_correct", 
      "session_id", "session_start_time", "date_completed"
    ];

    const csvContent = [
      headers.join(","),
      ...results.map(r => [
        `"${r.task_type || 'flanker'}"`,
        `"${r.student_name}"`,
        `"${r.student_id}"`,
        r.trial_number,
        r.stimulus_type,
        `"${r.stimulus_display}"`,
        r.correct_response,
        r.participant_response,
        r.reaction_time || r.reaction_time_ms,
        r.is_correct,
        r.session_id || '',
        r.session_start_time || '',
        r.created_date || r.timestamp
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cognitive_tasks_results_${Date.now()}.csv`;
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
        sessionId: result.session_id,
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
            <p className="text-slate-600 mt-1">{getResultsTitle()}</p>
            
            {isSessionView && currentSession && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Session ID: {currentSessionId}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {results.length} Total Results
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {participants.length} Students
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {!showManagement && isSessionView && (
              <Button
                onClick={() => {
                  setIsSessionView(false);
                  setCurrentSessionId(null);
                  loadResults();
                  
                  // Update URL to remove session parameter
                  const url = new URL(window.location);
                  url.searchParams.delete('session');
                  window.history.pushState({}, '', url);
                }}
                variant="outline"
                className="text-slate-600"
              >
                ← Back to All Results
              </Button>
            )}
            
            {!showManagement && (
              <>
                <Button
                  onClick={() => setShowManagement(true)}
                  variant="outline"
                  className="text-slate-600"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Sessions
                </Button>
                
                <Button
                  onClick={handleClearAllData}
                  disabled={results.length === 0 || clearing}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {clearing ? 'Clearing...' : 'Clear All Data'}
                </Button>
                <Button
                  onClick={downloadAllResults}
                  disabled={results.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export {isSessionView ? 'Session' : 'All'} Data
                </Button>
              </>
            )}
            
            {showManagement && (
              <Button
                onClick={() => setShowManagement(false)}
                variant="outline"
                className="text-slate-600"
              >
                ← Back to Results
              </Button>
            )}
          </div>
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
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data {isSessionView ? 'For This Session' : 'Yet'}</h3>
              <p className="text-slate-600 mb-6">
                {isSessionView 
                  ? "This session doesn't have any results yet. Once students join and complete experiments, results will appear here."
                  : "Students haven't started taking experiments yet. Once they begin, results will appear here in real-time."
                }
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">📝 For Instructors:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {isSessionView 
                    ? "Share your session link with students to get started" 
                    : "Create a session to start collecting class data"
                  }</li>
                  <li>• Results will automatically aggregate here</li>
                  <li>• Download CSV data for R analysis when ready</li>
                  {!isSessionView && (
                    <li>• Use "Reset Data" before each new class session</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : showManagement ? (
          <SessionManagement 
            onRefresh={() => {
              loadResults();
              loadAvailableSessions();
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Session selector for non-session view */}
            {!isSessionView && availableSessions.length > 0 && (
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Available Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSessions.map(session => (
                      <Card 
                        key={session.id} 
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => switchToSession(session.id)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{session.name || `Session ${session.id}`}</h3>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">{session.resultCount || 0} Results</Badge>
                            <Badge variant="outline">{session.studentCount || 0} Students</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Created {new Date(session.created).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <ResultsSummary results={results} participants={participants} isSessionView={isSessionView} />
            <ParticipantTable participants={participants} isSessionView={isSessionView} sessionId={currentSessionId} />
          </div>
        )}

        {/* Session management component */}
        {showManagement && (
          <SessionManagement 
            onClose={() => setShowManagement(false)} 
            onSessionCreated={loadAvailableSessions}
            onSessionDeleted={loadAvailableSessions}
          />
        )}
      </div>
    </div>
  );
}