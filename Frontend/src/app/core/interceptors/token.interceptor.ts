import {
 HttpInterceptor,
 HttpRequest,
 HttpHandler
} from '@angular/common/http';

import { Injectable } from '@angular/core';

@Injectable()
export class TokenInterceptor
implements HttpInterceptor {

 intercept(req:HttpRequest<any>,next:HttpHandler){

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  if(token){
   req=req.clone({
    setHeaders:{
      Authorization:`Bearer ${token}`
    }
   });
  }

  return next.handle(req);
 }
}