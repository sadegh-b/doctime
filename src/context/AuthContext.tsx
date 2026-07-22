import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  getRole,
  getStoredUser,
  logout as logoutService,
  getMe,
  type AuthUser,
  type UserRole,
} from "../services/auth";

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [role, setRole] = useState<UserRole | null>(() => getRole());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    const token = getAccessToken();
    const currentRole = getRole();

    if (!token || !currentRole) {
      setUser(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const freshUser = await getMe();
      setUser(freshUser);
      setRole(freshUser.role);
    } catch (error: any) {
      console.error("Auth check failed:", error);

      // اگر خطای شبکه یا تایم‌اوت بود، اطلاعات لوکال استوریج را حفظ کن تا کاربر بیهوده بیرون انداخته نشود.
      // اما اگر خطای احراز هویت (401 یا 403) بود، کاربر را خارج کن.
      const isAuthError =
        error?.message?.includes("401") ||
        error?.message?.includes("403") ||
        (error?.response && (error.response.status === 401 || error.response.status === 403));

      if (isAuthError) {
        logoutService();
        setUser(null);
        setRole(null);
      } else {
        setUser(getStoredUser());
        setRole(getRole());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();

    const handleAuthChange = () => {
      setUser(getStoredUser());
      setRole(getRole());
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [checkAuth]);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    setRole(null);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await getMe();
      setUser(freshUser);
      setRole(freshUser.role);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  }, []);

  const isAuthenticated = Boolean(getAccessToken() && role);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      isAuthenticated,
      isLoading,
      logout,
      refreshUser,
    }),
    [user, role, isAuthenticated, isLoading, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
