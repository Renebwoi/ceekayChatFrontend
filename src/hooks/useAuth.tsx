import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/api';
import { authApi } from '../api/authApi';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'chatroomx_token';
const USER_KEY = 'chatroomx_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const login = async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload);
    handleAuthSuccess(data);
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await authApi.register(payload);
    handleAuthSuccess(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, login, register, logout }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
