import type { TResponse } from "@/types/common";

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Initialize token from localStorage if available (client-side)
    if (typeof window !== "undefined") {
      try {
        this.token = localStorage.getItem("access_token");
      } catch {
        // ignore storage errors
      }
    }
  }

  private getHeaders(json: boolean = false): Record<string, string> {
    const h: Record<string, string> = { Accept: "application/json" };
    if (json) h["Content-Type"] = "application/json";

    // Option B: Always read the token from localStorage on each request.
    // This ensures fresh token usage immediately after login without reload.
    let token = this.token;
    if (!token && typeof window !== "undefined") {
      try {
        token = localStorage.getItem("access_token");
      } catch {
        // ignore storage errors
      }
    }

    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }

  async get<T>(path: string): Promise<TResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers: this.getHeaders(false),
      });

      const json = await response.json();

      if (!response.ok) {
        const msg = String(
          json?.message ?? `Request failed with status ${response.status}`
        );
        throw new Error(msg);
      }
      return json as TResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw error;
      }
      throw new Error("An error occurred");
    }
  }

  async post<T>(
    path: string,
    data: Record<string, unknown>
  ): Promise<TResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        const msg = String(
          json?.message ?? `Request failed with status ${response.status}`
        );
        throw new Error(msg);
      }

      return json as TResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw error;
      }
      throw new Error("An error occurred");
    }
  }
}
