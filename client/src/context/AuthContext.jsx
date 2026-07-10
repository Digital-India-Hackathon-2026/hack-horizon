import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [farmer, setFarmer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('agriqueue_token');
    const savedFarmer = localStorage.getItem('agriqueue_farmer');
    if (savedToken && savedFarmer) {
      setToken(savedToken);
      setFarmer(JSON.parse(savedFarmer));
    }
    setLoading(false);
  }, []);

  const login = async (mobile) => {
    const res = await api.post('/auth/login', { mobile });
    return res.data;
  };

  const verifyOtp = async (mobile, otp) => {
    const res = await api.post('/auth/verify-otp', { mobile, otp });
    if (res.data.success) {
      setToken(res.data.token);
      setFarmer(res.data.farmer);
      localStorage.setItem('agriqueue_token', res.data.token);
      localStorage.setItem('agriqueue_farmer', JSON.stringify(res.data.farmer));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setFarmer(null);
    localStorage.removeItem('agriqueue_token');
    localStorage.removeItem('agriqueue_farmer');
  };

  const updateFarmer = (data) => {
    setFarmer(data);
    localStorage.setItem('agriqueue_farmer', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ farmer, token, loading, login, verifyOtp, logout, updateFarmer, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
