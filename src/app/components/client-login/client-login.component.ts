import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-login.component.html',
  styleUrls: ['./client-login.component.css'],
})
export class ClientLoginComponent {

  showPassword = false;
  email: string = '';
  password: string = '';
  errorMsg: string = '';
  cargando: boolean = false;

  constructor(
    public router: Router,
    private clientService: ClientService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  login(): void {
    this.errorMsg = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMsg = 'Correo electrónico inválido';
      return;
    }

    this.cargando = true;
    this.clientService.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/mapa'], { replaceUrl: true });
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'Correo o contraseña incorrectos';
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/client/register']);
  }
}
