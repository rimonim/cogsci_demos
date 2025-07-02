import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2, AlertTriangle } from "lucide-react";

export default function ParticipantTable({ participants }) {
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const downloadParticipantData = (participant) => {
    const headers = [
      "trial_number", "stimulus_type", "stimulus_display", "correct_response", 
      "participant_response", "reaction_time_ms", "is_correct"
    ];

    const csvContent = [
      headers.join(","),
      ...participant.trials.map(t => [
        t.trial_number,
        t.stimulus_type,
        `"${t.stimulus_display}"`,
        t.correct_response,
        t.participant_response,
        t.reaction_time,
        t.is_correct
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flanker_${participant.name.replace(/\s+/g, "_")}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadClassData = async () => {
    try {
      const response = await fetch('/api/record', {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cogsci_class_results.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download class data:', response.statusText);
        alert('Failed to download class data. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading class data:', error);
      alert('Error downloading class data. Please check your connection.');
    }
  };

  const clearAllData = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/record', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Successfully cleared ${result.recordsCleared} records. The page will now reload.`);
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
    const correct = trials.filter(t => t.is_correct);
    const accuracy = (correct.length / trials.length) * 100;
    
    const validRTs = correct.filter(t => t.participant_response !== "timeout");
    const avgRT = validRTs.length > 0 
      ? validRTs.reduce((sum, t) => sum + t.reaction_time, 0) / validRTs.length 
      : 0;
    
    const congruent = trials.filter(t => t.stimulus_type === "congruent" && t.is_correct);
    const incongruent = trials.filter(t => t.stimulus_type === "incongruent" && t.is_correct);
    
    const congruentRT = congruent.length > 0 
      ? congruent.reduce((sum, t) => sum + t.reaction_time, 0) / congruent.length 
      : 0;
    const incongruentRT = incongruent.length > 0 
      ? incongruent.reduce((sum, t) => sum + t.reaction_time, 0) / incongruent.length 
      : 0;
    
    const flankerEffect = incongruentRT - congruentRT;
    
    return { accuracy, avgRT, flankerEffect };
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Participant Results</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadClassData}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Class Data
            </Button>
            
            {/* Instructor Reset Controls */}
            {!showResetConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Reset Data
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">Clear all data?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={clearAllData}
                  disabled={isResetting}
                >
                  {isResetting ? 'Clearing...' : 'Yes, Clear All'}
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
                <TableHead>Completed</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Avg RT</TableHead>
                <TableHead>Flanker Effect</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant, index) => {
                const stats = calculateStats(participant.trials);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>{participant.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {format(new Date(participant.completedAt), "MM/dd HH:mm")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stats.accuracy >= 75 ? "default" : "destructive"}>
                        {stats.accuracy.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{stats.avgRT.toFixed(0)}ms</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        +{stats.flankerEffect.toFixed(0)}ms
                      </Badge>
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
