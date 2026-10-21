import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { Tables, UserRole } from '../data-access/models/database.types';
import { SupabaseAuthRepository, SupabaseProfileRepository } from '../data-access/supabase/supabase.repositories';
import { AuthStatus, UserProfile, displayName, mapProfile } from '../shared/models/auth.models';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private readonly authRepository = inject(SupabaseAuthRepository);
  private readonly profileRepository = inject(SupabaseProfileRepository);
  private readonly router = inject(Router);
  private readonly clientService = inject(SupabaseClientService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

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
  readonly isLoading = computed(() => this.authStatus() === 'loading');
  readonly isLoggedIn = computed(() => this.authStatus() === 'authenticated');
  readonly isAuthenticated = computed(() => this.authStatus() === 'authenticated');
  readonly role = computed<UserRole>(() => this.profile()?.role || 'customer');
  readonly isCustomer = computed(() => this.isLoggedIn() && this.role() === 'customer');
  readonly isAdmin = computed(() => {
    const role = this.role();
    return role === 'admin' || role === 'super_admin';
  });
  readonly isSuperAdmin = computed(() => this.role() === 'super_admin');
  readonly displayName = computed(() => displayName(this.user(), this.profile()));

  constructor() {
    if (this.isBrowser) {
      void this.ensureInitialized();
      const client = this.clientService.getClient();
      client?.auth.onAuthStateChange(() => {
        void this.refreshSession();
      });
    }
  }

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

  async signUpCustomer(params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    this.errorSignal.set(null);
    const user = await this.authRepository.signUp(params.email, params.password);
    const session = await this.authRepository.getSession();
    const hasAuthenticatedSession = Boolean(session?.access_token);

    if (hasAuthenticatedSession) {
      await this.profileRepository.upsertProfile({
        id: user.id,
        email: params.email.trim().toLowerCase(),
        full_name: params.fullName.trim(),
        phone: params.phone.trim() || null,
        role: 'customer',
      });
    }

    await this.refreshSession();
    return {
      user,
      requiresEmailVerification: !hasAuthenticatedSession,
    };
  }

  async resetPassword(email: string, redirectPath = '/reset-password') {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${redirectPath}`
        : undefined;
    await this.authRepository.resetPasswordForEmail(email, redirectTo);
  }

  async updatePassword(newPassword: string) {
    await this.authRepository.updatePassword(newPassword);
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

  defaultRedirectForRole() {
    return this.isAdmin() ? '/admin' : '/account';
  }
}
