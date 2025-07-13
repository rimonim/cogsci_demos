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
  const [showManagement, setShowManagement] = useState(false);

  useEffect(() => {
    // Check authentication first
    if (!InstructorAuth.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // Load available sessions first
    loadAvailableSessions();
    
    // Try to get session ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('session');
    if (sessionIdFromUrl) {
      setCurrentSessionId(sessionIdFromUrl);
      loadSessionResults(sessionIdFromUrl);
    } else {
      // If no session specified, just finish loading (will show session selector)
      setLoading(false);
    }
  }, []);

  const loadAvailableSessions = async () => {
    try {
      console.log('[Results] Loading available sessions...');
      const response = await fetch('/api/session', {
        headers: {
          ...InstructorAuth.getAuthHeaders()
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`[Results] Session API response:`, data);
        
        // Handle the correct API response format
        const sessions = data.sessions || [];
        console.log(`[Results] Loaded ${sessions.length} available sessions`);
        setAvailableSessions(sessions);
      } else {
        console.error('[Results] Failed to load sessions:', response.status);
        setAvailableSessions([]); // Ensure it's always an array
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      setAvailableSessions([]); // Ensure it's always an array on error
    }
  };

  const loadSessionResults = async (sessionId) => {
    if (!sessionId) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log(`[Results] Loading data for session: ${sessionId}`);
      const response = await fetch(`/api/session/${sessionId}`, {
        headers: {
          ...InstructorAuth.getAuthHeaders()
        }
      });
      
      console.log(`[Results] Session API response status: ${response.status}`);
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log(`[Results] Session data received:`, {
          success: sessionData.success,
          resultCount: sessionData.resultCount,
          resultsLength: sessionData.results?.length || 0
        });
        
        setResults(sessionData.results || []);
      } else {
        // Log the error response
        const errorText = await response.text();
        console.error(`[Results] Session API call failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // For 401/403, redirect to login
        if (response.status === 401 || response.status === 403) {
          alert('Session expired. Please log in again.');
          InstructorAuth.logout();
          window.location.href = '/login';
          return;
        }
        
        // For other errors, show an alert and clear results
        alert(`Failed to load session data: ${response.status} ${response.statusText}`);
        setResults([]);
      }
    } catch (error) {
      console.error("Error loading session results:", error);
      setResults([]);
    }
    setLoading(false);
  };

  const switchToSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    loadSessionResults(sessionId);
    
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
      if (currentSessionId) {
        await loadSessionResults(currentSessionId);
      }
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setClearing(false);
    }
  };

  // Determine what tasks are represented in the data
  const taskTypes = [...new Set(results.map(r => r.task_type).filter(Boolean))];
  const primaryTask = taskTypes.length === 1 ? taskTypes[0] : null;

  // Find current session info
  const currentSession = currentSessionId && availableSessions.find(s => s.sessionId === currentSessionId);

  const getResultsTitle = () => {
    if (currentSessionId && currentSession) {
      return `Session: ${currentSession.name || currentSessionId}`;
    }
    
    if (results.length === 0) return "Session Results";
    if (primaryTask === 'flanker') return "Flanker task performance analysis";
    if (primaryTask === 'stroop') return "Stroop task performance analysis";
    if (primaryTask === 'visual_search') return "Visual search task performance analysis";
    if (primaryTask === 'n_back') return "N-back task performance analysis";
    if (primaryTask === 'posner') return "Posner cueing task performance analysis";
    if (primaryTask === 'mental_rotation') return "Mental rotation task performance analysis";
    if (primaryTask === 'change_detection') return "Change detection task performance analysis";
    return "Cognitive task performance analysis";
  };

  const downloadAllResults = async () => {
    if (results.length === 0) return;

    // If we're viewing a specific session, use session endpoint for CSV
    if (currentSessionId) {
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
            
            {currentSessionId && currentSession && (
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
            {!showManagement && currentSessionId && (
              <Button
                onClick={() => {
                  setCurrentSessionId(null);
                  setResults([]);
                  
                  // Update URL to remove session parameter
                  const url = new URL(window.location);
                  url.searchParams.delete('session');
                  window.history.pushState({}, '', url);
                }}
                variant="outline"
                className="text-slate-600"
              >
                ← Back to Session List
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
                
                {currentSessionId && (
                  <Button
                    onClick={downloadAllResults}
                    disabled={results.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Session Data
                  </Button>
                )}
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
            <p className="text-slate-600 mt-4">Loading...</p>
          </div>
        ) : showManagement ? (
          <SessionManagement 
            onRefresh={() => {
              loadAvailableSessions();
              if (currentSessionId) {
                loadSessionResults(currentSessionId);
              }
            }}
          />
        ) : !currentSessionId ? (
          /* Session Selection View */
          <div className="space-y-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Select a Session to View Results</CardTitle>
                <p className="text-slate-600">Choose from your available sessions below to view detailed results and analytics.</p>
              </CardHeader>
              <CardContent>
                {availableSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Sessions Found</h3>
                    <p className="text-slate-600 mb-4">
                      You haven't created any sessions yet. Create a session to start collecting student data.
                    </p>
                    <Button onClick={() => window.location.href = '/sessions'}>
                      Create First Session
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(availableSessions || []).map(session => (
                      <Card 
                        key={session.sessionId} 
                        className="cursor-pointer hover:shadow-md transition-all border-slate-200 hover:border-blue-300"
                        onClick={() => switchToSession(session.sessionId)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {session.instructorName || 'Unknown Instructor'}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {session.demoType || 'Unknown Task'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {(session.studentRecords || 0) + (session.legacyRecords || 0)} Results
                              </Badge>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                {session.participantCount || 0} Students
                              </Badge>
                              {session.isExpired && (
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                  Expired
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              Session ID: {session.sessionId}
                            </p>
                            <p className="text-xs text-slate-500">
                              Created {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : results.length === 0 ? (
          /* No Data for Selected Session */
          <Card className="bg-white border-slate-200 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data For This Session</h3>
              <p className="text-slate-600 mb-6">
                This session doesn't have any results yet. Once students join and complete experiments, results will appear here.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">📝 Next Steps:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your session link with students to get started</li>
                  <li>• Results will automatically appear here as students complete the task</li>
                  <li>• Download CSV data for analysis when ready</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Session Results View */
          <div className="space-y-8">
            <ResultsSummary results={results} participants={participants} isSessionView={true} />
            <ParticipantTable participants={participants} isSessionView={true} sessionId={currentSessionId} />
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