import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from '../../services/admin-session.service';

export const customerGuard: CanActivateFn = async (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const session = inject(AdminSessionService);
  const router = inject(Router);
  await session.ensureInitialized();

  if (!session.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }

  return session.isAdmin()
    ? router.createUrlTree(['/admin'])
    : true;
};
