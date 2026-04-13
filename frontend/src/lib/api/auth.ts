import { apiFetch } from "./http";

export type User = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
  created_at?: string;
};

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ token: string; user: User }> {
  return apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  return apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutUser(token: string): Promise<{ message: string }> {
  return apiFetch("/api/v1/auth/logout", {
    method: "POST",
    token,
  });
}

export async function me(token: string): Promise<{ user: User }> {
  return apiFetch("/api/v1/auth/me", {
    method: "GET",
    token,
  });
}

export async function updateMyProfile(
  token: string,
  input: {
    name: string;
    nickname?: string | null;
    email: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
  }
): Promise<{ user: User }> {
  return apiFetch("/api/v1/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
}

