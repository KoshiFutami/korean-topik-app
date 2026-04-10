import { apiFetch } from "../http";

export type Admin = {
  id: string;
  name: string;
  email: string;
  created_at?: string;
};

export async function loginAdmin(input: {
  email: string;
  password: string;
}): Promise<{ token: string; admin: Admin }> {
  return apiFetch("/api/v1/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutAdmin(token: string): Promise<{ message: string }> {
  return apiFetch("/api/v1/admin/auth/logout", {
    method: "POST",
    token,
  });
}

export async function meAdmin(token: string): Promise<{ admin: Admin }> {
  return apiFetch("/api/v1/admin/auth/me", {
    method: "GET",
    token,
  });
}

