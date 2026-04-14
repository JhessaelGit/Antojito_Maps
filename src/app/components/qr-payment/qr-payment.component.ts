import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qr-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.css'],
})
export class QrPaymentComponent implements OnInit {

  plan: string = 'PREMIUM';
  precio: string = 'Bs 99';
  confirmando = false;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.plan   = nav.extras.state['plan']   || 'PREMIUM';
      this.precio = nav.extras.state['precio'] || 'Bs 99';
    }
  }

  ngOnInit(): void {
    if (!this.plan) {
      this.plan = localStorage.getItem('selected_plan') || 'PREMIUM';
    }
  }

  get qrUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=AntojitosMapsPago_${this.plan}_${this.precio}`;
  }

  pagoRealizado(): void {
    this.confirmando = true;
    localStorage.setItem('account_status', 'active');
    localStorage.setItem('selected_plan', this.plan);

    // Simula un breve procesamiento antes de redirigir
    setTimeout(() => {
      this.router.navigate(['/restaurant']);
    }, 1200);
  }

  volver(): void {
    this.router.navigate(['/payment']);
  }
}