import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface MetricCard {
  key: string;
  labelKey: string;
  value: number | string;
  subLabelKey: string;
  subValue?: string;
  trend?: number;        // positive = up, negative = down
  trendLabelKey?: string;
  icon: string;
  accentColor: 'green' | 'gold' | 'red' | 'secondary';
}

export interface TopCoupon {
  name: string;
  discountType: string;
  claimed: number;
  total: number;
  usagePercent: number;
  status: 'available' | 'exhausted' | 'expired';
}

export interface WeeklyData {
  day: string;
  dayKey: string;
  validations: number;
  rejections: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './analytics-dashboard.html',
  styleUrl: './analytics-dashboard.css'
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  // ── Period filter ──
  activePeriod: 'week' | 'month' | 'year' = 'month';

  // ── Metric cards ──
  metricCards: MetricCard[] = [];

  // ── Top coupons ──
  topCoupones: TopCoupon[] = [
    { name: 'Promo Verano',    discountType: '15% Descuento', claimed: 78,  total: 100, usagePercent: 78,  status: 'available' },
    { name: 'Martes Locos',    discountType: '2x1',           claimed: 50,  total: 50,  usagePercent: 100, status: 'exhausted' },
    { name: 'Postre Gratis',   discountType: 'Gratis',        claimed: 32,  total: 50,  usagePercent: 64,  status: 'available' },
    { name: 'Lunch Especial',  discountType: '20% Descuento', claimed: 10,  total: 80,  usagePercent: 13,  status: 'available' },
    { name: 'Cumpleaños VIP',  discountType: 'Gratis',        claimed: 5,   total: 20,  usagePercent: 25,  status: 'expired'   },
  ];

  // ── Weekly chart ──
  weeklyData: WeeklyData[] = [
    { day: 'L',  dayKey: 'ANALYTICS.DAY_MON', validations: 12, rejections: 3  },
    { day: 'M',  dayKey: 'ANALYTICS.DAY_TUE', validations: 28, rejections: 5  },
    { day: 'X',  dayKey: 'ANALYTICS.DAY_WED', validations: 18, rejections: 2  },
    { day: 'J',  dayKey: 'ANALYTICS.DAY_THU', validations: 35, rejections: 8  },
    { day: 'V',  dayKey: 'ANALYTICS.DAY_FRI', validations: 45, rejections: 7  },
    { day: 'S',  dayKey: 'ANALYTICS.DAY_SAT', validations: 52, rejections: 4  },
    { day: 'D',  dayKey: 'ANALYTICS.DAY_SUN', validations: 30, rejections: 6  },
  ];

  chartMax = 0;

  // ── Donut chart ──
  totalClaimed   = 175;
  totalAvailable = 300;
  donutRadius = 52;
  donutCx = 64;
  donutCy = 64;
  donutStroke = 14;
  donutCircumference = 0;
  donutUsedDash = 0;
  donutFreeDash = 0;

  private animFrame: any;

  constructor(
    public router: Router,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.buildMetricCards();
    this.chartMax = Math.max(...this.weeklyData.map(d => d.validations + d.rejections));
    this.computeDonut();
  }

  ngAfterViewInit(): void {
    // Stagger bar animations via CSS variables
    document.querySelectorAll<HTMLElement>('.ad-bar-fill').forEach((el, i) => {
      el.style.setProperty('--delay', `${i * 0.06}s`);
    });
  }

  ngOnDestroy(): void {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  setPeriod(p: 'week' | 'month' | 'year'): void {
    this.activePeriod = p;
    // In production: re-fetch data for the selected period
    this.buildMetricCards();
    this.cd.detectChanges();
  }

  private buildMetricCards(): void {
    const multiplier = this.activePeriod === 'week' ? 0.25
      : this.activePeriod === 'month' ? 1 : 12;

    this.metricCards = [
      {
        key: 'active',
        labelKey: 'ANALYTICS.METRIC_ACTIVE_COUPONS',
        value: 3,
        subLabelKey: 'ANALYTICS.METRIC_ACTIVE_SUB',
        subValue: '5 total',
        trend: 0,
        icon: '🎟️',
        accentColor: 'gold'
      },
      {
        key: 'validated',
        labelKey: 'ANALYTICS.METRIC_VALIDATED',
        value: Math.round(220 * multiplier),
        subLabelKey: 'ANALYTICS.METRIC_VALIDATED_SUB',
        trend: 12,
        trendLabelKey: 'ANALYTICS.TREND_UP',
        icon: '✅',
        accentColor: 'green'
      },
      {
        key: 'rejected',
        labelKey: 'ANALYTICS.METRIC_REJECTED',
        value: Math.round(35 * multiplier),
        subLabelKey: 'ANALYTICS.METRIC_REJECTED_SUB',
        trend: -5,
        trendLabelKey: 'ANALYTICS.TREND_DOWN',
        icon: '❌',
        accentColor: 'red'
      },
      {
        key: 'recurring',
        labelKey: 'ANALYTICS.METRIC_RECURRING',
        value: Math.round(48 * multiplier),
        subLabelKey: 'ANALYTICS.METRIC_RECURRING_SUB',
        trend: 8,
        trendLabelKey: 'ANALYTICS.TREND_UP',
        icon: '👥',
        accentColor: 'secondary'
      }
    ];
  }

  private computeDonut(): void {
    this.donutCircumference = 2 * Math.PI * this.donutRadius;
    const ratio = this.totalClaimed / this.totalAvailable;
    this.donutUsedDash = this.donutCircumference * ratio;
    this.donutFreeDash = this.donutCircumference * (1 - ratio);
  }

  getBarHeight(d: WeeklyData): number {
    const total = d.validations + d.rejections;
    return Math.round((total / this.chartMax) * 100);
  }

  getValidationRatio(d: WeeklyData): number {
    const total = d.validations + d.rejections;
    if (!total) return 0;
    return Math.round((d.validations / total) * 100);
  }

  getUsagePercent(): number {
    return Math.round((this.totalClaimed / this.totalAvailable) * 100);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available': return 'status-available';
      case 'exhausted': return 'status-exhausted';
      case 'expired':   return 'status-expired';
      default: return '';
    }
  }

  getTrendClass(trend: number | undefined): string {
    if (!trend) return 'trend-neutral';
    return trend > 0 ? 'trend-up' : 'trend-down';
  }

  getTrendIcon(trend: number | undefined): string {
    if (!trend) return '–';
    return trend > 0 ? '↑' : '↓';
  }
}