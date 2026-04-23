import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateRestaurantRequest {
  ownerMail: string;
  name: string;
  latitude: number;
  longitude: number;
  planSuscription: string;
  planExpirationDate: string;
  isBlocked: boolean;
  description: string;
  imagenUrl: string;
  category: string;
}

export interface UploadImageResponse {
  imageUrl: string;
}

export interface PromotionResponse {
  uuid: string;
  restaurantId: string;
  title: string;
  description?: string;
  percentDiscount: number;
  dateStartPromotion: string;
  dateEndPromotion: string;
  isActivePromotion: boolean;
}

export interface CreatePromotionRequest {
  ownerUuid?: string;
  ownerMail?: string;
  title: string;
  description?: string;
  percentDiscount: number;
  dateStartPromotion: string;
  dateEndPromotion: string;
  isActivePromotion?: boolean;
}

export interface RestaurantLoginResponse {
  ownerId: string;
  mail: string;
  restaurantIds: string[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {

  private readonly BASE_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // GET /restaurant/all
  getRestaurantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/restaurant/all`);
  }

  // GET /restaurant/get/{id}
  getRestauranteById(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/restaurant/get/${uuid}`);
  }

  // DELETE /restaurant/delete/{id}
  eliminarRestaurante(uuid: string): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/restaurant/delete/${uuid}`);
  }

  // POST /restaurant/create
  crearRestaurante(datos: CreateRestaurantRequest): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/restaurant/create`, datos);
  }

  // POST /restaurant/upload-image
  subirImagen(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<UploadImageResponse>(`${this.BASE_URL}/restaurant/upload-image`, formData);
  }

  // POST /restaurant/login
  login(mail: string, password: string): Observable<RestaurantLoginResponse> {
    return this.http.post<RestaurantLoginResponse>(`${this.BASE_URL}/restaurant/login`, { mail, password });
  }

  // POST /restaurant/registry
  registro(mail: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/restaurant/registry`, { mail, password });
  }

  // POST /restaurant/logout
  logout(mail: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/restaurant/logout`, { mail });
  }

  // GET /promotion/restaurant/{restaurantId}
  getPromocionesPorRestaurante(restaurantId: string): Observable<PromotionResponse[]> {
    return this.http.get<PromotionResponse[]>(`${this.BASE_URL}/promotion/restaurant/${restaurantId}`);
  }

  // POST /promotion/restaurant/{restaurantId}
  crearPromocion(restaurantId: string, payload: CreatePromotionRequest): Observable<PromotionResponse> {
    return this.http.post<PromotionResponse>(`${this.BASE_URL}/promotion/restaurant/${restaurantId}`, payload);
  }
}
