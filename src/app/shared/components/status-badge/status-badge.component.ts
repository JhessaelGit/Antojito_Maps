import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="type">
      {{ text | uppercase }}
    </span>
  `,
  styles: [`
    .badge {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-block;
      font-family: 'Inter', sans-serif;
    }
    .primary { background: #E6FFFA; color: #02332D; } /* Verde suave */
    .accent { background: #FFFBEB; color: #BF9861; }  /* Dorado suave */
    .info { background: #EBF8FF; color: #2B6CB0; }    /* Azul suave */
  `]
})
export class StatusBadgeComponent {
  @Input() text: string = '';
  @Input() type: 'primary' | 'accent' | 'info' = 'primary';
}