import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const userRole = authService.getUserRole();

  if (!userRole || !allowedRoles.includes(userRole)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
