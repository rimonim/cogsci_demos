import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard, Play, Shield, AlertTriangle } from "lucide-react";

export default function TaskSetup({ onStart }) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [shareData, setShareData] = useState(false); // Default to private

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && studentId.trim()) {
      onStart(name.trim(), studentId.trim(), shareData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Flanker Task Setup
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Please enter your information to begin
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="h-12 bg-white/60 border-slate-200 focus:border-blue-400"
                  required
                />
              </div>

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
                  className="h-12 bg-white/60 border-slate-200 focus:border-blue-400"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    id="shareData"
                    type="checkbox"
                    checked={shareData}
                    onChange={(e) => setShareData(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
                disabled={!name.trim() || !studentId.trim()}
              >
                <Play className="w-5 h-5 mr-2" />
                Begin Task
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}