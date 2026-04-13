import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() variant: 'restaurant' | 'promotion' | 'info' = 'info';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() imageUrl: string = '';
  @Input() badgeText: string = '';
  @Input() showActions: boolean = false; // Controla si aparecen botones de editar/borrar
  
  @Output() cardClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();
}