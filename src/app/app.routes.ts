import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing/landing.component').then((m) => m.LandingComponent),
    data: { animation: 'home' },
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'compare',
    loadComponent: () =>
      import('./components/compare/compare.component').then((m) => m.CompareComponent),
    data: { animation: 'compare' },
  },
  {
    path: 'ladder',
    loadComponent: () =>
      import('./components/ladder/ladder.component').then((m) => m.LadderComponent),
    data: { animation: 'ladder' },
  },
  {
    path: 'rates',
    redirectTo: 'compare',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth-redirect/auth-redirect.component').then((m) => m.AuthRedirectComponent),
    data: { mode: 'login' },
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/auth-redirect/auth-redirect.component').then((m) => m.AuthRedirectComponent),
    data: { mode: 'signup' },
  },
  {
    path: 'dashboard',
    redirectTo: 'compare',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
