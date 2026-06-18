import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'expired' | 'reused';

export interface ValidationResult {
  status: ValidationStatus;
  couponName?: string;
  discountType?: string;
  discountValue?: string;
  customerName?: string;
  usedAt?: string;
  reason?: string;
}

@Component({
  selector: 'app-coupon-validation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './coupon-validation.html',
  styleUrl: './coupon-validation.css'
})
export class CouponValidationComponent implements OnInit, OnDestroy {

  codigoIngresado = '';
  validationResult: ValidationResult = { status: 'idle' };
  isScanning = false;
  scannerAvailable = false;
  private resetTimer: any;
  private videoStream: MediaStream | null = null;
  private scanInterval: any;

  // Mock data: simulate known codes for demo
  private mockCodes: Record<string, Omit<ValidationResult, 'status'> & { _status: ValidationStatus }> = {
    'VERANO-1234': {
      _status: 'valid',
      couponName: 'Promo Verano',
      discountType: '% Descuento',
      discountValue: '15% Descuento',
      customerName: 'María López'
    },
    'POSTRE-0099': {
      _status: 'reused',
      couponName: 'Postre Gratis',
      discountType: 'Gratis',
      discountValue: 'Gratis',
      customerName: 'Carlos Mendez',
      usedAt: '2025-06-12 14:35'
    },
    'MARTES-0050': {
      _status: 'expired',
      couponName: 'Martes Locos',
      discountType: 'NxM',
      discountValue: '2x1',
      customerName: 'Ana Torres',
      reason: 'Venció el 01/06/2025'
    }
  };

  constructor(
    public router: Router,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.checkCameraAvailability();
  }

  ngOnDestroy(): void {
    if (this.resetTimer) clearTimeout(this.resetTimer);
    if (this.scanInterval) clearInterval(this.scanInterval);
    this.stopCamera();
  }

  private async checkCameraAvailability(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.scannerAvailable = devices.some(d => d.kind === 'videoinput');
      this.cd.detectChanges();
    } catch {
      this.scannerAvailable = false;
    }
  }

  validarCodigo(): void {
    const code = this.codigoIngresado.trim().toUpperCase();
    if (!code) return;

    this.validationResult = { status: 'loading' };
    this.cd.detectChanges();

    // Simulate API call delay
    setTimeout(() => {
      this.ngZone.run(() => {
        const mock = this.mockCodes[code];
        if (mock) {
          const { _status, ...rest } = mock;
          this.validationResult = { status: _status, ...rest };
        } else {
          this.validationResult = {
            status: 'invalid',
            reason: this.translate.instant('VALIDATION.REASON_NOT_FOUND')
          };
        }
        this.cd.detectChanges();

        if (this.validationResult.status === 'valid') {
          this.scheduleReset(10000);
        }
      });
    }, 900);
  }

  resetValidation(): void {
    this.codigoIngresado = '';
    this.validationResult = { status: 'idle' };
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  async toggleScanner(): Promise<void> {
    if (this.isScanning) {
      this.stopCamera();
      this.isScanning = false;
      return;
    }

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      this.isScanning = true;
      this.cd.detectChanges();

      setTimeout(() => {
        const video = document.getElementById('qr-video') as HTMLVideoElement;
        if (video && this.videoStream) {
          video.srcObject = this.videoStream;
          video.play();
          this.startMockQrDetection();
        }
      }, 100);
    } catch {
      this.scannerAvailable = false;
      this.cd.detectChanges();
    }
  }

  private startMockQrDetection(): void {
    // In production: integrate a real QR library like @zxing/ngx-scanner
    // This mock auto-fills a demo code after 3 seconds of "scanning"
    this.scanInterval = setTimeout(() => {
      this.ngZone.run(() => {
        this.codigoIngresado = 'VERANO-1234';
        this.stopCamera();
        this.isScanning = false;
        this.cd.detectChanges();
      });
    }, 3000);
  }

  private stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(t => t.stop());
      this.videoStream = null;
    }
    if (this.scanInterval) {
      clearTimeout(this.scanInterval);
      this.scanInterval = null;
    }
  }

  private scheduleReset(ms: number): void {
    if (this.resetTimer) clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.resetValidation();
        this.cd.detectChanges();
      });
    }, ms);
  }

  get isResultPositive(): boolean {
    return this.validationResult.status === 'valid';
  }

  get isResultNegative(): boolean {
    return ['invalid', 'expired', 'reused'].includes(this.validationResult.status);
  }

  get canValidate(): boolean {
    return this.codigoIngresado.trim().length > 0 &&
      this.validationResult.status !== 'loading';
  }

  getStatusIcon(): string {
    switch (this.validationResult.status) {
      case 'valid':    return '✓';
      case 'invalid':
      case 'expired':
      case 'reused':   return '✕';
      default:         return '';
    }
  }

  getStatusKey(): string {
    switch (this.validationResult.status) {
      case 'valid':    return 'VALIDATION.STATUS_VALID';
      case 'invalid':  return 'VALIDATION.STATUS_INVALID';
      case 'expired':  return 'VALIDATION.STATUS_EXPIRED';
      case 'reused':   return 'VALIDATION.STATUS_REUSED';
      default:         return '';
    }
  }

  getReasonKey(): string {
    switch (this.validationResult.status) {
      case 'invalid':  return 'VALIDATION.REASON_INVALID';
      case 'expired':  return 'VALIDATION.REASON_EXPIRED';
      case 'reused':   return 'VALIDATION.REASON_REUSED';
      default:         return '';
    }
  }
}