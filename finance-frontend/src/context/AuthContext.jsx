import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set default authorization header for all requests
    updateAxiosAuthHeader();
    
    // Check if user is stored in localStorage on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    // We're only running this once on mount, so no dependencies needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAxiosAuthHeader = (email, password) => {
    // For the demo, we'll use admin credentials for API access
    // In a real app, you would use the user's credentials or a token
    axiosInstance.defaults.headers.common['Authorization'] = 
      'Basic ' + btoa('admin:admin');
  };

  const login = async (email, password) => {
    setError(null);
    try {
      // Make sure we have the admin credentials set for API access
      updateAxiosAuthHeader();
      
      // Since we don't have a dedicated login endpoint, we'll get all users and find a match
      const response = await axiosInstance.get('/api/users');
      const users = response.data;
      
      // Find user with matching email
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // In a real app, we would verify the password on the server
      // For now, we'll just assume the password is correct
      
      setCurrentUser(user);
      
      // Store user in localStorage (excluding sensitive info)
      const userToStore = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
      throw error;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      // Make sure we have the admin credentials set for API access
      updateAxiosAuthHeader();
      
      const response = await axiosInstance.post('/api/users', {
        name,
        email,
        password,
        createdAt: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    // Reset and then set default axios authorization header
    updateAxiosAuthHeader();
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};