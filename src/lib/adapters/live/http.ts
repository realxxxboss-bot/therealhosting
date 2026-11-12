import { NotConnectedError } from "../types";

/** A provider answered with an error. The message is safe to show; the body is logged, never shown. */
export class ProviderError extends Error {
  constructor(
    readonly provider: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface JsonRequest {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  form?: Record<string, string>;
  timeoutMs?: number;
}

/** Small fetch wrapper: JSON or form body, timeout, and a friendly error that never includes the token. */
export async function requestJson<T>(
  provider: string,
  url: string,
  req: JsonRequest = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...req.headers,
  };
  let body: string | undefined;
  if (req.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(req.form).toString();
  } else if (req.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(req.body);
  }
  let response: Response;
  try {
    response = await fetch(url, {
      method: req.method ?? "GET",
      headers,
      body,
      signal: AbortSignal.timeout(req.timeoutMs ?? 15_000),
    });
  } catch (error) {
    console.error(
      `[${provider}] request failed:`,
      error instanceof Error ? error.message : error,
    );
    throw new ProviderError(
      provider,
      0,
      `${provider} did not answer. Please try again in a minute.`,
    );
  }
  const text = await response.text();
  if (!response.ok) {
    console.error(
      `[${provider}] HTTP ${response.status} for ${req.method ?? "GET"} ${new URL(url).pathname}: ${text.slice(0, 500)}`,
    );
    if (response.status === 401 || response.status === 403) {
      throw new NotConnectedError(
        `${provider} refused our access key. An admin needs to check the ${provider} settings.`,
      );
    }
    if (response.status === 429)
      throw new ProviderError(
        provider,
        429,
        `${provider} is busy. Please try again in a minute.`,
      );
    throw new ProviderError(
      provider,
      response.status,
      `${provider} could not do that right now (error ${response.status}).`,
    );
  }
  return (text ? JSON.parse(text) : {}) as T;
}

/** Reads a required setting, or says plainly which one is missing. */
export function requireEnv(provider: string, ...names: string[]): string[] {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length)
    throw new NotConnectedError(
      `${provider} is not connected yet (missing ${missing.join(", ")}).`,
    );
  return names.map((n) => process.env[n] as string);
}

/** The message to show a user when a provider call failed, or null when the error is a bug and should surface normally. */
export function providerMessage(error: unknown): string | null {
  if (error instanceof NotConnectedError || error instanceof ProviderError)
    return error.message;
  return null;
}
