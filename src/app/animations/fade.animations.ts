import { animate, style, transition, trigger } from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('600ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const routeFade = trigger('routeFade', [
  transition('* <=> *', [
    style({ opacity: 0 }),
    animate('280ms ease-out', style({ opacity: 1 })),
  ]),
]);
