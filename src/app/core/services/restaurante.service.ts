import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {

  private readonly BASE_URL = '/api';

  constructor(private http: HttpClient) {}

  // GET /restaurant/all
  getRestaurantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/restaurant/all`);
  }

  // GET /restaurant/get/{id}
  getRestauranteById(id: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/restaurant/get/${id}`);
  }

  // DELETE /restaurant/delete/{id}
  eliminarRestaurante(id: string): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/restaurant/delete/${id}`);
  }

  // POST /restaurant/create
  crearRestaurante(datos: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/restaurant/create`, datos);
  }

  // POST /restaurant/login
  login(mail: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/restaurant/login`, { mail, password });
  }

  // POST /restaurant/registry
  registro(mail: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/restaurant/registry`, { mail, password });
  }

  // POST /restaurant/logout
  logout(mail: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/restaurant/logout`, { mail });
  }
}