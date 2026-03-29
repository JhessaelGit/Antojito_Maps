import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.css'],
})
export class PaymentOptionsComponent {

  constructor(private router: Router) {}

  seleccionar(plan: string) {
    this.router.navigate(['/payment/qr'], { state: { plan } });
  }
}