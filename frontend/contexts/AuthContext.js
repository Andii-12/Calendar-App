import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set up API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      // Check if we're on the client side
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        console.log('Stored token:', storedToken ? 'exists' : 'not found');
        
        if (storedToken) {
          setToken(storedToken);
          // Set axios header immediately
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          try {
            console.log('Making auth check request...');
            const response = await axios.get('/api/auth/me');
            console.log('Auth response:', response.data);
            
            if (response.data && response.data._id) {
              setUser(response.data);
              console.log('User authenticated successfully');
            } else {
              throw new Error('Invalid user data');
            }
          } catch (error) {
            console.error('Auth check failed:', error);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
            }
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
          }
        } else {
          console.log('No stored token found');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Force re-check authentication when token changes
  useEffect(() => {
    if (token && !user) {
      const checkUser = async () => {
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data && response.data._id) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Token exists but user check failed:', error);
        }
      };
      checkUser();
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
      }
      
      // Set axios header immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
      }
      
      // Set axios header immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
