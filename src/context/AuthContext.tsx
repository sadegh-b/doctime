import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthUser, AuthResponse } from "../services/auth";
import {
  getUser,
  isAuthenticated as checkAuth,
  logout as performLogout,
  saveAuthData,
  setStoredUser,
} from "../services/auth";

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  syncAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const syncAuth = useCallback(() => {
    const storedUser = getUser();
    const authenticated = checkAuth();

    setUser(authenticated ? storedUser : null);
    setIsAuthenticated(authenticated);

    if (!authenticated && storedUser) {
      performLogout();
    }
  }, []);

  useEffect(() => {
    try {
      syncAuth();
    } catch (error) {
      console.error("Error loading auth data from storage:", error);
      performLogout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }

    const handleAuthChange = () => {
      syncAuth();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "access_token" ||
        event.key === "user" ||
        event.key === "role" ||
        event.key === null
      ) {
        syncAuth();
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [syncAuth]);

  const login = useCallback((userData: AuthUser, token: string) => {
    const authData: AuthResponse = {
      access_token: token,
      token_type: "bearer",
      user: userData,
    };

    saveAuthData(authData);
    syncAuth();
  }, [syncAuth]);

  const logout = useCallback(() => {
    performLogout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: AuthUser) => {
    setStoredUser(userData);
    syncAuth();
  }, [syncAuth]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      updateUser,
      syncAuth,
    }),
    [user, isAuthenticated, isLoading, login, logout, updateUser, syncAuth],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
