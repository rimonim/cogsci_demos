import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Clock, TrendingUp, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ResultsSummary({ results, participants, isSessionView = false }) {
  const totalParticipants = participants.length;
  const totalTrials = results.length;
  
  const overallAccuracy = results.length > 0 
    ? (results.filter(r => r.is_correct).length / results.length) * 100 
    : 0;
  
  const avgReactionTime = results
    .filter(r => r.is_correct && r.participant_response !== "timeout")
    .reduce((sum, r, _, arr) => sum + (r.reaction_time || r.reaction_time_ms) / arr.length, 0);

  // Count task types
  const taskTypes = results.reduce((acc, result) => {
    const taskType = result.task_type || 'flanker';
    acc[taskType] = (acc[taskType] || 0) + 1;
    return acc;
  }, {});
  
  const taskTypesArray = Object.entries(taskTypes)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
  
  // Get primary task type
  const primaryTaskType = taskTypesArray.length > 0 ? taskTypesArray[0].type : 'flanker';

  // Calculate effects based on task type
  let effectValue = 0;
  let effectLabel = 'Effect';
  
  if (primaryTaskType === 'flanker' || primaryTaskType === 'stroop') {
    // Calculate effect for the primary task
    const effectResults = results.filter(r => r.task_type === primaryTaskType || (!r.task_type && primaryTaskType === 'flanker'));
    
    const congruentTrials = effectResults.filter(t => t.stimulus_type === "congruent" && t.is_correct);
    const incongruentTrials = effectResults.filter(t => t.stimulus_type === "incongruent" && t.is_correct);
    
    const congruentRT = congruentTrials.length > 0 
      ? congruentTrials.reduce((sum, t) => sum + (t.reaction_time || t.reaction_time_ms), 0) / congruentTrials.length 
      : 0;
      
    const incongruentRT = incongruentTrials.length > 0 
      ? incongruentTrials.reduce((sum, t) => sum + (t.reaction_time || t.reaction_time_ms), 0) / incongruentTrials.length 
      : 0;
    
    effectValue = incongruentRT - congruentRT;
    effectLabel = primaryTaskType === 'flanker' ? 'Flanker Effect' : 'Stroop Effect';
  }

  const getTaskTypeDisplay = (type) => {
    switch(type) {
      case 'flanker': return 'Flanker';
      case 'stroop': return 'Stroop';
      case 'visual_search': return 'Visual Search';
      case 'n_back': return 'N-Back';
      default: return type;
    }
  };
  
  let summaryCards = [
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
    }
  ];

  // Add effect card if relevant
  if (effectValue > 0) {
    summaryCards.push({
      title: effectLabel,
      value: `+${effectValue.toFixed(0)}ms`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    });
  } else if (taskTypesArray.length > 1) {
    // If no effect but multiple task types, show task distribution
    summaryCards.push({
      title: "Task Types",
      value: taskTypesArray.length,
      customContent: (
        <div className="flex flex-wrap gap-1 mt-1">
          {taskTypesArray.map(task => (
            <Badge key={task.type} variant="outline" className="text-xs">
              {getTaskTypeDisplay(task.type)} ({task.count})
            </Badge>
          ))}
        </div>
      ),
      icon: Layers,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    });
  }

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
            {card.customContent ? (
              card.customContent
            ) : (
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}