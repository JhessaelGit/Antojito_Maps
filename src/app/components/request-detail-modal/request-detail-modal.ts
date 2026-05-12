import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-detail-modal.html',
  styleUrl: './request-detail-modal.css'
})
export class RequestDetailModalComponent {

  @Input() request: any;

  @Output() close = new EventEmitter<void>();

  aceptar(): void {
    alert('Solicitud aceptada');
    this.close.emit();
  }

  rechazar(): void {
    alert('Solicitud rechazada');
    this.close.emit();
  }

  cerrar(): void {
    this.close.emit();
  }

}