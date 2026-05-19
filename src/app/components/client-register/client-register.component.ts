import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-register.component.html',
  styleUrls: ['./client-register.component.css'],
})
export class ClientRegisterComponent {

  fullName: string = '';
  phone: string = '';
  email: string = '';
  password: string = '';
  showPassword = false;
  errorMsg: string = '';
  successMsg: string = '';
  cargando: boolean = false;
  submitted: boolean = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^[67]\d{6,7}$/.test(phone.trim());
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.phone = input.value;
  }

  register(): void {
    this.submitted = true;
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.fullName.trim() || !this.isValidPhone(this.phone) ||
        !this.isValidEmail(this.email) || this.password.length < 6) {
      this.errorMsg = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.cargando = true;
    this.clientService.registry(
      this.email.trim().toLowerCase(),
      this.password,
      this.fullName.trim(),
      this.phone.trim()
    ).subscribe({
      next: () => {
        this.cargando = false;
        this.successMsg = '¡Cuenta creada! Redirigiendo al mapa...';
        setTimeout(() => this.router.navigateByUrl(this.getReturnUrl(), { replaceUrl: true }), 1200);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'Error al crear la cuenta. Intenta de nuevo';
      }
    });
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') ? returnUrl : '/mapa';
  }
}
