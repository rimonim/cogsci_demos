import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Eye, Shield, AlertTriangle } from "lucide-react";

export default function TaskSetup({ onComplete }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [shareData, setShareData] = useState(false); // Default to private

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && id.trim()) {
      onComplete({ name: name.trim(), id: id.trim(), shareData });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-slate-200">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Stroop Task Setup</CardTitle>
          <p className="text-slate-600">Enter your information to begin</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="Enter your student ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
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
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
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
            
            <Button type="submit" className="w-full" disabled={!name.trim() || !id.trim()}>
              <User className="w-4 h-4 mr-2" />
              Start Practice Trials
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
