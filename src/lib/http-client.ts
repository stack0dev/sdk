/**
 * HTTP client for Stack0 API
 * Handles authentication, request/response formatting, and error handling
 */

export interface HttpClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export class HttpClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: HttpClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.stack0.dev/v1";
  }

  private getHeaders(includeContentType = true): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const bodyString = body === undefined ? undefined : JSON.stringify(body);
    const hasBody = bodyString !== undefined;

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(hasBody),
        body: hasBody ? bodyString : undefined,
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error; // Re-throw our custom errors
      }
      throw this.createError("Network error", error);
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorBody: { message: string } | undefined;
    try {
      errorBody = (await response.json()) as { message: string };
    } catch {
      errorBody = { message: response.statusText };
    }

    const error = new Error(errorBody?.message || `HTTP ${response.status}`) as Error & {
      statusCode: number;
      code: string;
      response: unknown;
    };
    error.statusCode = response.status;
    error.code = (errorBody as unknown as { code: string } | undefined)?.code ?? "";
    error.response = errorBody;
    throw error;
  }

  private createError(message: string, cause?: unknown): Error {
    const error = new Error(message) as Error & { cause: unknown };
    error.cause = cause;
    return error;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  async deleteWithBody<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("DELETE", path, body);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }
}
