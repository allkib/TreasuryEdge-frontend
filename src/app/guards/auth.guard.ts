import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthModalService } from '../services/auth-modal.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const authModal = inject(AuthModalService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  authModal.open('login');
  return router.createUrlTree(['/login']);
};
