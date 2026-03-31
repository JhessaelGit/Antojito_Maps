import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qr-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.css'],
})
export class QrPaymentComponent {

  plan: string | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.plan = navigation?.extras?.state?.['plan'] || null;
  }

  pagoRealizado() {
    this.router.navigate(['/restaurant']);
  }
}