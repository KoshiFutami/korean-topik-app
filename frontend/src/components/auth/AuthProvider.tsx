"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api/http";
import { loginUser, logoutUser, me as meApi, registerUser, updateMyProfile as updateMyProfileApi, updateProfileImagePosition as updateProfileImagePositionApi, uploadProfileImage as uploadProfileImageApi, type User } from "@/lib/api/auth";

type AuthState =
  | { status: "loading"; token: string | null; user: User | null }
  | { status: "authed"; token: string; user: User }
  | { status: "guest"; token: null; user: null };

type AuthContextValue = {
  state: AuthState;
  register: (input: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfile: (input: {
    name: string;
    nickname?: string | null;
    email: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
  }) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  updateProfileImagePosition: (offsetX: number, offsetY: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "topik.auth.token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    status: "loading",
    token: null,
    user: null,
  });

  const refreshMe = useCallback(async () => {
    const token =
      typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState({ status: "guest", token: null, user: null });
      return;
    }

    try {
      const res = await meApi(token);
      setState({ status: "authed", token, user: res.user });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 419)) {
        window.localStorage.removeItem(TOKEN_KEY);
        setState({ status: "guest", token: null, user: null });
        return;
      }
      throw e;
    }
  }, []);

  useEffect(() => {
    refreshMe().catch(() => {
      setState({ status: "guest", token: null, user: null });
    });
  }, [refreshMe]);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const res = await registerUser(input);
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setState({ status: "authed", token: res.token, user: res.user });
      router.push("/me");
    },
    [router]
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const res = await loginUser(input);
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setState({ status: "authed", token: res.token, user: res.user });
      router.push("/me");
    },
    [router]
  );

  const logout = useCallback(async () => {
    const token =
      state.status === "authed"
        ? state.token
        : typeof window === "undefined"
          ? null
          : window.localStorage.getItem(TOKEN_KEY);

    if (token) {
      await logoutUser(token).catch(() => undefined);
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    setState({ status: "guest", token: null, user: null });
    router.push("/login");
  }, [router, state]);

  const updateProfile = useCallback(
    async (input: {
      name: string;
      nickname?: string | null;
      email: string;
      current_password?: string;
      new_password?: string;
      new_password_confirmation?: string;
    }) => {
      const token =
        state.status === "authed"
          ? state.token
          : typeof window === "undefined"
            ? null
            : window.localStorage.getItem(TOKEN_KEY);

      if (!token) throw new Error("Not authenticated");

      const res = await updateMyProfileApi(token, input);
      setState((prev) =>
        prev.status === "authed" ? { ...prev, user: res.user } : prev
      );
    },
    [state]
  );

  const uploadProfileImage = useCallback(
    async (file: File) => {
      const token =
        state.status === "authed"
          ? state.token
          : typeof window === "undefined"
            ? null
            : window.localStorage.getItem(TOKEN_KEY);

      if (!token) throw new Error("Not authenticated");

      const res = await uploadProfileImageApi(token, file);
      setState((prev) =>
        prev.status === "authed"
          ? {
              ...prev,
              user: {
                ...prev.user,
                profile_image_url: res.profile_image_url,
                profile_image_offset_x: res.profile_image_offset_x,
                profile_image_offset_y: res.profile_image_offset_y,
              },
            }
          : prev
      );
    },
    [state]
  );

  const updateProfileImagePosition = useCallback(
    async (offsetX: number, offsetY: number) => {
      const token =
        state.status === "authed"
          ? state.token
          : typeof window === "undefined"
            ? null
            : window.localStorage.getItem(TOKEN_KEY);

      if (!token) throw new Error("Not authenticated");

      const res = await updateProfileImagePositionApi(token, offsetX, offsetY);
      setState((prev) =>
        prev.status === "authed"
          ? {
              ...prev,
              user: {
                ...prev.user,
                profile_image_offset_x: res.profile_image_offset_x,
                profile_image_offset_y: res.profile_image_offset_y,
              },
            }
          : prev
      );
    },
    [state]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ state, register, login, logout, refreshMe, updateProfile, uploadProfileImage, updateProfileImagePosition }),
    [state, register, login, logout, refreshMe, updateProfile, uploadProfileImage, updateProfileImagePosition]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

