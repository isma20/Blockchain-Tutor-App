import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const adminAuth = inject(AdminAuthService);
  const router = inject(Router);

  if (adminAuth.isLoggedIn()) {
    return true;
  }

  // Redirect to admin login if not authenticated
  router.navigate(['/admin-login']);
  return false;
};
