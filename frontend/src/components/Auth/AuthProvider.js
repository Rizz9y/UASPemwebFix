import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../api/api";

// Create a Context for authentication
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data (id, username, role)
  const [loading, setLoading] = useState(true); // Tracks initial loading state (checking local storage)

  // Memoize logout function to prevent unnecessary re-renders
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // The App.js's PrivateRoute or InitialRedirect handles navigation after logout
  }, []);

  useEffect(() => {
    const loadUserFromStorage = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const decodedToken = jwtDecode(token);
          // Check if token is expired
          if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("Authentication token expired during initial load.");
            logout(); // Clear expired token and user data
          } else {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error(
            "Error decoding token or parsing user data from localStorage:",
            error
          );
          logout(); // Treat as invalid token (e.g., malformed)
        }
      }
      setLoading(false); // Set loading to false once check is complete
    };

    loadUserFromStorage();
  }, [logout]); // Depend on logout to ensure it's stable

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const { token, id, username: uname, role } = response.data;
      const userData = { id, username: uname, role };

      // Store token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData); // Update React state
      return { success: true };
    } catch (error) {
      console.error(
        "Login API error:",
        error.response?.data?.message || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // The value provided to consumers of this context
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user, // Convenience boolean for easy check
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This check ensures useAuth is only used within an AuthProvider
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
