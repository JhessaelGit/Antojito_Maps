import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoggerService } from './core/services/logger.service';
import { TranslateService } from '@ngx-translate/core'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {

  constructor(
    private router: Router,
    private logger: LoggerService,
    private translate: TranslateService 
  ) {
    this.initLanguage();
    this.trackNavigation();
    const savedLang = localStorage.getItem('userLang') || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(savedLang); // Esto aplica el idioma guardado a todas las páginas
  }

private initLanguage() {
  const savedLang = localStorage.getItem('userLang') || 'es';
  this.translate.setDefaultLang('es');
  this.translate.use(savedLang);
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