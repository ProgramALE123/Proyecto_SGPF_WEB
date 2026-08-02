import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
export const authGuard: CanActivateFn = () => inject(AuthService).autenticado() ? true : inject(Router).createUrlTree(['/']);
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data?.['roles'] as string[] | undefined;
  if (!auth.autenticado()) return router.createUrlTree(['/']);
  return !roles?.length || auth.tieneRol(...roles) ? true : router.createUrlTree(['/dashboard']);
};
