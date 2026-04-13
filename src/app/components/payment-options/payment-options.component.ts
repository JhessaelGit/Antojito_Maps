import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.css'],
})
export class PaymentOptionsComponent {

  constructor(private router: Router) {}

  seleccionar(plan: string) {
    // Enviamos el plan al siguiente componente (QR)
    this.router.navigate(['/payment/qr'], { state: { plan } });
  }
}