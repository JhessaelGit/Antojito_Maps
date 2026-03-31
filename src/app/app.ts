import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoggerService } from './core/services/logger.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // 👈 ESTO FALTABA
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {
    this.trackNavigation();
  }

  private trackNavigation() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.logger.info('Navegación', {
          url: event.urlAfterRedirects
        });
      });
  }
}