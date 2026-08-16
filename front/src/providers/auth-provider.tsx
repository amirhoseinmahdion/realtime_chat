"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiRequest } from "@/lib/api";
import type { AuthResponse, User } from "@/types/auth";

const tokenKey = "echoline:auth-token:v1";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (input: { username: string; password: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(tokenKey, response.token);
    setUser(response.user);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    apiRequest<{ user: User }>("/api/auth/me", {}, token)
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem(tokenKey))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      saveSession(response);
    },
    [saveSession],
  );

  const signup = useCallback(
    async (input: { username: string; password: string; displayName: string }) => {
      const response = await apiRequest<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
      });
      saveSession(response);
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem(tokenKey);
    try {
      if (token) await apiRequest<void>("/api/auth/logout", { method: "POST" }, token);
    } finally {
      localStorage.removeItem(tokenKey);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
