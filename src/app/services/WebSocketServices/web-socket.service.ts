import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Client, Stomp } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private stompClient!: Client;
  private statusUpdateSubject = new Subject<{ songId: number; status: string }>();
  private baseUrl = environment.wsUrl; 

  constructor() {
    this.connect();
  }

  connect(): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const socket = new SockJS(`${this.baseUrl}/ws`); 
    this.stompClient = Stomp.over(() => socket); // Factory để hỗ trợ reconnect

    this.stompClient.configure({
      reconnectDelay: 5000, // Thử lại sau 5 giây nếu thất bại
      debug: (str) => console.log('STOMP Debug:', str), // Log chi tiết
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket connected successfully to', `${this.baseUrl}/ws`);
      this.stompClient.subscribe('/topic/song-status', (message) => {
        console.log('Received WebSocket message:', message.body);
        const statusUpdate: { songId: number; status: string } = JSON.parse(message.body);
        this.statusUpdateSubject.next(statusUpdate);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket STOMP error:', frame);
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('WebSocket connection error:', error);
    };

    this.stompClient.activate();
  }

  getStatusUpdates(): Observable<{ songId: number; status: string }> {
    return this.statusUpdateSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('WebSocket disconnected');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}