// Authentication utility for instructor access
// Uses environment variables to keep passwords secure

export class InstructorAuth {
  static AUTH_KEY = 'instructor_authenticated';
  static AUTH_TIMESTAMP_KEY = 'instructor_auth_timestamp';
  static SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  // Check if currently authenticated
  static isAuthenticated() {
    try {
      const isAuth = sessionStorage.getItem(this.AUTH_KEY) === 'true';
      const timestamp = parseInt(sessionStorage.getItem(this.AUTH_TIMESTAMP_KEY) || '0');
      const now = Date.now();
      
      // Check if session has expired
      if (isAuth && (now - timestamp) < this.SESSION_DURATION) {
        return true;
      } else if (isAuth) {
        // Session expired, clear it
        this.logout();
      }
      
      return false;
    } catch (error) {
      console.warn('Error checking authentication:', error);
      return false;
    }
  }

  // Authenticate with password
  static async authenticate(password) {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'login' })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          sessionStorage.setItem(this.AUTH_KEY, 'true');
          sessionStorage.setItem(this.AUTH_TIMESTAMP_KEY, Date.now().toString());
          return { success: true };
        } else {
          return { success: false, error: result.error || 'Invalid password' };
        }
      } else {
        return { success: false, error: 'Authentication server error' };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Network error during authentication' };
    }
  }

  // Logout and clear session
  static logout() {
    try {
      sessionStorage.removeItem(this.AUTH_KEY);
      sessionStorage.removeItem(this.AUTH_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('Error during logout:', error);
    }
  }

  // Get authentication headers for API calls
  static getAuthHeaders() {
    if (this.isAuthenticated()) {
      return {
        'Authorization': 'Instructor-Session',
        'X-Auth-Timestamp': sessionStorage.getItem(this.AUTH_TIMESTAMP_KEY) || ''
      };
    }
    return {};
  }

  // Require authentication - redirect to login if not authenticated
  static requireAuth(redirectTo = '/login') {
    if (!this.isAuthenticated()) {
      // Store the intended destination
      sessionStorage.setItem('auth_redirect', window.location.pathname + window.location.search);
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  // Get redirect destination after successful login
  static getPostLoginRedirect() {
    const redirect = sessionStorage.getItem('auth_redirect');
    if (redirect) {
      sessionStorage.removeItem('auth_redirect');
      return redirect;
    }
    return '/sessions'; // Default to sessions page
  }

  // Check if session is about to expire (within 30 minutes)
  static isSessionNearExpiry() {
    try {
      const timestamp = parseInt(sessionStorage.getItem(this.AUTH_TIMESTAMP_KEY) || '0');
      const now = Date.now();
      const timeRemaining = this.SESSION_DURATION - (now - timestamp);
      
      return timeRemaining < (30 * 60 * 1000); // 30 minutes
    } catch (error) {
      return false;
    }
  }

  // Refresh session (extend expiry)
  static refreshSession() {
    if (this.isAuthenticated()) {
      sessionStorage.setItem(this.AUTH_TIMESTAMP_KEY, Date.now().toString());
    }
  }
}
