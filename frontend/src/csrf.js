// Helper function to get CSRF token from backend
export async function getCsrfToken() {
    try {
      const response = await fetch('https://localhost:3001/csrf-token', {
        method: 'GET',
        credentials: 'include' // Important: Send cookies
      });
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return null;
    }
  }