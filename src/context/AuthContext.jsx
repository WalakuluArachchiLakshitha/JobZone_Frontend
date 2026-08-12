/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const AuthContext = createContext(null);

const normalizeRole = (value) => {
  if (typeof value !== 'string') return 'candidate';

  const role = value.trim().toLowerCase();
  if (!role) return 'candidate';

  if (['candidate', 'jobseeker', 'job seeker', 'seeker', 'job-seeker'].includes(role)) {
    return 'candidate';
  }

  if (['employer', 'company', 'recruiter', 'hiring-manager', 'hiring_manager', 'hire'].includes(role)) {
    return 'employer';
  }

  return role;
};

const normalizeUserData = (userData) => {
  if (!userData) return null;

  const roleSource = userData.role || userData.userType || userData.accountType || userData.type || userData.userRole;
  return {
    ...userData,
    role: normalizeRole(roleSource),
  };
};

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
      const normalizedUser = normalizeUserData(userData);
      localStorage.setItem('jobzone_user', JSON.stringify(normalizedUser));
      localStorage.setItem('jobzoneUserRole', normalizedUser.role);
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
          const parsedUser = JSON.parse(storedUser);
          setUser(normalizeUserData(parsedUser));
        }
        
        try {
          // Fetch fresh profile from API
          const response = await userApi.getProfile();
          if (response.success && response.user) {
            const normalizedUser = normalizeUserData(response.user);
            setUser(normalizedUser);
            syncLocalStorage(storedToken, normalizedUser);
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
        const normalizedUser = normalizeUserData(response.user);
        setToken(response.token);
        setUser(normalizedUser);
        syncLocalStorage(response.token, normalizedUser);
        return { success: true, user: normalizedUser };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
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
        const normalizedUser = normalizeUserData(response.user);
        setToken(response.token);
        setUser(normalizedUser);
        syncLocalStorage(response.token, normalizedUser);
        return { success: true, user: normalizedUser };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
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

  const googleLogin = async (credential) => {
    setIsLoading(true);
    try {
      const response = await authApi.googleLogin(credential);
      if (response.success) {
        const normalizedUser = normalizeUserData(response.user);
        setToken(response.token);
        setUser(normalizedUser);
        syncLocalStorage(response.token, normalizedUser);
        return { success: true, user: normalizedUser };
      }
      return { success: false, message: response.message || 'Google login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'An error occurred during Google login' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData) => {
    if (!userData) return null;
    const normalizedUser = normalizeUserData(userData);
    setUser(normalizedUser);
    localStorage.setItem('jobzone_user', JSON.stringify(normalizedUser));
    localStorage.setItem('jobzoneUserRole', normalizedUser.role);
    return normalizedUser;
  };

  const refreshUser = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success && response.user) {
        return updateUser(response.user);
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
    googleLogin,
    refreshUser,
    updateUser,
    role: normalizeRole(user?.role || user?.userType || user?.accountType || user?.type || user?.userRole || localStorage.getItem('jobzoneUserRole') || 'candidate')
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
