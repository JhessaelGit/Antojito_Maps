import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-restaurant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-restaurant.component.html',
  styleUrls: ['./register-restaurant.component.css'],
})
export class RegisterRestaurantComponent {

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  register() {
    console.log('Registrando restaurante...');
    // lógica futura
  }
}