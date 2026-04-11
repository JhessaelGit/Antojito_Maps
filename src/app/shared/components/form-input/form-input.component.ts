import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="input-group">
      <label [for]="id" *ngIf="label">{{ label }}</label>
      <input 
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [formControl]="control"
        [class.error]="control.invalid && control.touched"
      />
      <span class="error-msg" *ngIf="control.invalid && control.touched">
        Este campo es obligatorio o tiene un formato inválido.
      </span>
    </div>
  `,
  styleUrls: ['./form-input.css']
})
export class FormInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() control: FormControl = new FormControl();
}