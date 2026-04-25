import { Component, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';
import { CreateRestaurantRequest, RestauranteService, UploadImageResponse } from '../../core/services/restaurante.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, map, of, switchMap, throwError } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-register-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './register-restaurant.component.html',
  styleUrls: ['./register-restaurant.component.css'],
})
export class RegisterRestaurantComponent implements AfterViewInit, OnDestroy {

  name: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';
  description: string = '';
  category: string = '';
  latitude: number | null = null;
  longitude: number | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  showPassword = false;
  pinColocado = false;
  cargando = false;
  errorMsg: string = '';
  successMsg: string = '';

  errorName: string = '';
  errorEmail: string = '';
  errorPassword: string = '';
  errorCategory: string = '';
  errorImage: string = '';
  errorLocation: string = '';
  errorPhone: string = ''; // Nueva variable de error

  private map!: L.Map;
  private marker: L.Marker | null = null;

  private readonly CBBA_LAT = -17.3895;
  private readonly CBBA_LNG = -66.1568;
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private router: Router,
    private logger: LoggerService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private restauranteService: RestauranteService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 150);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  // BUG FIX: Filtrado de teléfono (solo números y max 8)
  validatePhone(event: any) {
    const value = event.target.value;
    this.phone = value.replace(/[^0-9]/g, '');
    if (this.phone.length > 8) {
      this.phone = this.phone.substring(0, 8);
    }
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
      html: `<div style="width:28px;height:28px;background:#7F1100;border:3px solid #BF9861;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(127,17,0,0.6);"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      className: '',
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        this.latitude = e.latlng.lat;
        this.longitude = e.latlng.lng;
        this.errorLocation = '';
        this.pinColocado = true;

        if (this.marker) {
          this.marker.setLatLng(e.latlng);
        } else {
          const popupTxt = this.translate.instant('REGISTER.YOUR_RESTAURANT');
          this.marker = L.marker(e.latlng, { icon: customIcon, draggable: true })
            .addTo(this.map)
            .bindPopup(`<b style="font-family:Inter,sans-serif;color:#02332D">${popupTxt}</b>`)
            .openPopup();

          this.marker.on('dragend', (ev: any) => {
            this.ngZone.run(() => {
              const pos = ev.target.getLatLng();
              this.latitude = pos.lat;
              this.longitude = pos.lng;
              this.pinColocado = true;
              this.errorLocation = '';
              this.cd.detectChanges();
            });
          });
        }

        this.cd.detectChanges();
        this.logger.info('Pin colocado', { lat: this.latitude, lng: this.longitude });
      });
    });
  }

  private processImage(file: File): void {
    if (!this.isAllowedImageType(file)) {
      this.errorImage = 'Solo se permiten imágenes JPG, PNG o WEBP';
      return;
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      this.errorImage = this.translate.instant('REGISTER.ERR_IMAGE_SIZE');
      return;
    }

    this.imageFile = file;
    this.errorImage = '';
    const reader = new FileReader();
    reader.onload = e => {
      this.imagePreview = e.target?.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  register(): void {
    this.clearErrors();
    this.errorMsg = '';
    this.successMsg = '';
    let valid = true;

    // Validación Nombre
    if (!this.name.trim()) {
      this.errorName = this.translate.instant('REGISTER.ERR_NAME');
      valid = false;
    }
    
    // Validación Categoría
    if (!this.category) {
      this.errorCategory = this.translate.instant('REGISTER.ERR_CAT');
      valid = false;
    }

    // BUG FIX: Validación Teléfono
    if (!this.phone || this.phone.length < 7) { // Mínimo 7 para Cochabamba, pero ajustado a tu lógica
        this.errorPhone = this.translate.instant('REGISTER.ERR_PHONE');
        valid = false;
    }

    // BUG FIX: Validación Correo Profesional
    const ownerMail = this.email.trim().toLowerCase();
    if (!this.isValidEmail(ownerMail)) {
      this.errorEmail = this.translate.instant('REGISTER.ERR_EMAIL');
      valid = false;
    }

    // BUG FIX: Validación Contraseña (Sin espacios y min 6)
    const cleanPassword = this.password.replace(/\s/g, ''); 
    if (cleanPassword.length < 6) {
      this.errorPassword = this.translate.instant('REGISTER.ERR_PASS');
      valid = false;
    }
    this.password = cleanPassword; // Sincronizamos la clave limpia

    // Validación Imagen
    if (!this.imageFile) {
      this.errorImage = this.translate.instant('REGISTER.ERR_IMAGE');
      valid = false;
    }

    // Validación Ubicación
    if (this.latitude === null || this.longitude === null) {
      this.errorLocation = this.translate.instant('REGISTER.ERR_LOC');
      valid = false;
    }

    if (!valid) return;

    this.cargando = true;
    this.restauranteService
      .registro(ownerMail, this.password)
      .pipe(
        catchError((err) => {
          if (this.isOwnerAlreadyExistsError(err)) {
            return of({ message: 'owner ya existe' });
          }
          return throwError(() => ({ stage: 'owner', err }));
        }),
        switchMap(() =>
          this.restauranteService.subirImagen(this.imageFile as File).pipe(
            catchError((err) => throwError(() => ({ stage: 'upload', err })))
          )
        ),
        switchMap((upload: UploadImageResponse) => {
          const imageUrl = `${upload?.imageUrl ?? ''}`.trim();
          const payload = this.buildCreatePayload(ownerMail, imageUrl);
          return this.restauranteService.crearRestaurante(payload).pipe(
              map((restaurant: any) => ({ restaurant, payload })),
              catchError((err) => throwError(() => ({ stage: 'create', err })))
            );
        }),
        finalize(() => {
          this.cargando = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: ({ restaurant, payload }) => {
          this.persistSession(ownerMail, payload, restaurant);
          this.router.navigate(['/payment']);
        },
        error: (failure) => {
          const stage = failure?.stage;
          const err = failure?.err ?? failure;
          this.errorMsg = this.resolveRegisterError(err, stage);
        }
      });
  }

  formatCoord(val: number | null): string {
    if (val === null) return this.translate.instant('REGISTER.COORD_UNDEFINED');
    return val.toFixed(6);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.processImage(input.files[0]);
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.processImage(file);
  }
  removeImage(event: Event): void {
    event.stopPropagation();
    this.imageFile = null;
    this.imagePreview = null;
  }
  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }
  goToLogin(): void { this.router.navigate(['/restaurant/login']); }
  private clearErrors(): void {
    this.errorName = this.errorEmail = this.errorPassword = this.errorCategory = this.errorImage = this.errorLocation = this.errorPhone = '';
  }

  private buildCreatePayload(ownerMail: string, imageUrl: string): CreateRestaurantRequest {
    const expiration = new Date();
    expiration.setFullYear(expiration.getFullYear() + 1);
    return {
      ownerMail,
      name: this.name.trim(),
      latitude: this.latitude as number,
      longitude: this.longitude as number,
      planSuscription: 'BASIC',
      planExpirationDate: expiration.toISOString().split('T')[0],
      isBlocked: false,
      description: this.description.trim() || 'Sin descripcion',
      imagenUrl: imageUrl,
      category: this.category
    };
  }

  private persistSession(ownerMail: string, payload: CreateRestaurantRequest, response: any): void {
    if (response?.uuid) {
      localStorage.setItem('restaurant_uuid', response.uuid);
    }
    localStorage.setItem('restaurant_email', ownerMail);
    localStorage.setItem('restaurant_name', payload.name);
  }

  private resolveRegisterError(err: any, stage?: string): string {
    const backendMsg = err?.error?.message;
    if (err?.status === 0) return 'No se pudo conectar con el servidor';
    return backendMsg || 'No se pudo completar el registro';
  }

  private isOwnerAlreadyExistsError(err: any): boolean {
    if (err?.status !== 400) return false;
    const message = `${err?.error?.message ?? ''}`.toLowerCase();
    return message.includes('ya existe') || message.includes('already exists');
  }

  private isAllowedImageType(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  // BUG FIX: Regex profesional para Email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  private hasValidCoordinates(): boolean {
    if (this.latitude === null || this.longitude === null) return false;
    return this.latitude >= -90 && this.latitude <= 90 && this.longitude >= -180 && this.longitude <= 180;
  }
}