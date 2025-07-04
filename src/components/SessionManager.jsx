import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Users, Calendar, Clock } from 'lucide-react';

export default function SessionManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [session, setSession] = useState(null);
  const [formData, setFormData] = useState({
    instructorName: '',
    demoType: ''
  });

  const demoTypes = [
    { value: 'flanker', label: 'Flanker Task' },
    { value: 'stroop', label: 'Stroop Task' },
    { value: 'nback', label: 'N-Back Task' },
    { value: 'visual_search', label: 'Visual Search Task' }
  ];

  const createSession = async () => {
    if (!formData.instructorName || !formData.demoType) {
      alert('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating session with data:', formData);
      
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('Session creation response status:', response.status);
      
      if (!response.ok) {
        // Try to get text response first to avoid JSON parsing errors
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        try {
          // Then try to parse as JSON if possible
          const errorJson = JSON.parse(errorText);
          alert('Failed to create session: ' + (errorJson.error || 'Unknown error'));
        } catch (parseError) {
          // If parsing fails, use the raw text
          alert('Failed to create session: ' + errorText);
        }
        return;
      }
      
      try {
        const result = await response.json();
        console.log('Session creation result:', result);
        
        if (result.success) {
          setSession(result.sessionData);
        } else {
          alert('Failed to create session: ' + result.error);
        }
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        alert('Error parsing server response: ' + jsonError.message);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const copySessionLink = () => {
    const sessionUrl = `${window.location.origin}/session/${session.sessionId}`;
    navigator.clipboard.writeText(sessionUrl);
    alert('Session link copied to clipboard!');
  };

  const downloadSessionData = () => {
    const downloadUrl = `/api/session/${session.sessionId}?format=csv`;
    window.open(downloadUrl, '_blank');
  };

  if (session) {
    const sessionUrl = `${window.location.origin}/session/${session.sessionId}`;
    const expiresAt = new Date(session.expiresAt);

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700">
              Session Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Instructor</div>
                  <div className="font-medium">{session.instructorName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Demo Type</div>
                  <div className="font-medium capitalize">{session.demoType.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Session ID</div>
                  <div className="font-medium font-mono">{session.sessionId}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Expires</div>
                  <div className="font-medium">{expiresAt.toLocaleDateString()} {expiresAt.toLocaleTimeString()}</div>
                </div>
              </div>
            </div>

            {/* Session Link */}
            <div className="space-y-2">
              <Label>Share this link with your students:</Label>
              <div className="flex gap-2">
                <Input 
                  value={sessionUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button onClick={copySessionLink} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                Students will automatically join your session when they visit this link.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={downloadSessionData} className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Download Session Data (CSV)
              </Button>
              <Button 
                onClick={() => setSession(null)} 
                variant="outline"
              >
                Create Another Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">Create Class Session</CardTitle>
          <p className="text-sm text-slate-600">
            Create a session for your students to join and complete cognitive science demos.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="space-y-2">
            <Label htmlFor="instructorName">Instructor Name</Label>
            <Input
              id="instructorName"
              placeholder="Enter your name"
              value={formData.instructorName}
              onChange={(e) => setFormData(prev => ({...prev, instructorName: e.target.value}))}
            />
          </div>

          <div className="space-y-3">
            <Label>Demo Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {demoTypes.map(demo => (
                <div 
                  key={demo.value}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.demoType === demo.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setFormData(prev => ({...prev, demoType: demo.value}))}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.demoType === demo.value 
                      ? 'border-blue-500' 
                      : 'border-slate-300'
                  }`}>
                    {formData.demoType === demo.value && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <span className="font-medium text-slate-900">{demo.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={createSession} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating Session...' : 'Create Session'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
