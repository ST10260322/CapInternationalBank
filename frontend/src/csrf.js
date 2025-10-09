let csrfToken = null; // Store token in memory
let isInitializing = false; // Prevent duplicate calls

// Fetch and store CSRF token
export async function initializeCsrfToken() {
  // If already initialized or currently initializing, return existing token
  if (csrfToken || isInitializing) {
    console.log('CSRF token already exists:', csrfToken);
    return csrfToken;
  }

  isInitializing = true;

  try {
    const response = await fetch('https://localhost:3001/csrf-token', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    csrfToken = data.csrfToken; // Store it in memory
    console.log('CSRF token initialized:', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('Error initializing CSRF token:', error);
    return null;
  } finally {
    isInitializing = false;
  }
}

// Get the stored token
export function getCsrfToken() {
  if (!csrfToken) {
    console.error('No CSRF token available! Call initializeCsrfToken() first.');
  }
  return csrfToken;
}