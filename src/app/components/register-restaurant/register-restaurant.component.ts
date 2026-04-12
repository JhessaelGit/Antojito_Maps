import { Component, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x-red.png',
  iconUrl:       '/assets/marker-icon-red.png',
  shadowUrl:     '/assets/marker-shadow.png'
});

@Component({
  selector: 'app-register-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-restaurant.component.html',
  styleUrls: ['./register-restaurant.component.css'],
})
export class RegisterRestaurantComponent implements AfterViewInit, OnDestroy {

  name:         string = '';
  email:        string = '';
  password:     string = '';
  phone:        string = '';
  description:  string = '';
  category:     string = '';
  latitude:     number | null = null;
  longitude:    number | null = null;
  imageFile:    File | null = null;
  imagePreview: string | null = null;

  showPassword = false;
  pinColocado  = false;

  errorName:     string = '';
  errorEmail:    string = '';
  errorPassword: string = '';
  errorCategory: string = '';
  errorImage:    string = '';
  errorLocation: string = '';

  private map!:   L.Map;
  private marker: L.Marker | null = null;

  private readonly CBBA_LAT = -17.3895;
  private readonly CBBA_LNG = -66.1568;

  constructor(
    private router:  Router,
    private logger:  LoggerService,
    private ngZone:  NgZone,
    private cd:      ChangeDetectorRef  
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 150);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    this.map = L.map('register-map', {
      center: [this.CBBA_LAT, this.CBBA_LNG],
      zoom: 14,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    const customIcon = L.divIcon({
      html: `<div style="
        width:28px;height:28px;
        background:#7F1100;
        border:3px solid #BF9861;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(127,17,0,0.6);">
      </div>`,
      iconSize:   [28, 28],
      iconAnchor: [14, 28],
      className:  '',
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        this.latitude      = e.latlng.lat;
        this.longitude     = e.latlng.lng;
        this.errorLocation = '';
        this.pinColocado   = true;

        if (this.marker) {
          this.marker.setLatLng(e.latlng);
        } else {
          this.marker = L.marker(e.latlng, { icon: customIcon, draggable: true })
            .addTo(this.map)
            .bindPopup('<b style="font-family:Inter,sans-serif;color:#02332D">Tu restaurante</b>')
            .openPopup();

          this.marker.on('dragend', (ev: any) => {
            this.ngZone.run(() => {
              const pos      = ev.target.getLatLng();
              this.latitude  = pos.lat;
              this.longitude = pos.lng;
              this.cd.detectChanges();  
            });
          });
        }

        this.cd.detectChanges(); 
        this.logger.info('Pin colocado', { lat: this.latitude, lng: this.longitude });
      });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.processImage(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.processImage(file);
  }

  private processImage(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      this.errorImage = 'La imagen no puede superar los 5MB';
      return;
    }
    this.imageFile   = file;
    this.errorImage  = '';
    const reader     = new FileReader();
    reader.onload    = e => {
      this.imagePreview = e.target?.result as string;
      this.cd.detectChanges(); 
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.imageFile    = null;
    this.imagePreview = null;
    this.cd.detectChanges();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  register(): void {
    this.clearErrors();
    let valid = true;

    if (!this.name.trim()) {
      this.errorName = 'El nombre es obligatorio';
      valid = false;
    }
    if (!this.category) {
      this.errorCategory = 'Selecciona una categoría';
      valid = false;
    }
    if (!this.email.includes('@')) {
      this.errorEmail = 'Correo inválido';
      valid = false;
    }
    if (this.password.length < 6) {
      this.errorPassword = 'Mínimo 6 caracteres';
      valid = false;
    }
    if (!this.imageFile) {
      this.errorImage = 'Sube una foto de tu restaurante';
      valid = false;
    }
    if (this.latitude === null || this.longitude === null) {
      this.errorLocation = 'Coloca un pin en el mapa para indicar tu ubicación';
      valid = false;
    }

    if (!valid) {
      this.logger.warn('Registro fallido por validación');
      return;
    }

    this.logger.info('Registro válido', {
      name: this.name, category: this.category,
      lat: this.latitude, lng: this.longitude,
    });

    this.router.navigate(['/payment']);
  }

  goToLogin(): void {
    this.router.navigate(['/restaurant/login']);
  }

  formatCoord(val: number | null): string {
  if (val === null) return '— no definida —';
  return val.toFixed(6);
  }

  private clearErrors(): void {
    this.errorName     = '';
    this.errorEmail    = '';
    this.errorPassword = '';
    this.errorCategory = '';
    this.errorImage    = '';
    this.errorLocation = '';
  }
}