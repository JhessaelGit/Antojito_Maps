import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [className]="'btn-' + variant" 
      [class.full-width]="fullWidth"
      [disabled]="disabled || loading"
      (click)="clicked.emit()">
      <span *ngIf="loading" class="spinner"></span>
      <span *ngIf="!loading">{{ label }}</span>
    </button>
  `,
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'outline' = 'primary';
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Output() clicked = new EventEmitter<void>();
}