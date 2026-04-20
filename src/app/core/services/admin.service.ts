import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminLoginResponse {
  adminId: string;
  uuid?: string;
  id?: string;
  mail: string;
  message?: string;
  validationErrors?: Record<string, string>;
}

export interface AdminMutationResponse {
  adminId?: string;
  uuid?: string;
  id?: string;
  mail?: string;
  message?: string;
  validationErrors?: Record<string, string>;
}

export interface AdminRecord {
  id?: string;
  adminId?: string;
  uuid?: string;
  mail: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface AdminRestaurant {
  id?: string;
  uuid?: string;
  name?: string;
  category?: string;
  isBlocked?: boolean;
  planSuscription?: string;
  planExpirationDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;
  private readonly jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  login(mail: string, password: string): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(
      `${this.baseUrl}/login`,
      { mail, password },
      { headers: this.jsonHeaders }
    );
  }

  createAdmin(mail: string, password: string): Observable<AdminMutationResponse> {
    return this.http.post<AdminMutationResponse>(
      `${this.baseUrl}/create`,
      { mail, password },
      { headers: this.jsonHeaders }
    );
  }

  editAdmin(mail: string, password: string): Observable<AdminMutationResponse> {
    return this.http.put<AdminMutationResponse>(
      `${this.baseUrl}/edit`,
      { mail, password },
      { headers: this.jsonHeaders }
    );
  }

  getAllAdmins(): Observable<AdminRecord[]> {
    return this.http.get<AdminRecord[]>(`${this.baseUrl}/all`);
  }

  getDeletedAdmins(): Observable<AdminRecord[]> {
    return this.http.get<AdminRecord[]>(`${this.baseUrl}/deleted`);
  }

  deleteAdmin(adminId: string): Observable<AdminMutationResponse> {
    return this.http.delete<AdminMutationResponse>(`${this.baseUrl}/delete/${adminId}`, {
      headers: this.jsonHeaders
    });
  }

  getRestaurants(): Observable<AdminRestaurant[]> {
    return this.http.get<AdminRestaurant[]>(`${this.baseUrl}/restaurants`);
  }

  updateRestaurantBlock(restaurantId: string, isBlocked: boolean): Observable<AdminMutationResponse> {
    return this.http.patch<AdminMutationResponse>(
      `${this.baseUrl}/restaurants/${restaurantId}/block`,
      { isBlocked },
      { headers: this.jsonHeaders }
    );
  }
}
