
import { useEffect, useState } from "react";
import AuthContext from "./AuthContextValue";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://nobroker-backend-iroo.onrender.com").replace(/\/$/, "");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    console.log("AuthContext is running");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log(
          "User profile request failed:",
          response.status
        );

        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();

      console.log("Logged-in user:", data);

      // /me/ returns the user inside the "user" field
      setUser(data.user);
    } catch (error) {
      console.error("Error loading current user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      console.log("AuthContext is running");

      const token = localStorage.getItem("access_token");

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/me/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.log(
            "User profile request failed:",
            response.status
          );

          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = await response.json();

        console.log("Logged-in user:", data);

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error loading current user:", error);

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
