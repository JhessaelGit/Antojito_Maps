import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientSessionService } from './client-session.service';

export interface ChatRequest {
  message: string;
  latitude?: number;
  longitude?: number;
}

export interface ChatResponse {
  conversationId: string;
  reply: string;
}

export interface ConversationHistory {
  conversationId: string;
  createdAt: string;
  messages: {
    role: string;
    content: string;
    timestamp: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly BASE_URL = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private clientSession: ClientSessionService
  ) {}

  private buildHeaders(): { headers?: HttpHeaders } {
    const clientId = this.clientSession.getClientId();
    if (clientId) {
      return { headers: new HttpHeaders({ 'X-Client-Id': clientId }) };
    }
    return {};
  }

  enviarMensaje(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.BASE_URL}/chat`, request, this.buildHeaders());
  }

  obtenerHistorial(): Observable<ConversationHistory> {
    const clientId = this.clientSession.getClientId();
    if (!clientId) {
      return EMPTY;
    }
    const headers = new HttpHeaders({ 'X-Client-Id': clientId });
    return this.http.get<ConversationHistory>(`${this.BASE_URL}/chat/history`, { headers });
  }
}