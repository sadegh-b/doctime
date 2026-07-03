// مسیر: src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../services/api";

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get("/api/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string) => {
    const formData = new URLSearchParams();
    formData.set("username", phone);
    formData.set("password", password);

    const res = await api.post("/api/auth/login", formData);
    const access_token = res.data.access_token;
    localStorage.setItem("token", access_token);
    setToken(access_token);

    const me = await api.get("/api/auth/me");
    setUser(me.data);
  };

  const register = async (name: string, phone: string, password: string) => {
    await api.post("/api/auth/register", { name, phone, password });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
