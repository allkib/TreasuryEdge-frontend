import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { InViewDirective } from '../../directives/in-view.directive';
import { BankRate, ComparisonResponse, TBillRate } from '../../models/rates.model';
import { getFallbackComparison } from '../../data/fallback-rates.data';
import { AuthModalService } from '../../services/auth-modal.service';
import { AuthService } from '../../services/auth.service';
import { RatesService } from '../../services/rates.service';

Chart.register(...registerables);

@Component({
  selector: 'app-comparison-panel',
  imports: [DecimalPipe, InViewDirective],
  templateUrl: './comparison-panel.component.html',
  styleUrl: './comparison-panel.component.css',
})
export class ComparisonPanelComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() stateTaxRate = 0;
  @ViewChild('yieldChartCanvas') yieldChartCanvas?: ElementRef<HTMLCanvasElement>;

  loading = false;
  usingFallbackData = true;
  comparison: ComparisonResponse | null = null;
  chartVisible = false;

  private chart: Chart | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly authModal = inject(AuthModalService);
  private viewReady = false;

  constructor(
    public authService: AuthService,
    private ratesService: RatesService,
  ) {}

  openSignUp(): void {
    this.authModal.open('signup');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stateTaxRate']) {
      this.loadComparison();
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.comparison) {
      this.renderChart(this.chartVisible);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get sortedTbills(): TBillRate[] {
    if (!this.comparison?.tbills.length) {
      return [];
    }

    return [...this.comparison.tbills].sort(
      (a, b) =>
        (b.taxEquivalentYield ?? b.highInvestmentRate) -
        (a.taxEquivalentYield ?? a.highInvestmentRate),
    );
  }

  get sortedBanks(): BankRate[] {
    if (!this.comparison?.banks.length) {
      return [];
    }

    return [...this.comparison.banks].sort((a, b) => b.apy - a.apy);
  }

  get topTBill(): TBillRate | null {
    return this.sortedTbills[0] ?? null;
  }

  get topBank(): BankRate | null {
    return this.sortedBanks[0] ?? null;
  }

  get topTBillYield(): number {
    const bill = this.topTBill;
    return bill ? (bill.taxEquivalentYield ?? bill.highInvestmentRate) : 0;
  }

  get topBankApy(): number {
    return this.topBank?.apy ?? 0;
  }

  get yieldDifference(): number {
    return this.topTBillYield - this.topBankApy;
  }

  onChartVisible(visible: boolean): void {
    this.chartVisible = visible;
    if (visible && this.viewReady) {
      this.renderChart(true);
    }
  }

  retry(): void {
    this.loadComparison();
  }

  isBankLocked(index: number): boolean {
    return !this.isLoggedIn && index >= 5;
  }

  private loadComparison(): void {
    this.comparison = getFallbackComparison(this.stateTaxRate);
    this.usingFallbackData = true;
    this.loading = true;

    if (this.viewReady) {
      this.renderChart(this.chartVisible);
    }

    this.ratesService
      .getComparison(this.stateTaxRate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.comparison = data;
          this.usingFallbackData = false;
          this.loading = false;
          if (this.viewReady) {
            this.renderChart(this.chartVisible);
          }
        },
        error: () => {
          this.comparison = getFallbackComparison(this.stateTaxRate);
          this.usingFallbackData = true;
          this.loading = false;
          if (this.viewReady) {
            this.renderChart(this.chartVisible);
          }
        },
      });
  }

  private renderChart(animate: boolean): void {
    if (!this.yieldChartCanvas || !this.topTBill || !this.topBank) {
      return;
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Top T-Bill (tax-equiv.)', 'Top Bank APY'],
        datasets: [
          {
            data: [this.topTBillYield, this.topBankApy],
            backgroundColor: [
              'rgba(16, 185, 129, 0.85)',
              'rgba(100, 116, 139, 0.75)',
            ],
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 28,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: animate
          ? { duration: 1000, easing: 'easeOutQuart' }
          : { duration: 0 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${Number(ctx.raw).toFixed(2)}%`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: Math.max(this.topTBillYield, this.topBankApy) * 1.15,
            grid: { color: 'rgba(148, 163, 184, 0.2)' },
            ticks: {
              callback: (value) => `${value}%`,
              color: '#64748b',
            },
          },
          y: {
            grid: { display: false },
            ticks: { color: '#0f172a', font: { weight: 600 } },
          },
        },
      },
    };

    if (this.chart) {
      this.chart.data = config.data!;
      if (config.options) {
        Object.assign(this.chart.options, config.options);
      }
      this.chart.update(animate ? 'active' : 'none');
      return;
    }

    this.chart = new Chart(this.yieldChartCanvas.nativeElement, config);
  }
}
