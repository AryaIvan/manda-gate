const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
};

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, timeoutMs = 15000 } = options;
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String(data.message)
          : "Terjadi kesalahan pada server";
      throw new Error(message);
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Koneksi ke server terlalu lama. Coba lagi.");
    }

    if (error instanceof TypeError) {
      throw new Error("Tidak bisa terhubung ke backend. Pastikan server API aktif.");
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
