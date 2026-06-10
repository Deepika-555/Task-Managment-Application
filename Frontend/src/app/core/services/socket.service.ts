import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor() {
    if (typeof window !== 'undefined') {
      const socketUrl =
        environment.apiUrl.replace('/api', '');

      this.socket = io(socketUrl, {
        transports: ['websocket'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log(
          'Socket Connected:',
          this.socket.id
        );
      });

      this.socket.on('disconnect', () => {
        console.log(
          'Socket Disconnected'
        );
      });
    }
  }

  onTaskUpdated(): Observable<any> {
    return new Observable(observer => {

      const handler = (data: any) => {
        console.log(
          'Task Socket Event:',
          data
        );

        observer.next(data);
      };

      this.socket.on(
        'taskUpdated',
        handler
      );

      return () => {
        this.socket.off(
          'taskUpdated',
          handler
        );
      };
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}