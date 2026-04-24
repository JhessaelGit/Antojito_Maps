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

      <span class="divider">|</span>

      <button 
        (click)="switchLanguage('pt')" 
        class="btn-lang" 
        [class.active]="translate.currentLang === 'pt'">PT</button>
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
      gap: 12px; /* Reduje un poco el gap para acomodar el tercero */
      align-items: center;
    }
    .btn-lang { 
      border: none; 
      background: none; 
      cursor: pointer; 
      font-weight: bold; 
      color: #02332D; 
      font-size: 15px; /* Ajuste sutil de tamaño */
      opacity: 0.5;
      transition: all 0.3s ease;
    }
    .btn-lang.active {
      opacity: 1; 
      color: #D4AF37; /* Un toque dorado para que resalte el activo */
      transform: scale(1.1);
    }
    .divider { color: #eee; font-weight: 200; }
  `]
})
export class LanguageSwitchComponent {
  constructor(public translate: TranslateService) {
    // Recuperar idioma guardado o usar español por defecto
    const saved = localStorage.getItem('userLang') || 'es';
    this.translate.use(saved);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang).subscribe({
      next: () => {
        localStorage.setItem('userLang', lang);
        console.log('Idioma cambiado a:', lang);
      },
      error: (err) => {
        console.error('Error al cargar pt.json. Asegúrate de que el archivo existe en assets/i18n/', err);
      }
    });
  }
}