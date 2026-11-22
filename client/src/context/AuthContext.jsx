import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nearfix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [providerProfile, setProviderProfile] = useState(() => {
    const saved = localStorage.getItem('nearfix_provider_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nearfix_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          if (res.data.providerProfile) {
            setProviderProfile(res.data.providerProfile);
            localStorage.setItem('nearfix_provider_profile', JSON.stringify(res.data.providerProfile));
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData, providerProfile: profile } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('nearfix_token', jwtToken);
    localStorage.setItem('nearfix_user', JSON.stringify(userData));
    if (profile) {
      setProviderProfile(profile);
      localStorage.setItem('nearfix_provider_profile', JSON.stringify(profile));
    }
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: jwtToken, user: userData, providerProfile: profile } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('nearfix_token', jwtToken);
    localStorage.setItem('nearfix_user', JSON.stringify(userData));
    if (profile) {
      setProviderProfile(profile);
      localStorage.setItem('nearfix_provider_profile', JSON.stringify(profile));
    }
    return userData;
  };

  const logout = () => {
    setUser(null);
    setProviderProfile(null);
    setToken(null);
    localStorage.removeItem('nearfix_token');
    localStorage.removeItem('nearfix_user');
    localStorage.removeItem('nearfix_provider_profile');
  };

  const updateCurrentUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('nearfix_user', JSON.stringify(merged));
      return merged;
    });
  };

  const updateProviderData = (profile) => {
    setProviderProfile(profile);
    localStorage.setItem('nearfix_provider_profile', JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        token,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
        updateProviderData,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isProvider: user?.role === 'provider',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
