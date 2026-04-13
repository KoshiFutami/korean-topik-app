import { AuthResponse, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, body };
  }

  return res.json() as Promise<T>;
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export const authApi = {
  register(data: {
    name: string;
    nickname?: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout(token: string): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: authHeader(token),
    });
  },
};

export const userApi = {
  me(token: string): Promise<User> {
    return request<User>("/user", {
      headers: authHeader(token),
    });
  },

  updateNickname(token: string, nickname: string): Promise<User> {
    return request<User>("/user/nickname", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ nickname }),
    });
  },
};
