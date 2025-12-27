import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      // Set user immediately from localStorage for faster UI update
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData._id) {
          setUser(userData);
          setLoading(false);
          // Load fresh user data in background without blocking
          loadUser().catch(() => {
            // Silently fail - user is already set from localStorage
          });
        } else {
          // If stored user is invalid, try to load fresh
          loadUser();
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
        // If parsing fails, try to load fresh
        loadUser();
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/me");
      const userData = response.data.data || response.data;
      if (userData && userData._id) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      // Only clear if it's a real auth error, not a network error
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/auth/register", userData);
      const { token, ...userInfo } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userInfo } = response.data;
      
      if (!token) {
        throw new Error("No token received from server");
      }
      
      if (!userInfo || !userInfo._id) {
        throw new Error("Invalid user data received");
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);
      setLoading(false);
      
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed. Please try again.";
      setError(message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

