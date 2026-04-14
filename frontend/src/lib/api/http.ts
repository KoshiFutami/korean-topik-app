const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_URL is not set");
}

export type ApiErrorBody =
  | { message?: string; errors?: Record<string, string[]> }
  | undefined;

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const url = `${API_URL ?? ""}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (init.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = (isJson ? await res.json().catch(() => undefined) : undefined) as
    | ApiErrorBody
    | undefined;

  if (!res.ok) {
    const msg =
      (body && "message" in body && typeof body.message === "string"
        ? body.message
        : undefined) ?? `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body);
  }

  return (body as T) ?? (undefined as T);
}

