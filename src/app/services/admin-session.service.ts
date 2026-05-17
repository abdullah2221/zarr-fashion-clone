import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { Tables, UserRole } from '../data-access/models/database.types';
import { SupabaseAuthRepository, SupabaseProfileRepository } from '../data-access/supabase/supabase.repositories';
import { AuthStatus, UserProfile, displayName, mapProfile } from '../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private readonly authRepository = inject(SupabaseAuthRepository);
  private readonly profileRepository = inject(SupabaseProfileRepository);
  private readonly router = inject(Router);

  private readonly authStatusSignal = signal<AuthStatus>('loading');
  private readonly userSignal = signal<User | null>(null);
  private readonly profileSignal = signal<UserProfile | null>(null);
  private readonly errorSignal = signal<string | null>(null);
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  readonly authStatus = this.authStatusSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.authStatus() === 'authenticated');
  readonly role = computed<UserRole>(() => this.profile()?.role || 'customer');
  readonly isAdmin = computed(() => {
    const role = this.role();
    return role === 'admin' || role === 'super_admin';
  });
  readonly isSuperAdmin = computed(() => this.role() === 'super_admin');
  readonly displayName = computed(() => displayName(this.user(), this.profile()));

  ensureInitialized() {
    if (this.initialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.refreshSession().finally(() => {
      this.initialized = true;
      this.initPromise = null;
    });

    return this.initPromise;
  }

  async refreshSession() {
    this.authStatusSignal.set('loading');
    this.errorSignal.set(null);

    try {
      const session = await this.authRepository.getSession();
      const user = session?.user || null;
      this.userSignal.set(user);

      if (!user) {
        this.profileSignal.set(null);
        this.authStatusSignal.set('unauthenticated');
        return;
      }

      const profile = await this.profileRepository.getCurrent();
      this.profileSignal.set(mapProfile(profile));
      this.authStatusSignal.set('authenticated');
    } catch (error) {
      this.userSignal.set(null);
      this.profileSignal.set(null);
      this.authStatusSignal.set('unauthenticated');
      this.errorSignal.set(error instanceof Error ? error.message : 'Unable to load admin session.');
    }
  }

  async signIn(email: string, password: string) {
    this.errorSignal.set(null);
    await this.authRepository.signInWithPassword(email, password);
    await this.refreshSession();
  }

  async signOut(redirectTo = '/login') {
    await this.authRepository.signOut();
    this.userSignal.set(null);
    this.profileSignal.set(null);
    this.authStatusSignal.set('unauthenticated');
    await this.router.navigateByUrl(redirectTo);
  }

  async updateCurrentProfile(changes: Partial<Tables<'profiles'>>) {
    const profile = await this.profileRepository.updateCurrent(changes);
    this.profileSignal.set(mapProfile(profile));
    return profile;
  }
}
