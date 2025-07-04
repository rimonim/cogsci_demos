// Session context utility for managing session data across the app

export class SessionContext {
  static setSessionData(sessionData) {
    window.sessionData = sessionData;
    // Also store in sessionStorage for persistence across refreshes
    sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
  }

  static getSessionData() {
    // Try window first, then fall back to sessionStorage
    if (window.sessionData) {
      return window.sessionData;
    }
    
    const stored = sessionStorage.getItem('currentSession');
    if (stored) {
      const sessionData = JSON.parse(stored);
      window.sessionData = sessionData;
      return sessionData;
    }
    
    return null;
  }

  static getSessionId() {
    const sessionData = this.getSessionData();
    return sessionData?.sessionId || null;
  }

  static getStudentInfo() {
    const sessionData = this.getSessionData();
    return sessionData?.studentInfo || null;
  }

  static isInSession() {
    return this.getSessionId() !== null;
  }

  static clearSession() {
    window.sessionData = null;
    sessionStorage.removeItem('currentSession');
  }

  // Get session info from URL params (for session-based navigation)
  static getSessionFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session');
  }

  // Add session data to result payload
  static enrichResultData(resultData) {
    const sessionData = this.getSessionData();
    
    if (sessionData) {
      return {
        ...resultData,
        session_id: sessionData.sessionId,
        student_name: sessionData.studentInfo?.name,
        student_id: sessionData.studentInfo?.studentId,
        share_data: sessionData.studentInfo?.shareData,
        timestamp: new Date().toISOString()
      };
    }

    // If no session, still add timestamp but mark as individual submission
    return {
      ...resultData,
      session_id: null,
      timestamp: new Date().toISOString()
    };
  }
}
