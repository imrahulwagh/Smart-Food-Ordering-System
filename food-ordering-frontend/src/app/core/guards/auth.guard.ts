import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard for customer-protected routes (cart, orders, checkout, profile).
 * Redirects unauthenticated users to /login.
 */
export const authGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guard for admin-protected routes.
 * Redirects non-admins to /admin-login.
 */
export const adminGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdminLoggedIn()) {
    return true;
  }

  router.navigate(['/admin-login']);
  return false;
};
