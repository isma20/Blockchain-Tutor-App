import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const ok = await auth.ensureSession();
  if (ok) return true;

  router.navigate(['/login']);
  return false;
};
