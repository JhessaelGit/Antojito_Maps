import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-qr-payment',
  standalone: true,
  imports: [CommonModule, TranslateModule], // Importante añadir TranslateModule
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.css'],
})
export class QrPaymentComponent implements OnInit {

  plan: string | null = null;

  constructor(private router: Router) {
    // Intentamos obtener el plan del estado de la navegación
    const navigation = this.router.getCurrentNavigation();
    this.plan = navigation?.extras?.state?.['plan'] || null;
  }

  ngOnInit(): void {
    // Si por alguna razón no llega el plan por estado, 
    // podrías buscarlo en localStorage como respaldo
    if (!this.plan) {
      this.plan = localStorage.getItem('selected_plan');
    }
  }

  pagoRealizado() {
    // Aquí podrías guardar que el usuario ya es "Premium" en el storage 
    // antes de mandarlo al panel principal
    localStorage.setItem('account_status', 'active');
    
    // Navegamos al panel de restaurante
    this.router.navigate(['/restaurant']);
  }
}