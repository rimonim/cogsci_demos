import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Eye } from "lucide-react";

export default function TaskSetup({ onComplete }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && id.trim()) {
      onComplete({ name: name.trim(), id: id.trim() });
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
