import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService} from '../../core/services/logger.service';
import { TranslateModule } from '@ngx-translate/core'; // IMPORTANTE

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule], // AGREGADO AQUÍ
  templateUrl: './restaurant-login.component.html',
  styleUrls: ['./restaurant-login.component.css'],
})
export class RestaurantLoginComponent {

  showPassword = false;
  email: string = '';
  password: string = '';

  constructor(
    public router: Router,
    private logger: LoggerService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.logger.info('Toggle password visibility', {
      visible: this.showPassword
    });
  }

  login() {
    this.logger.info('Intento de login');
    const success = true; 

    if (success) {
      this.logger.info('Login exitoso', {
        email: this.email
      });
      this.router.navigate(['/restaurant']);
    } else {
      this.logger.error('Login fallido');
    }
  }

  goToRegister() {
    this.logger.info('Navegación a registro de restaurante');
    this.router.navigate(['/restaurant/register']);
  }
}