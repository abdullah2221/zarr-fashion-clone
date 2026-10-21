import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from '../../services/admin-session.service';

export const guestOnlyGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const session = inject(AdminSessionService);
  const router = inject(Router);
  await session.ensureInitialized();

  return session.isAuthenticated()
    ? router.createUrlTree([session.defaultRedirectForRole()])
    : true;
};
