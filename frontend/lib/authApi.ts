import type { MockUser, UserRole } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const AUTH_TOKENS_KEY = "culture-spot:auth-tokens";

type BackendRole = "CONSUMER" | "CREATOR" | "PROVIDER" | "ADMIN";

export type SignupRequestBody = {
  email: string;
  password: string;
  name: string;
  role: BackendRole;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type BackendAuthResponse = AuthTokens & {
  role: BackendRole;
  userId?: number;
  email?: string;
  name?: string;
};

export type AuthSession = {
  user: MockUser;
  tokens: AuthTokens;
};

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: BackendRole;
  exp?: number;
};

function apiUrl(path: string) {
  const url = new URL(path, API_BASE_URL || "http://culture-spot.internal");
  return API_BASE_URL ? url.toString() : url.pathname;
}

export function backendRoleFromUserRole(role: UserRole): BackendRole {
  if (role === "creator") return "CREATOR";
  if (role === "cafeOwner") return "PROVIDER";
  return "CONSUMER";
}

export function userRoleFromBackendRole(role?: string): UserRole {
  if (role === "CREATOR") return "creator";
  if (role === "PROVIDER") return "cafeOwner";
  return "consumer";
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return atob(padded);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, bufferSeconds = 30) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
}

function authSessionFromResponse(
  response: BackendAuthResponse,
  fallbackEmail: string,
): AuthSession {
  const payload = decodeJwtPayload(response.accessToken);
  const email = response.email ?? payload?.email ?? fallbackEmail;
  const role = userRoleFromBackendRole(response.role ?? payload?.role);

  return {
    user: {
      id: String(response.userId ?? payload?.sub ?? `${role}-${Date.now()}`),
      name: response.name ?? email.split("@")[0] ?? "컬처 SPOT! 사용자",
      email,
      role,
    },
    tokens: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
  };
}

export async function signupUser(request: SignupRequestBody) {
  const response = await fetch(apiUrl("/api/auth/signup"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to sign up: ${response.status}`);
  }

  return (await response.json()) as number;
}

export async function loginUser(request: LoginRequestBody) {
  const response = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to log in: ${response.status}`);
  }

  const data = (await response.json()) as BackendAuthResponse;
  return authSessionFromResponse(data, request.email);
}

export async function refreshAuthSession(
  refreshToken: string,
  fallbackUser?: MockUser | null,
) {
  const response = await fetch(apiUrl("/api/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh session: ${response.status}`);
  }

  const data = (await response.json()) as BackendAuthResponse;
  return authSessionFromResponse(data, fallbackUser?.email ?? "");
}

export function readStoredAuthTokens() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_TOKENS_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  let tokens = readStoredAuthTokens();

  if (
    tokens?.accessToken &&
    isJwtExpired(tokens.accessToken) &&
    !isJwtExpired(tokens.refreshToken)
  ) {
    try {
      const refreshed = await refreshAuthSession(tokens.refreshToken);
      tokens = refreshed.tokens;
      window.localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
    } catch {
      window.localStorage.removeItem(AUTH_TOKENS_KEY);
      tokens = null;
    }
  }

  const headers = new Headers(init?.headers);

  if (tokens?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
