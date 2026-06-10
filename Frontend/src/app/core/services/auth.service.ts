import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  register(data:any){
    return this.http.post(
      `${environment.apiUrl}/auth/register`,
      data
    );
  }

  getRegisterHelpers(){
    return this.http.get(
      `${environment.apiUrl}/auth/register-helpers`
    );
  }

  login(data:any){
    return this.http.post(
      `${environment.apiUrl}/auth/login`,
      data
    );
  }

  saveToken(token:string){
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token',token);
    }
  }

  saveUser(role: string, username: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
    }
  }

  getToken(){
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  getRole(){
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('role');
    }
    return null;
  }

  getUsername(){
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('username');
    }
    return null;
  }

  logout(){
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  }
}