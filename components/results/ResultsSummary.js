import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Clock, TrendingUp } from "lucide-react";

export default function ResultsSummary({ results, participants }) {
  const totalParticipants = participants.length;
  const totalTrials = results.length;
  
  const overallAccuracy = results.length > 0 
    ? (results.filter(r => r.is_correct).length / results.length) * 100 
    : 0;
  
  const avgReactionTime = results
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r, _, arr) => sum + r.reaction_time / arr.length, 0);

  const flankerEffects = participants.map(p => {
    const congruent = p.trials.filter(t => t.stimulus_type === "congruent" && t.is_correct);
    const incongruent = p.trials.filter(t => t.stimulus_type === "incongruent" && t.is_correct);
    
    const congruentRT = congruent.reduce((sum, t) => sum + t.reaction_time, 0) / congruent.length;
    const incongruentRT = incongruent.reduce((sum, t) => sum + t.reaction_time, 0) / incongruent.length;
    
    return incongruentRT - congruentRT;
  }).filter(effect => !isNaN(effect));

  const avgFlankerEffect = flankerEffects.length > 0 
    ? flankerEffects.reduce((sum, effect) => sum + effect, 0) / flankerEffects.length 
    : 0;

  const summaryCards = [
    {
      title: "Total Participants",
      value: totalParticipants,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Overall Accuracy",
      value: `${overallAccuracy.toFixed(1)}%`,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Average RT",
      value: `${avgReactionTime.toFixed(0)}ms`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Flanker Effect",
      value: `+${avgFlankerEffect.toFixed(0)}ms`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}