import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="btn-close" (click)="closeModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <ng-content></ng-content>
        </div>

      </div>
    </div>
  `,
  styleUrls: ['./modal.css']
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Título del Modal';
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}