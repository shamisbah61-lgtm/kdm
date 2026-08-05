const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Retrieves the stored authentication tokens.
 */
export const getTokens = () => {
  const tokens = localStorage.getItem('maramcraft_tokens');
  return tokens ? JSON.parse(tokens) : null;
};

/**
 * Saves authentication tokens.
 */
export const saveTokens = (tokens) => {
  localStorage.setItem('maramcraft_tokens', JSON.stringify(tokens));
};

/**
 * Deletes authentication tokens.
 */
export const clearTokens = () => {
  localStorage.removeItem('maramcraft_tokens');
};

/**
 * Helper to call refresh token endpoint.
 */
const performTokenRefresh = async (refresh) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data.access;
      }
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
  return null;
};

/**
 * Custom fetch wrapper to handle JSON payloads, Form-data uploads,
 * auth headers, and automatic token refreshes.
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set up default headers
  const headers = { ...options.headers };
  const tokens = getTokens();

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  // Determine body content-type
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const fetchOptions = {
    ...options,
    headers,
    body,
  };

  try {
    let response = await fetch(url, fetchOptions);

    // Auto-refresh token if unauthorized (401)
    if (response.status === 401 && tokens?.refresh) {
      const newAccess = await performTokenRefresh(tokens.refresh);
      if (newAccess) {
        // Save new access token
        const updatedTokens = { ...tokens, access: newAccess };
        saveTokens(updatedTokens);

        // Retry initial request
        fetchOptions.headers['Authorization'] = `Bearer ${newAccess}`;
        response = await fetch(url, fetchOptions);
      } else {
        // Refresh token failed, clear tokens (logout)
        clearTokens();
        window.dispatchEvent(new Event('auth_logout'));
      }
    }

    const data = await response.json();
    return {
      ok: response.ok,
      status: response.status,
      success: data.success,
      message: data.message || (response.ok ? 'Success' : 'Error'),
      data: data.data || {},
    };
  } catch (error) {
    console.error(`API Request to ${endpoint} failed:`, error);
    return {
      ok: false,
      status: 500,
      success: false,
      message: 'Network error. Please check your connection.',
      data: {},
    };
  }
};
