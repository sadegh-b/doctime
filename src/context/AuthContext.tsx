import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  getToken,
} from "../services/auth";
import {
  getMyProfile,
  type CurrentUserProfile,
} from "../services/profile";

interface AuthContextType {
  user: CurrentUserProfile | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const currentToken = getToken();

    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const profile = await getMyProfile();
      setUser(profile);
      setToken(currentToken);
    } catch (error) {
      logoutRequest();
      setUser(null);
      setToken(null);
      throw error;
    }
  }

  useEffect(() => {
    refreshUser()
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (phone: string, password: string) => {
    await loginRequest(phone, password);

    const currentToken = getToken();
    setToken(currentToken);

    const profile = await getMyProfile();
    setUser(profile);
  };

  const logout = () => {
    logoutRequest();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}