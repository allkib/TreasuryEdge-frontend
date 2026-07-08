import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { InViewDirective } from '../../directives/in-view.directive';
import {
  CreateLadderHoldingRequest,
  LadderDashboard,
  LadderHolding,
  LadderTerm,
  TaxSettings,
} from '../../models/ladder.model';
import { AuthModalService } from '../../services/auth-modal.service';
import { AuthService } from '../../services/auth.service';
import { LadderService } from '../../services/ladder.service';
import { DEMO_DASHBOARD, DEMO_HOLDINGS, DEMO_TAX_SETTINGS } from '../../data/ladder-demo.data';

@Component({
  selector: 'app-ladder',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe, InViewDirective],
  templateUrl: './ladder.component.html',
  styleUrl: './ladder.component.css',
})
export class LadderComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly ladderService = inject(LadderService);
  private readonly authService = inject(AuthService);
  private readonly authModal = inject(AuthModalService);
  private readonly destroy$ = new Subject<void>();

  readonly terms: LadderTerm[] = [
    '4-Week',
    '8-Week',
    '13-Week',
    '17-Week',
    '26-Week',
    '52-Week',
  ];

  dashboard: LadderDashboard | null = null;
  holdings: LadderHolding[] = [];
  taxSettings: TaxSettings | null = null;

  loading = false;
  loadError = '';
  formError = '';
  taxError = '';
  taxSaveMessage = '';
  submitting = false;
  savingTax = false;
  deletingId: string | null = null;

  holdingForm = this.fb.group({
    term: ['13-Week' as LadderTerm, Validators.required],
    parValue: [null as number | null, [Validators.required, Validators.min(0.01)]],
    pricePaid: [null as number | null, [Validators.required, Validators.min(0.01)]],
    issueDate: ['', Validators.required],
    maturityDate: ['', Validators.required],
    rate: [null as number | null, [Validators.required, Validators.min(0)]],
    cusip: [''],
  });

  taxForm = this.fb.group({
    marginalTaxRatePercent: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    paysEstimatedTaxes: [false],
  });

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isPreview(): boolean {
    return !this.isLoggedIn;
  }

  get displayDashboard(): LadderDashboard | null {
    if (this.isLoggedIn) {
      return this.dashboard;
    }

    return DEMO_DASHBOARD;
  }

  get displayHoldings(): LadderHolding[] {
    if (this.isLoggedIn) {
      return this.holdings;
    }

    return DEMO_HOLDINGS;
  }

  get displayTaxSettings(): TaxSettings {
    if (this.isLoggedIn && this.taxSettings) {
      return this.taxSettings;
    }

    return DEMO_TAX_SETTINGS;
  }

  readonly securityFeatures = [
    {
      title: 'JWT bearer authentication',
      detail:
        'Every ladder API call sends a short-lived JSON Web Token in the Authorization: Bearer header. Requests without a valid token are rejected before your holdings are read or written.',
    },
    {
      title: 'Per-user data isolation',
      detail:
        'Holdings and tax settings are stored server-side and scoped to your authenticated user ID from the JWT payload — not shared across accounts.',
    },
    {
      title: 'No brokerage or bank linking',
      detail:
        'TreasuryEdge never requests OAuth access to your brokerage, bank, or TreasuryDirect account. You manually enter only the fields you choose to track.',
    },
    {
      title: 'TLS in transit',
      detail:
        'All traffic between your browser and our API is encrypted over HTTPS (TLS 1.2+), including login credentials and ladder payloads.',
    },
    {
      title: 'Hashed credentials at rest',
      detail:
        'Passwords are never stored in plaintext. Only a salted hash is persisted server-side; we cannot recover or read your password.',
    },
    {
      title: 'Minimal client-side footprint',
      detail:
        'Only your session token and email are kept in localStorage. Ladder holdings live on the server — clearing your browser does not expose portfolio data to other users.',
    },
  ] as const;

  ngOnInit(): void {
    this.loadPageData();

    this.authService.authState$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadPageData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSignIn(): void {
    this.authModal.open('login');
  }

  openSignUp(): void {
    this.authModal.open('signup');
  }

  loadPageData(): void {
    if (!this.isLoggedIn) {
      this.loading = false;
      this.loadError = '';
      this.dashboard = null;
      this.holdings = [];
      this.taxSettings = null;
      return;
    }

    this.loading = true;
    this.loadError = '';

    forkJoin({
      dashboard: this.ladderService.getDashboard(),
      holdings: this.ladderService.getHoldings(),
      taxSettings: this.ladderService.getTaxSettings(),
    }).subscribe({
      next: ({ dashboard, holdings, taxSettings }) => {
        this.dashboard = dashboard;
        this.holdings = this.sortHoldings(holdings);
        this.taxSettings = taxSettings;
        this.taxForm.patchValue({
          marginalTaxRatePercent: taxSettings.marginalTaxRate * 100,
          paysEstimatedTaxes: taxSettings.paysEstimatedTaxes,
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Unable to load your ladder data. Please try again.';
      },
    });
  }

  onAddHolding(): void {
    if (!this.isLoggedIn || this.holdingForm.invalid) {
      this.holdingForm.markAllAsTouched();
      return;
    }

    const raw = this.holdingForm.getRawValue();
    const payload: CreateLadderHoldingRequest = {
      term: raw.term!,
      parValue: Number(raw.parValue),
      pricePaid: Number(raw.pricePaid),
      issueDate: raw.issueDate!,
      maturityDate: raw.maturityDate!,
      rate: Number(raw.rate),
    };

    const cusip = raw.cusip?.trim();
    if (cusip) {
      payload.cusip = cusip;
    }

    this.submitting = true;
    this.formError = '';

    this.ladderService.addHolding(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.holdingForm.reset({
          term: '13-Week',
          parValue: null,
          pricePaid: null,
          issueDate: '',
          maturityDate: '',
          rate: null,
          cusip: '',
        });
        this.refreshHoldingsAndDashboard();
      },
      error: () => {
        this.submitting = false;
        this.formError = 'Unable to add holding. Please check your inputs and try again.';
      },
    });
  }

  onDeleteHolding(id: string): void {
    if (!this.isLoggedIn) {
      return;
    }

    this.deletingId = id;

    this.ladderService.deleteHolding(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.refreshHoldingsAndDashboard();
      },
      error: () => {
        this.deletingId = null;
        this.loadError = 'Unable to delete holding. Please try again.';
      },
    });
  }

  onSaveTaxSettings(): void {
    if (!this.isLoggedIn || this.taxForm.invalid) {
      this.taxForm.markAllAsTouched();
      return;
    }

    const raw = this.taxForm.getRawValue();
    const payload: TaxSettings = {
      marginalTaxRate: Number(raw.marginalTaxRatePercent) / 100,
      paysEstimatedTaxes: !!raw.paysEstimatedTaxes,
    };

    this.savingTax = true;
    this.taxError = '';
    this.taxSaveMessage = '';

    this.ladderService.updateTaxSettings(payload).subscribe({
      next: (settings) => {
        this.taxSettings = settings;
        this.savingTax = false;
        this.taxSaveMessage = 'Tax settings saved.';
        this.refreshDashboard();
      },
      error: () => {
        this.savingTax = false;
        this.taxError = 'Unable to save tax settings. Please try again.';
      },
    });
  }

  formatRate(rate: number): number {
    return rate <= 1 ? rate * 100 : rate;
  }

  private refreshHoldingsAndDashboard(): void {
    forkJoin({
      dashboard: this.ladderService.getDashboard(),
      holdings: this.ladderService.getHoldings(),
    }).subscribe({
      next: ({ dashboard, holdings }) => {
        this.dashboard = dashboard;
        this.holdings = this.sortHoldings(holdings);
      },
    });
  }

  private refreshDashboard(): void {
    this.ladderService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
      },
    });
  }

  private sortHoldings(holdings: LadderHolding[]): LadderHolding[] {
    return [...holdings].sort(
      (a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime(),
    );
  }
}
