import { InjectionToken } from '@angular/core';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

declare const SUPABASE_URL: string | undefined;
declare const SUPABASE_ANON_KEY: string | undefined;

const PLACEHOLDER_VALUES = new Set([
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY',
  'https://YOUR_PROJECT.supabase.co',
]);

function readRuntimeValue(key: 'SUPABASE_URL' | 'SUPABASE_ANON_KEY'): string {
  const browserConfig = (globalThis as typeof globalThis & {
    __UR_FASHION_CONFIG__?: Partial<Record<'SUPABASE_URL' | 'SUPABASE_ANON_KEY', string>>;
  }).__UR_FASHION_CONFIG__;

  const runtimeValue = browserConfig?.[key];
  if (runtimeValue) return runtimeValue;

  if (typeof process !== 'undefined') {
    const processValue = process.env[key];
    if (processValue) return processValue;
  }

  if (key === 'SUPABASE_URL' && typeof SUPABASE_URL === 'string') return SUPABASE_URL;
  if (key === 'SUPABASE_ANON_KEY' && typeof SUPABASE_ANON_KEY === 'string') return SUPABASE_ANON_KEY;

  return '';
}

export function isValidSupabaseUrl(value: string): boolean {
  if (!value || PLACEHOLDER_VALUES.has(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

export function isValidSupabasePublicKey(value: string): boolean {
  if (!value || PLACEHOLDER_VALUES.has(value)) return false;
  const isPublishableKey = value.startsWith('sb_publishable_') && value.length >= 24;
  const isLegacyAnonJwt = value.split('.').length === 3 && value.length >= 80;
  return isPublishableKey || isLegacyAnonJwt;
}

export function createSupabaseConfig(): SupabaseConfig {
  return {
    url: readRuntimeValue('SUPABASE_URL'),
    anonKey: readRuntimeValue('SUPABASE_ANON_KEY'),
  };
}

export const SUPABASE_CONFIG = new InjectionToken<SupabaseConfig>('SUPABASE_CONFIG', {
  providedIn: 'root',
  factory: createSupabaseConfig,
});
