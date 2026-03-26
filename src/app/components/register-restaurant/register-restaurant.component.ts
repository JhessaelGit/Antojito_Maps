import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // 👈 agregar

@Component({
  selector: 'app-register-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-restaurant.component.html',
  styleUrls: ['./register-restaurant.component.css'],
})
export class RegisterRestaurantComponent {

  showPassword = false;

  name: string = '';
  email: string = '';
  password: string = '';

  errorName: string = '';
  errorEmail: string = '';
  errorPassword: string = '';

  constructor(private router: Router) {} // 👈 agregar

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  register() {
    this.clearErrors();

    let valid = true;

    if (!this.name.trim()) {
      this.errorName = 'El nombre es obligatorio';
      valid = false;
    }

    if (!this.email.includes('@')) {
      this.errorEmail = 'Correo inválido';
      valid = false;
    }

    if (this.password.length < 6) {
      this.errorPassword = 'Mínimo 6 caracteres';
      valid = false;
    }

    if (!valid) return;

    console.log('Registro válido');

    // 👉 después de registrar, vuelve al login
    this.router.navigate(['/restaurant/login']);
  }

  goToLogin() { // 👈 nuevo método
    this.router.navigate(['/restaurant/login']);
  }

  clearErrors() {
    this.errorName = '';
    this.errorEmail = '';
    this.errorPassword = '';
  }
}