import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, IdCard, Play } from "lucide-react";

export default function TaskSetup({ onStart }) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && studentId.trim()) {
      onStart(name.trim(), studentId.trim());
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
                  <IdCard className="w-4 h-4" />
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