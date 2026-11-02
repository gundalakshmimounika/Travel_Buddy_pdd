/**
 * TravelBuddy Web Frontend - API Configuration
 * Configures the unified backend API endpoint for all web frontend services.
 */
(function() {
  function detectBackendUrl() {
    // If explicitly configured in localStorage or window
    const storedUrl = localStorage.getItem('TRAVEL_BUDDY_API_BASE');
    if (storedUrl) return storedUrl.replace(/\/+$/, '');

    if (window.TRAVEL_BUDDY_API_BASE) {
      return window.TRAVEL_BUDDY_API_BASE.replace(/\/+$/, '');
    }

    // When served over HTTP/HTTPS (e.g. via XAMPP Apache, Nginx, or local dev server)
    if (window.location.protocol.startsWith('http')) {
      const pathname = window.location.pathname;
      const origin = window.location.origin;

      // Check if project is hosted under /TravelBuddy/ or /travelbuddy/
      if (/travelbuddy/i.test(pathname)) {
        return `${origin}/TravelBuddy/backend`;
      }
      
      // Default relative backend path on same host
      return `${origin}/backend`;
    }

    // Default fallback for file:/// execution or local XAMPP testing
    return 'http://localhost/TravelBuddy/backend';
  }

  window.API_BASE_URL = detectBackendUrl();
  console.log('[TravelBuddy] API Base URL configured:', window.API_BASE_URL);
})();
