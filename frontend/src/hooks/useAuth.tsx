import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  sub: string;
  name?: string;
  email?: string;
  preferred_username?: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok?: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (username: string, oldPassword: string, newPassword: string) => Promise<{ ok?: boolean; error?: string }>;
  forgotPassword: (username: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<{ ok?: boolean; autoLogin?: boolean; error?: string }>;
  fetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

const api = (path: string, body?: object) =>
  fetch(path, {
    method: body ? "POST" : "GET",
    credentials: "include",
    ...(body && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  }).then((r) => r.json());

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMe = async () => {
    try {
      const data = await api("/auth/me");
      if (data.authenticated) setUser(data.user);
      else setUser(null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api("/auth/login", { username, password });
    if (data.ok) {
      await fetchMe();
      navigate("/");
    }
    return data;
  };

  const logout = async () => {
    await api("/auth/logout", {});
    setUser(null);
    navigate("/login");
  };

  const changePassword = async (username: string, oldPassword: string, newPassword: string) => {
    const data = await api("/auth/change-password", { username, oldPassword, newPassword });
    if (data.ok) {
      await fetchMe();
      navigate("/");
    }
    return data;
  };

  const forgotPassword = async (username: string) => {
    await api("/auth/forgot-password", { username });
  };

  const resetPassword = async (code: string, newPassword: string) => {
    const data = await api("/auth/reset-password", { code, newPassword });
    if (data.ok && data.autoLogin) {
      await fetchMe();
      navigate("/");
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changePassword, forgotPassword, resetPassword, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}
