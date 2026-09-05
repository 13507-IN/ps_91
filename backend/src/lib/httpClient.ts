import { request } from 'undici';

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
}

export class HttpClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown,
  ) {
    super(message);
    this.name = 'HttpClientError';
  }
}

/**
 * Fast HTTP client backed by undici with timeouts and retry backoff.
 */
export async function httpRequest<T>(
  url: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  const timeoutMs = options.timeoutMs ?? 30000;
  const maxRetries = options.retries ?? 2;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const bodyStr = options.body ? JSON.stringify(options.body) : undefined;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await request(url, {
        method,
        headers,
        body: bodyStr,
        headersTimeout: timeoutMs,
        bodyTimeout: timeoutMs,
      });

      const rawBody = await response.body.text();
      let parsedBody: unknown;
      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        parsedBody = rawBody;
      }

      if (response.statusCode >= 400) {
        throw new HttpClientError(
          `HTTP Request to ${url} failed with status ${response.statusCode}`,
          response.statusCode,
          parsedBody,
        );
      }

      return parsedBody as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry client 4xx errors
      if (err instanceof HttpClientError && err.statusCode && err.statusCode < 500) {
        throw err;
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new HttpClientError(`Failed to complete request to ${url}`);
}
