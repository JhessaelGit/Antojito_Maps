export interface Restaurante {
  id?: string;
  uuid?: string;
  nombre: string;
  name?: string; 
  categoria?: string;
  category?: string;
  latitud?: number;
  longitud?: number;
  latitude?: number;
  longitude?: number;
  descripcion?: string;
  description?: string;
}

export interface Promocion {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  fechaExpiracion: Date;
}