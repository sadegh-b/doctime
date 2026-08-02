import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getRole,
  getUser,
  isAuthenticated,
  logout as serviceLogout,
  saveAuthData,
} from "../services/auth";

import type { AuthUser, UserRole } from "../services/auth";

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  authenticated: boolean;
  loading: boolean;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const resetAuthState = useCallback(() => {
    setUser(null);
    setRole(null);
    setAuthenticated(false);
  }, []);

  const syncAuthState = useCallback(() => {
    if (!isAuthenticated()) {
      resetAuthState();
      setLoading(false);
      return;
    }

    const storedUser = getUser();
    const storedRole = getRole();

    if (!storedUser || !storedRole || storedUser.role !== storedRole) {
      serviceLogout();
      resetAuthState();
      setLoading(false);
      return;
    }

    setUser(storedUser);
    setRole(storedRole);
    setAuthenticated(true);
    setLoading(false);
  }, [resetAuthState]);

  useEffect(() => {
    syncAuthState();

    window.addEventListener("auth-change", syncAuthState);

    return () => {
      window.removeEventListener("auth-change", syncAuthState);
    };
  }, [syncAuthState]);

  const login = useCallback((userData: AuthUser, token: string) => {
    saveAuthData({
      access_token: token,
      token_type: "bearer",
      user: userData,
    });

    setUser(userData);
    setRole(userData.role);
    setAuthenticated(true);

    window.dispatchEvent(new Event("auth-change"));
  }, []);

  const logout = useCallback(() => {
    serviceLogout();
    resetAuthState();
    window.dispatchEvent(new Event("auth-change"));
  }, [resetAuthState]);

  const refreshUser = useCallback(() => {
    syncAuthState();
  }, [syncAuthState]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      authenticated,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, role, authenticated, loading, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}