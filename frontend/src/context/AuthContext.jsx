import { createContext, useState, useEffect } from 'react';
import { apiRequest, getTokens, saveTokens, clearTokens } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const tokens = getTokens();
      if (tokens?.access) {
        await fetchProfile();
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to global logout event from API interceptor
    const handleGlobalLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth_logout', handleGlobalLogout);
    return () => window.removeEventListener('auth_logout', handleGlobalLogout);
  }, []);

  const fetchProfile = async () => {
    const res = await apiRequest('/auth/profile/');
    if (res.success) {
      setUser(res.data);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      clearTokens();
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    const res = await apiRequest('/auth/login/', {
      method: 'POST',
      body: { email, password },
    });

    if (res.success) {
      saveTokens(res.data.tokens);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true, message: res.message };
    } else {
      setLoading(false);
      return { success: false, message: res.message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    const res = await apiRequest('/auth/register/', {
      method: 'POST',
      body: userData,
    });
    if (res.success) {
      saveTokens(res.data.tokens);
      setUser(res.data.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  const logout = async () => {
    setLoading(true);
    const tokens = getTokens();
    if (tokens?.refresh) {
      // Graceful logout on backend
      await apiRequest('/auth/logout/', {
        method: 'POST',
        body: { refresh: tokens.refresh },
      });
    }
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const updateProfile = async (formData) => {
    setLoading(true);
    const res = await apiRequest('/auth/profile/', {
      method: 'PUT',
      body: formData, // passing FormData directly
    });
    if (res.success) {
      setUser(res.data);
    }
    setLoading(false);
    return res;
  };

  const changePassword = async (payload) => {
    return await apiRequest('/auth/change-password/', {
      method: 'POST',
      body: payload,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
