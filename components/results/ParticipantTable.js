import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ParticipantTable({ participants }) {
  const downloadParticipantData = (participant) => {
    const headers = [
      "Trial", "Stimulus Type", "Stimulus Display", "Correct Response", 
      "Participant Response", "Reaction Time (ms)", "Correct"
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
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Participant Results</CardTitle>
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
                    <TableCell className="font-medium">
                      {participant.name}
                    </TableCell>
                    <TableCell>{participant.id}</TableCell>
                    <TableCell>
                      {format(new Date(participant.sessionStart), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={stats.accuracy >= 80 ? "default" : "secondary"}
                        className={stats.accuracy >= 80 ? "bg-emerald-100 text-emerald-800" : ""}
                      >
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