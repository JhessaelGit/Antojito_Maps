import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatRequest {
  conversationId?: string;
  message: string;
  latitude?: number;
  longitude?: number;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly BASE_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  enviarMensaje(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.BASE_URL}/chat`, request);
  }
}