import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        setError(null);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', userData);
      
      if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        setError(null);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerClinic = async (clinicData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register-clinic', clinicData);
      
      if (res.data?.data) {
        localStorage.setItem('user', JSON.stringify(res.data.data));
        setUser(res.data.data);
        setError(null);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Clinic registration failed');
      throw err; // throw to be caught by the component
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        registerClinic,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
