import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 👈 agregar

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-login.component.html',
  styleUrls: ['./restaurant-login.component.css'],
})
export class RestaurantLoginComponent {
  
  showPassword = false;

  constructor(private router: Router) {} // 👈 agregar

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    console.log('Iniciando sesión en Antojitos Maps...');
  }

  goToRegister() { 
    this.router.navigate(['/restaurant/register']);
  }
}