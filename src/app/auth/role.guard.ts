import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, Role } from './auth.service';

export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const ok = await auth.ensureSession();
    if (!ok) {
      router.navigate(['/login']);
      return false;
    }

    const user = auth.getUser();
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      switch (user?.role) {
        case 'admin':
          router.navigate(['/admin']);
          break;
        case 'tutor':
          router.navigate(['/teacher']);
          break;
        case 'student':
          router.navigate(['/dashboard']);
          break;
        default:
          router.navigate(['/login']);
      }
      return false;
    }

    return true;
  };
}

// Specific role guards for convenience
export const adminGuard = roleGuard(['admin']);
export const tutorGuard = roleGuard(['tutor']);
export const studentGuard = roleGuard(['student']);
export const adminOrTutorGuard = roleGuard(['admin', 'tutor']);
