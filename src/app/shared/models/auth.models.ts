import { User } from '@supabase/supabase-js';
import { Tables, UserRole } from '../../data-access/models/database.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
}

export interface PermissionProbeState {
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
  detail?: string;
}

export function mapProfile(profile: Tables<'profiles'> | null): UserProfile | null {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role,
  };
}

export function displayName(user: User | null, profile: UserProfile | null) {
  return profile?.fullName || user?.email || 'Zeenat Admin';
}
