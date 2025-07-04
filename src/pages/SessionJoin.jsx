import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, BookOpen, Loader2 } from 'lucide-react';

export default function SessionJoin() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    shareData: true
  });

  useEffect(() => {
    fetchSessionInfo();
  }, [sessionId]);

  const fetchSessionInfo = async () => {
    try {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      console.log('Fetching session data for ID:', sessionId);
      
      // Add cache-busting parameter to avoid browser caching issues
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/api/session/${sessionId}?_=${cacheBuster}`);
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        setError(`API error: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }

      // For debugging: log the raw response
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      let result;
      try {
        // Parse the response text we just logged
        result = JSON.parse(responseText);
        console.log('Parsed session data response:', result);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        setError(`Invalid response format from server: ${jsonError.message}`);
        setLoading(false);
        return;
      }
      
      if (result.success && result.sessionData) {
        console.log('Setting session data:', result.sessionData);
        setSession(result.sessionData);
      } else {
        console.error('Session data error:', result);
        setError(result.error || 'Invalid session data format');
      }
    } catch (error) {
      console.error('Session fetch error:', error);
      setError('Failed to load session information: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startDemo = () => {
    if (!studentInfo.name.trim()) {
      alert('Please enter your name');
      return;
    }

    // Make sure we have a valid session before proceeding
    if (!session) {
      console.error('No session data available');
      alert('Session data is missing. Please try refreshing the page.');
      return;
    }
    
    console.log('Current session data:', session);
    
    if (!session.sessionId || !session.demoType) {
      console.error('Invalid session data:', session);
      alert(`Session data is incomplete. Required fields missing: ${!session.sessionId ? 'sessionId' : ''} ${!session.demoType ? 'demoType' : ''}`);
      return;
    }

    // Store session info globally for the demo
    const sessionDataForStorage = {
      sessionId: session.sessionId,
      demoType: session.demoType,
      studentInfo
    };
    
    console.log('Storing session data:', sessionDataForStorage);
    window.sessionData = sessionDataForStorage;

    // Navigate to the appropriate demo with session context
    const demoRoutes = {
      flanker: '/flanker',
      stroop: '/stroop',
      nback: '/nback',
      visual_search: '/visual-search'
    };

    const route = demoRoutes[session.demoType];
    if (route) {
      navigate(route + `?session=${sessionId}`);
    } else {
      alert('Demo type not supported yet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Session Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const demoLabels = {
    flanker: 'Flanker Task',
    stroop: 'Stroop Task',
    nback: 'N-Back Task',
    visual_search: 'Visual Search Task'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Session Info Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Class Session</CardTitle>
            <Badge variant="outline" className="mx-auto">
              Session {session.sessionId}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Demo</div>
                  <div className="font-medium">{demoLabels[session.demoType] || session.demoType}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Instructor</div>
                  <div className="font-medium">{session.instructorName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Participants</div>
                  <div className="font-medium">{session.participantCount || 0} joined</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Info Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-lg">Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo(prev => ({...prev, name: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID (optional)</Label>
              <Input
                id="studentId"
                placeholder="Enter your student ID"
                value={studentInfo.studentId}
                onChange={(e) => setStudentInfo(prev => ({...prev, studentId: e.target.value}))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shareData"
                checked={studentInfo.shareData}
                onChange={(e) => setStudentInfo(prev => ({...prev, shareData: e.target.checked}))}
                className="w-4 h-4"
              />
              <Label htmlFor="shareData" className="text-sm">
                Share my data with instructor for class analysis
              </Label>
            </div>

            <Button onClick={startDemo} className="w-full" size="lg">
              Start {demoLabels[session.demoType] || 'Demo'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
