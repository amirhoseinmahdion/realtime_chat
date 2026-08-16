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

import { ApiError, apiRequest } from "@/lib/api";
import type { AuthResponse, User } from "@/types/auth";

const tokenKey = "echoline:auth-token:v1";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (input: { username: string; password: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
  authorizedRequest: <T>(path: string, options?: RequestInit) => Promise<T>;
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

  const authorizedRequest = useCallback(async <T,>(path: string, options: RequestInit = {}) => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      setUser(null);
      throw new ApiError("Your session has expired. Please sign in again.", 401, "UNAUTHORIZED");
    }

    try {
      return await apiRequest<T>(path, options, token);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem(tokenKey);
        setUser(null);
      }
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout, authorizedRequest }),
    [user, isLoading, login, signup, logout, authorizedRequest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
