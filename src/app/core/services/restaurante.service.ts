import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurante } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {

  private API_URL = 'https://antogitomapsbackend-production.up.railway.app/api/restaurantes';

  constructor(private http: HttpClient) { }

  // Método para obtener la lista de restaurantes desde Java -> Supabase
  getRestaurantes(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  getRestauranteById(id: number): Observable<Restaurante> {
  return this.http.get<Restaurante>(`${this.API_URL}/get/${id}`);
  }
}