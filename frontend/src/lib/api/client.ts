import type { ApiError, AuthTokens } from '@/types';
import toast from 'react-hot-toast';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://ps-91.onrender.com';

const ACCESS_TOKEN_KEY = 'udyamsetu_access_token';
const REFRESH_TOKEN_KEY = 'udyamsetu_refresh_token';

export const apiBaseUrl = API_BASE_URL;

// Token store in sessionStorage (per-tab, survives reload, more XSS-safe than localStorage).
function readTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  try {
    return {
      accessToken: window.sessionStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: window.sessionStorage.getItem(REFRESH_TOKEN_KEY),
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

export function setTokens(tokens: AuthTokens | null) {
  if (typeof window === 'undefined') return;
  try {
    if (tokens) {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) {
        window.sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      } else {
        window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } else {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // storage unavailable
  }
}

export function getAccessToken() {
  return readTokens().accessToken;
}

export function getRefreshToken() {
  return readTokens().refreshToken;
}

export function hasSession() {
  return Boolean(getAccessToken());
}

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (!getRefreshToken()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AuthTokens;
    setTokens(data);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function tryRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retryOnAuth = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // Silent refresh + retry on 401
  if (res.status === 401 && retryOnAuth && getRefreshToken()) {
    const newToken = await tryRefresh();
    if (newToken) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  if (!res.ok) {
    let payload: ApiError = {
      statusCode: res.status,
      code: 'HTTP_ERROR',
      message: res.statusText,
    };
    try {
      payload = (await res.json()) as ApiError;
    } catch {
      // ignore body parse errors
    }
    throw new ApiRequestError(payload, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiRequestError extends Error {
  statusCode: number;
  code: string;
  constructor(payload: ApiError, status: number) {
    super(payload.message ?? 'Request failed');
    this.name = 'ApiRequestError';
    this.statusCode = status;
    this.code = payload.code ?? 'HTTP_ERROR';
  }
}

/**
 * Global helper to format and show API errors in a toast.
 */
export function handleApiError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.') {
  if (error instanceof ApiRequestError) {
    toast.error(error.message);
  } else if (error instanceof Error) {
    toast.error(error.message || fallbackMessage);
  } else {
    toast.error(fallbackMessage);
  }
}

export const apiEndpoints = {
  health: '/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  users: {
    me: '/api/users/me',
    update: '/api/users/me',
  },
  financial: {
    emi: '/api/financial/emi',
    projectCost: '/api/financial/project-cost',
    cashflow: '/api/financial/cashflow',
    breakeven: '/api/financial/breakeven',
    stressTest: '/api/financial/stress-test',
    calculate: '/api/financial/calculate',
  },
  schemes: { match: '/api/schemes/match', list: '/api/schemes' },
  locations: {
    search: '/api/locations/search',
    nearby: '/api/locations/nearby',
    create: '/api/locations/villages',
  },
  market: {
    intelligence: '/api/market/intelligence',
    competitors: '/api/market/competitors',
    prices: '/api/market/prices',
    infrastructure: '/api/market/infrastructure',
  },
  businesses: {
    categories: '/api/businesses/categories',
    list: '/api/businesses',
    create: '/api/businesses',
    density: '/api/businesses/density',
  },
  ai: {
    classify: '/api/ai/classify',
    demandEstimate: '/api/ai/demand-estimate',
    opportunityDiscover: '/api/ai/opportunity-discover',
    riskAssess: '/api/ai/risk-assess',
    recommend: '/api/ai/recommend',
    actionPlan: '/api/ai/action-plan',
  },
  feasibility: {
    analyze: '/api/feasibility/analyze',
    analyses: '/api/feasibility/analyses',
  },
  admin: {
    pipelines: '/api/admin/ingest/pipelines',
    ingestStatus: '/api/admin/ingest/status',
  },
  chat: {
    message: '/api/chat/message',
    status: '/api/chat/status',
  },
} as const;