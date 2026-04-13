import type { Vocabulary, VocabularyFormData } from "@/lib/types/vocabulary";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("api_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "API error");
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<string> {
  const data = await apiFetch<{ token: string }>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.token;
}

export async function fetchVocabulary(): Promise<Vocabulary[]> {
  const data = await apiFetch<{ data: Vocabulary[] }>("/v1/vocabulary");
  return data.data;
}

export async function fetchVocabularyById(id: number): Promise<Vocabulary> {
  const data = await apiFetch<{ data: Vocabulary }>(`/v1/vocabulary/${id}`);
  return data.data;
}

export async function createVocabulary(
  payload: VocabularyFormData,
): Promise<Vocabulary> {
  const data = await apiFetch<{ data: Vocabulary }>("/v1/vocabulary", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function updateVocabulary(
  id: number,
  payload: Partial<VocabularyFormData>,
): Promise<Vocabulary> {
  const data = await apiFetch<{ data: Vocabulary }>(`/v1/vocabulary/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function deleteVocabulary(id: number): Promise<void> {
  await apiFetch<void>(`/v1/vocabulary/${id}`, { method: "DELETE" });
}
