import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ResultsChart({ participants }) {
  const chartData = participants.map((participant, index) => {
    const congruent = participant.trials.filter(t => t.stimulus_type === "congruent" && t.is_correct);
    const incongruent = participant.trials.filter(t => t.stimulus_type === "incongruent" && t.is_correct);
    
    const congruentRT = congruent.length > 0 
      ? congruent.reduce((sum, t) => sum + t.reaction_time, 0) / congruent.length 
      : 0;
    const incongruentRT = incongruent.length > 0 
      ? incongruent.reduce((sum, t) => sum + t.reaction_time, 0) / incongruent.length 
      : 0;
    
    return {
      participant: `P${index + 1}`,
      name: participant.name,
      congruent: Math.round(congruentRT),
      incongruent: Math.round(incongruentRT),
      flankerEffect: Math.round(incongruentRT - congruentRT)
    };
  });

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Reaction Time Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="participant" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                label={{ value: 'Reaction Time (ms)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  `${value}ms`, 
                  name === 'congruent' ? 'Congruent' : 'Incongruent'
                ]}
                labelFormatter={(label, payload) => {
                  const participant = payload?.[0]?.payload?.name;
                  return participant ? `${participant} (${label})` : label;
                }}
              />
              <Bar dataKey="congruent" fill="#10b981" name="congruent" />
              <Bar dataKey="incongruent" fill="#f59e0b" name="incongruent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}