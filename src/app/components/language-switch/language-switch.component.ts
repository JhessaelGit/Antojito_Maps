import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-container">
      <button 
        (click)="switchLanguage('es')" 
        class="btn-lang" 
        [class.active]="translate.currentLang === 'es'">ES</button>
      <span class="divider">|</span>
      <button 
        (click)="switchLanguage('en')" 
        class="btn-lang" 
        [class.active]="translate.currentLang === 'en'">EN</button>
    </div>
  `,
  styles: [`
    .lang-container {
      position: fixed !important;
      top: 20px !important; 
      right: 20px !important; 
      z-index: 999999 !important;
      background: white; 
      padding: 10px 20px; 
      border-radius: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4); 
      display: flex !important;
      gap: 15px;
      align-items: center;
    }
    .btn-lang { 
      border: none; 
      background: none; 
      cursor: pointer; 
      font-weight: bold; 
      color: #02332D; 
      font-size: 16px;
      opacity: 0.5;
      transition: opacity 0.3s;
    }
    .btn-lang.active {
      opacity: 1; /* El idioma seleccionado se ve más fuerte */
      text-decoration: underline;
    }
    .divider { color: #ccc; }
  `]
})
export class LanguageSwitchComponent {
  constructor(public translate: TranslateService) {
    // Si por alguna razón no se ha detectado idioma, intentamos recuperar el guardado
    if (!this.translate.currentLang) {
      const saved = localStorage.getItem('userLang') || 'es';
      this.translate.use(saved);
    }
  }

  // Usamos una función para determinar si un idioma está activo
  isActive(lang: string): boolean {
    return this.translate.currentLang === lang;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang).subscribe({
      next: () => {
        localStorage.setItem('userLang', lang);
        console.log('Idioma cambiado exitosamente a:', lang);
      },
      error: (err) => {
        console.error('Error cargando el archivo JSON de idioma:', err);
      }
    });
  }
}