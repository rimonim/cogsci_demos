import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Database,
  Activity,
  Settings,
  Download,
  Calendar,
  Copy,
  ExternalLink,
  Share
} from "lucide-react";
import { InstructorAuth } from '@/utils/instructorAuth';

export default function SessionManagement({ onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [bulkSelection, setBulkSelection] = useState(new Set());
  const [allSessions, setAllSessions] = useState([]);
  const [operations, setOperations] = useState({
    cleanup: { loading: false, result: null },
    bulk: { loading: false, result: null },
    quota: { loading: false, result: null }
  });

  useEffect(() => {
    loadSessions();
    loadQuotaInfo();
    performHealthCheck();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/session');
      if (response.ok) {
        const data = await response.json();
        setAllSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuotaInfo = async () => {
    try {
      setOperations(prev => ({ ...prev, quota: { loading: true, result: null } }));
      const response = await fetch('/api/session-management', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...InstructorAuth.getAuthHeaders()
        },
        body: JSON.stringify({ action: 'storage-quota', options: { detailed: true } })
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuotaInfo(data.quota);
        setOperations(prev => ({ ...prev, quota: { loading: false, result: data } }));
      } else if (response.status === 401) {
        // Handle authentication error
        InstructorAuth.logout();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error loading quota info:', error);
      setOperations(prev => ({ ...prev, quota: { loading: false, result: { error: error.message } } }));
    }
  };

  const performHealthCheck = async () => {
    try {
      const response = await makeAuthenticatedRequest('health-check');
      if (response?.ok) {
        const data = await response.json();
        setHealthInfo(data.health);
      }
    } catch (error) {
      console.error('Error performing health check:', error);
    }
  };

  const cleanupExpiredSessions = async (dryRun = true) => {
    try {
      setOperations(prev => ({ ...prev, cleanup: { loading: true, result: null } }));
      
      const response = await makeAuthenticatedRequest('cleanup-expired', { dryRun, maxAge: 48 });
      
      if (response?.ok) {
        const result = await response.json();
        setOperations(prev => ({ ...prev, cleanup: { loading: false, result } }));
        
        if (!dryRun) {
          // Refresh sessions list and quota info
          loadSessions();
          loadQuotaInfo();
          onRefresh?.();
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      setOperations(prev => ({ 
        ...prev, 
        cleanup: { loading: false, result: { error: error.message } } 
      }));
    }
  };

  const bulkDeleteSessions = async () => {
    if (bulkSelection.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${bulkSelection.size} sessions? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setOperations(prev => ({ ...prev, bulk: { loading: true, result: null } }));
      
      const response = await fetch('/api/session-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'bulk-delete', 
          options: { 
            sessionIds: Array.from(bulkSelection),
            confirmKey: 'CONFIRM_BULK_DELETE'
          } 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setOperations(prev => ({ ...prev, bulk: { loading: false, result } }));
        setBulkSelection(new Set());
        
        // Refresh sessions list and quota info
        loadSessions();
        loadQuotaInfo();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error during bulk delete:', error);
      setOperations(prev => ({ 
        ...prev, 
        bulk: { loading: false, result: { error: error.message } } 
      }));
    }
  };

  const toggleSessionSelection = (sessionId) => {
    setBulkSelection(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(sessionId)) {
        newSelection.delete(sessionId);
      } else {
        newSelection.add(sessionId);
      }
      return newSelection;
    });
  };

  const selectAllExpired = () => {
    const expiredSessionIds = allSessions
      .filter(session => session.isExpired)
      .map(session => session.sessionId);
    setBulkSelection(new Set(expiredSessionIds));
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  const expiredCount = allSessions.filter(s => s.isExpired).length;

  const downloadSessionData = async (sessionId) => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Convert to CSV format
        const csvData = convertToCSV(data.results);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `session_${sessionId}_data.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading session data:', error);
      alert('Failed to download session data');
    }
  };

  const copySessionURL = (sessionId) => {
    const sessionUrl = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(sessionUrl).then(() => {
      alert('Session URL copied to clipboard!');
    }).catch((error) => {
      console.error('Failed to copy URL:', error);
      // Fallback: show URL in prompt
      prompt('Copy this session URL:', sessionUrl);
    });
  };

  const convertToCSV = (results) => {
    if (!results || results.length === 0) {
      return 'No data available';
    }
    
    // Get all unique keys from all result objects
    const allKeys = new Set();
    results.forEach(result => {
      Object.keys(result).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    const csvRows = [headers.join(',')];
    
    results.forEach(result => {
      const row = headers.map(header => {
        const value = result[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  // Helper function to make authenticated requests to session management API
  const makeAuthenticatedRequest = async (action, options = {}) => {
    if (!InstructorAuth.isAuthenticated()) {
      alert('Session expired. Please log in again.');
      window.location.href = '/login';
      return null;
    }

    try {
      const response = await fetch('/api/session-management', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...InstructorAuth.getAuthHeaders()
        },
        body: JSON.stringify({ action, options })
      });

      if (response.status === 401) {
        InstructorAuth.logout();
        window.location.href = '/login';
        return null;
      }

      return response;
    } catch (error) {
      console.error(`Error in ${action} request:`, error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Session Management</h2>
        <Button onClick={() => { loadSessions(); loadQuotaInfo(); performHealthCheck(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Health and Quota Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {healthInfo && getHealthStatusIcon(quotaInfo?.health_status)}
          </CardHeader>
          <CardContent>
            {healthInfo ? (
              <div className="space-y-2">
                <div className={getHealthStatusColor(quotaInfo?.health_status)}>
                  <span className="font-semibold">
                    {quotaInfo?.health_status || 'Unknown'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Response: {healthInfo.estimated_response_time}ms
                </div>
                {healthInfo.sample_operations_working && (
                  <Badge variant="outline" className="text-green-600">
                    KV Operations Working
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {quotaInfo ? (
              <div className="space-y-2">
                <div className="font-semibold">
                  {formatBytes(quotaInfo.estimated_usage.estimated_storage_bytes)}
                </div>
                <div className="text-xs text-gray-600">
                  {quotaInfo.estimated_usage.total_keys} keys total
                </div>
                <div className="text-xs text-gray-600">
                  {quotaInfo.estimated_usage.student_count} students, {quotaInfo.estimated_usage.session_count} sessions
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Session Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold">{allSessions.length} Total</div>
              {expiredCount > 0 && (
                <Badge variant="destructive">{expiredCount} Expired</Badge>
              )}
              <div className="text-xs text-gray-600">
                {bulkSelection.size} selected
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expired Session Cleanup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Expired Session Cleanup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Remove sessions older than 48 hours to free up storage space.
            </p>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => cleanupExpiredSessions(true)}
                disabled={operations.cleanup.loading}
              >
                {operations.cleanup.loading ? 'Checking...' : 'Preview Cleanup'}
              </Button>
              
              {operations.cleanup.result && !operations.cleanup.result.error && (
                <div className="space-y-2">
                  <div className="text-sm">
                    Found {operations.cleanup.result.stats?.sessionsExpired || 0} expired sessions
                  </div>
                  
                  {operations.cleanup.result.stats?.sessionsExpired > 0 && (
                    <Button 
                      variant="destructive" 
                      onClick={() => cleanupExpiredSessions(false)}
                      disabled={operations.cleanup.loading}
                    >
                      Delete {operations.cleanup.result.stats.sessionsExpired} Expired Sessions
                    </Button>
                  )}
                </div>
              )}

              {operations.cleanup.result?.error && (
                <div className="text-sm text-red-600">
                  Error: {operations.cleanup.result.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Bulk Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Select multiple sessions for bulk operations.
            </p>
            
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllExpired}
                  disabled={expiredCount === 0}
                >
                  Select All Expired ({expiredCount})
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBulkSelection(new Set())}
                  disabled={bulkSelection.size === 0}
                >
                  Clear Selection
                </Button>
              </div>
              
              {bulkSelection.size > 0 && (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Bulk download selected sessions
                      Array.from(bulkSelection).forEach(sessionId => {
                        setTimeout(() => downloadSessionData(sessionId), 100);
                      });
                    }}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Selected ({bulkSelection.size})
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={bulkDeleteSessions}
                    disabled={operations.bulk.loading}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {operations.bulk.loading ? 'Deleting...' : `Delete Selected (${bulkSelection.size})`}
                  </Button>
                </div>
              )}

              {operations.bulk.result?.error && (
                <div className="text-sm text-red-600">
                  Error: {operations.bulk.result.error}
                </div>
              )}

              {operations.bulk.result?.stats && (
                <div className="text-sm text-green-600">
                  Deleted {operations.bulk.result.stats.sessionsDeleted} sessions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session List for Bulk Selection */}
      {allSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Session List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allSessions.map(session => (
                <div 
                  key={session.sessionId}
                  className={`flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    bulkSelection.has(session.sessionId) ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={() => toggleSessionSelection(session.sessionId)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{session.sessionId}</span>
                      {session.isExpired && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      <Badge variant="outline">{session.demoType}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.instructorName} • {session.participantCount} participants
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(session.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Action buttons */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        copySessionURL(session.sessionId);
                      }}
                      className="h-8 w-8 p-0"
                      title="Copy session URL"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSessionData(session.sessionId);
                      }}
                      className="h-8 w-8 p-0"
                      title="Download session data"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/results?session=${session.sessionId}`;
                      }}
                      className="h-8 w-8 p-0"
                      title="View session results"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <input
                      type="checkbox"
                      checked={bulkSelection.has(session.sessionId)}
                      onChange={() => toggleSessionSelection(session.sessionId)}
                      className="ml-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {quotaInfo?.recommendations && quotaInfo.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {quotaInfo.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
