import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncLocalStorage = (jwtToken, userData) => {
    if (jwtToken) {
      localStorage.setItem('jobzone_token', jwtToken);
      localStorage.setItem('jobzoneLoggedIn', 'true');
    } else {
      localStorage.removeItem('jobzone_token');
      localStorage.removeItem('jobzoneLoggedIn');
    }

    if (userData) {
      localStorage.setItem('jobzone_user', JSON.stringify(userData));
      // Map back seeker to candidate for frontend role compatibility
      const feRole = userData.role === 'seeker' ? 'candidate' : userData.role;
      localStorage.setItem('jobzoneUserRole', feRole);
    } else {
      localStorage.removeItem('jobzone_user');
      localStorage.removeItem('jobzoneUserRole');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('jobzone_token');
      const storedUser = localStorage.getItem('jobzone_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        try {
          // Fetch fresh profile from API
          const response = await userApi.getProfile();
          if (response.success && response.user) {
            setUser(response.user);
            syncLocalStorage(storedToken, response.user);
          }
        } catch (error) {
          console.error('Failed to validate token/get profile:', error);
          // Token expired or invalid
          setToken(null);
          setUser(null);
          syncLocalStorage(null, null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        syncLocalStorage(response.token, response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: error.message || 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        syncLocalStorage(response.token, response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: error.message || 'An error occurred during registration' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    syncLocalStorage(null, null);
  };

  const refreshUser = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('jobzone_user', JSON.stringify(response.user));
        return response.user;
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
    return null;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    role: user?.role === 'seeker' ? 'candidate' : user?.role || 'candidate'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
