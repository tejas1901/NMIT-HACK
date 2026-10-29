/**
 * FREIGHTIQ - Core API Client
 * Provides typed fetch with Supabase JWT bearer injection, timeout, and graceful fallback.
 */

import { supabase } from '../lib/supabase';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const API_BASE = '/api';

let memoryElevationToken: string | null = null;

export function setElevationToken(token: string | null) {
  memoryElevationToken = token;
  if (token) {
    try {
      sessionStorage.setItem('freightiq_admin_token', token);
    } catch {}
  } else {
    try {
      sessionStorage.removeItem('freightiq_admin_token');
    } catch {}
  }
}

export function getElevationToken(): string | null {
  if (memoryElevationToken) return memoryElevationToken;
  try {
    const stored = sessionStorage.getItem('freightiq_admin_token');
    if (stored) {
      memoryElevationToken = stored;
      return stored;
    }
  } catch {}
  return null;
}

export function clearElevationToken() {
  setElevationToken(null);
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<{ data: T; isFallback: boolean; error?: string }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // Get current session token if available
  let token: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  } catch {
    // Session retrieval failed; continue unauthenticated or fallback
  }

  const elevationToken = getElevationToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (elevationToken) {
    headers['x-admin-token'] = elevationToken;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error || `HTTP ${response.status}: ${response.statusText}`;
      if (fallbackData !== undefined) {
        console.warn(`[API] ${endpoint} returned status ${response.status}. Using fallback data.`, errMsg);
        return { data: fallbackData, isFallback: true, error: errMsg };
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    return { data: data as T, isFallback: false };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (fallbackData !== undefined) {
      console.warn(`[API] Request to ${endpoint} failed (${err.message}). Using resilient fallback data.`);
      return { data: fallbackData, isFallback: true, error: err.message };
    }
    throw err;
  }
}
