import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    supabaseAdmin = createClient(config.supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

export function createSupabaseUserClient(jwtToken: string): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  });
}
