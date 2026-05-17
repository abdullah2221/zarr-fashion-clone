import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from '../../services/admin-session.service';

export const superAdminGuard: CanActivateFn = async (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const sessionService = inject(AdminSessionService);
  const router = inject(Router);
  await sessionService.ensureInitialized();

  if (!sessionService.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }

  return sessionService.isSuperAdmin()
    ? true
    : router.createUrlTree(['/admin/dashboard'], { queryParams: { denied: 'super_admin' } });
};
