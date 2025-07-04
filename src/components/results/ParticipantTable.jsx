import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2, AlertTriangle } from "lucide-react";

export default function ParticipantTable({ participants, isSessionView = false, sessionId = null }) {
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const downloadParticipantData = (participant) => {
    const headers = [
      "trial_number", "stimulus_type", "stimulus_display", "correct_response", 
      "participant_response", "reaction_time_ms", "is_correct", "task_type"
    ];

    const csvContent = [
      headers.join(","),
      ...participant.trials.map(t => [
        t.trial_number,
        t.stimulus_type,
        `"${t.stimulus_display}"`,
        t.correct_response,
        t.participant_response,
        t.reaction_time || t.reaction_time_ms,
        t.is_correct,
        t.task_type || 'flanker'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${participant.name.replace(/\s+/g, "_")}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadClassData = async () => {
    try {
      // If we're in a session view, use session-specific endpoint
      const endpoint = isSessionView && sessionId
        ? `/api/session/${sessionId}?format=csv`
        : '/api/record';
        
      const response = await fetch(endpoint, {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = isSessionView && sessionId
          ? `session_${sessionId}_results.csv`
          : "cogsci_class_results.csv";
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download data:', response.statusText);
        alert('Failed to download data. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Error downloading data. Please check your connection.');
    }
  };

  const clearAllData = async () => {
    setIsResetting(true);
    try {
      // If we're in a session view, use session-specific endpoint
      const endpoint = isSessionView && sessionId
        ? `/api/session/${sessionId}`
        : '/api/record';
        
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Successfully cleared ${result.recordsCleared || result.count || 'all'} records. The page will now reload.`);
        window.location.reload(); // Refresh to show empty state
      } else {
        console.error('Failed to clear data:', response.statusText);
        alert('Failed to clear data. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data. Please check your connection.');
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const calculateStats = (trials) => {
    // Get task-specific trials
    const flankerTrials = trials.filter(t => !t.task_type || t.task_type === 'flanker');
    const stroopTrials = trials.filter(t => t.task_type === 'stroop');
    const visualSearchTrials = trials.filter(t => t.task_type === 'visual_search');
    const nBackTrials = trials.filter(t => t.task_type === 'n_back');
    
    // Calculate general stats
    const allCorrect = trials.filter(t => t.is_correct);
    const accuracy = trials.length > 0 ? (allCorrect.length / trials.length) * 100 : 0;
    
    const validRTs = allCorrect.filter(t => t.participant_response !== "timeout");
    const avgRT = validRTs.length > 0 
      ? validRTs.reduce((sum, t) => sum + (t.reaction_time || t.reaction_time_ms), 0) / validRTs.length 
      : 0;
    
    // Calculate Flanker effect if we have flanker trials
    let flankerEffect = 0;
    if (flankerTrials.length > 0) {
      const congruent = flankerTrials.filter(t => t.stimulus_type === "congruent" && t.is_correct);
      const incongruent = flankerTrials.filter(t => t.stimulus_type === "incongruent" && t.is_correct);
      
      const congruentRT = congruent.length > 0 
        ? congruent.reduce((sum, t) => sum + (t.reaction_time || t.reaction_time_ms), 0) / congruent.length 
        : 0;
      const incongruentRT = incongruent.length > 0 
        ? incongruent.reduce((sum, t) => sum + (t.reaction_time || t.reaction_time_ms), 0) / incongruent.length 
        : 0;
      
      flankerEffect = incongruentRT - congruentRT;
    }
    
    // Calculate Stroop effect if we have stroop trials
    let stroopEffect = 0;
    if (stroopTrials.length > 0) {
      const congruent = stroopTrials.filter(t => t.stimulus_type === "congruent" && t.is_correct);
      const incongruent = stroopTrials.filter(t => t.stimulus_type === "incongruent" && t.is_correct);
      
      const congruentRT = congruent.length > 0 
        ? congruent.reduce((sum, t) => sum + (t.reaction_time || t.reaction_time_ms), 0) / congruent.length 
        : 0;
      const incongruentRT = incongruent.length > 0 
        ? incongruent.reduce((sum, t) => sum + (t.reaction_time || t.reaction_time_ms), 0) / incongruent.length 
        : 0;
      
      stroopEffect = incongruentRT - congruentRT;
    }
    
    // Return different stats based on which task is most prevalent
    if (stroopTrials.length > flankerTrials.length && stroopTrials.length > visualSearchTrials.length && stroopTrials.length > nBackTrials.length) {
      return { accuracy, avgRT, effect: stroopEffect, taskType: 'stroop' };
    } else if (visualSearchTrials.length > flankerTrials.length && visualSearchTrials.length > stroopTrials.length && visualSearchTrials.length > nBackTrials.length) {
      return { accuracy, avgRT, effect: 0, taskType: 'visual_search' };
    } else if (nBackTrials.length > flankerTrials.length && nBackTrials.length > stroopTrials.length && nBackTrials.length > visualSearchTrials.length) {
      return { accuracy, avgRT, effect: 0, taskType: 'n_back' };
    } else {
      return { accuracy, avgRT, effect: flankerEffect, taskType: 'flanker' };
    }
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {isSessionView ? 'Session Participants' : 'Participant Results'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadClassData}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {isSessionView ? 'Session' : 'Class'} Data
            </Button>
            
            {/* Instructor Reset Controls */}
            {!showResetConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Reset {isSessionView ? 'Session' : ''} Data
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">Clear {isSessionView ? 'session' : 'all'} data?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={clearAllData}
                  disabled={isResetting}
                >
                  {isResetting ? 'Clearing...' : 'Yes, Clear'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
        {participants.length > 0 && (
          <p className="text-sm text-slate-600">
            📊 {participants.length} student{participants.length !== 1 ? 's' : ''} completed • Ready for R analysis
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Task Type</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Avg RT</TableHead>
                <TableHead>Effect</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant, index) => {
                const stats = calculateStats(participant.trials);
                const latestTrial = participant.trials.reduce((latest, current) => {
                  const latestDate = new Date(latest.timestamp || latest.created_date);
                  const currentDate = new Date(current.timestamp || current.created_date);
                  return currentDate > latestDate ? current : latest;
                }, participant.trials[0]);
                const completedAt = latestTrial?.timestamp || latestTrial?.created_date;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>{participant.id}</TableCell>
                    <TableCell>
                      <Badge className="capitalize">
                        {stats.taskType === 'visual_search' ? 'Visual Search' : stats.taskType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {completedAt ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {format(new Date(completedAt), "MM/dd HH:mm")}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stats.accuracy >= 75 ? "default" : "destructive"}>
                        {stats.accuracy.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{stats.avgRT.toFixed(0)}ms</TableCell>
                    <TableCell>
                      {(stats.taskType === 'flanker' || stats.taskType === 'stroop') && stats.effect > 0 ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          +{stats.effect.toFixed(0)}ms
                        </Badge>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadParticipantData(participant)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
