import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, isValidSupabasePublicKey, isValidSupabaseUrl } from './supabase.config';
import { Database } from '../../data-access/models/database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private readonly config = inject(SUPABASE_CONFIG);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private client: SupabaseClient<Database> | null = null;

  getClient(): SupabaseClient<Database> | null {
    if (!this.isConfigured()) return null;

    if (!this.client) {
      this.client = createClient<Database>(this.config.url, this.config.anonKey, {
        auth: {
          persistSession: this.isBrowser,
          autoRefreshToken: this.isBrowser,
          detectSessionInUrl: this.isBrowser,
        },
      });
    }

    return this.client;
  }

  isConfigured(): boolean {
    return isValidSupabaseUrl(this.config.url) && isValidSupabasePublicKey(this.config.anonKey);
  }
}
