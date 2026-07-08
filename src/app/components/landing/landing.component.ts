import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountUpDirective } from '../../directives/count-up.directive';
import { InViewDirective } from '../../directives/in-view.directive';
import { AuthModalService } from '../../services/auth-modal.service';
import { SavingsGapChartComponent } from '../savings-gap-chart/savings-gap-chart.component';

interface Benefit {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

interface Testimonial {
  name: string;
  initials: string;
  quote: string;
  location: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CountUpDirective, InViewDirective, SavingsGapChartComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  private readonly authModal = inject(AuthModalService);

  openSignIn(): void {
    this.authModal.open('login');
  }

  openSignUp(): void {
    this.authModal.open('signup');
  }

  readonly benefits: Benefit[] = [
    {
      icon: 'tax',
      title: 'Personalized Tax-Adjusted Returns',
      description: 'See T-bill returns adjusted for your actual state tax rate.',
    },
    {
      icon: 'save',
      title: 'Save Your Comparisons',
      description: 'Track your savings gap over time on your dashboard.',
    },
    {
      icon: 'rates',
      title: 'Full Rate History',
      description: 'Unlock all 10+ banks instead of just 5 on the free preview.',
    },
    {
      icon: 'alerts',
      title: 'Rate Change Alerts',
      description: 'Get notified when T-bill yields cross your threshold.',
      badge: 'Coming Soon',
    },
    {
      icon: 'free',
      title: 'No Fees, No Catch',
      description: 'Genuinely free account — no credit card required.',
    },
    {
      icon: 'secure',
      title: 'Bank-Level Security',
      description: 'JWT-secured. No financial account linking required.',
    },
  ];

  readonly testimonials: Testimonial[] = [
    {
      name: 'Sarah M.',
      initials: 'SM',
      quote: 'I had no idea my savings account was earning basically nothing. TreasuryEdge showed me I was leaving over $2,400/year on the table.',
      location: 'Austin, TX',
    },
    {
      name: 'James K.',
      initials: 'JK',
      quote: 'The state tax adjustment is a game-changer. T-bills look even better once you factor in that they\'re state-tax exempt.',
      location: 'Denver, CO',
    },
    {
      name: 'Priya R.',
      initials: 'PR',
      quote: 'Clean, simple, and actually useful. I moved $50K into T-bills within a week of signing up.',
      location: 'Chicago, IL',
    },
    {
      name: 'Michael T.',
      initials: 'MT',
      quote: 'Finally a tool that compares apples to apples. No more guessing whether my bank or T-bills win after taxes.',
      location: 'Seattle, WA',
    },
  ];
}
