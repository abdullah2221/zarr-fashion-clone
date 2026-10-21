import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from '../../services/admin-session.service';

export const adminGuard: CanActivateFn = async (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const sessionService = inject(AdminSessionService);
  const router = inject(Router);
  await sessionService.ensureInitialized();

  if (!sessionService.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }

  return sessionService.isAdmin()
    ? true
    : router.createUrlTree(['/account'], { queryParams: { denied: 'admin' } });
};
