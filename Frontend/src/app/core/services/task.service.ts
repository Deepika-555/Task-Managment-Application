import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn:'root'
})
export class TaskService {

  constructor(private http: HttpClient){}

  getTasks(){
    return this.http.get(
      `${environment.apiUrl}/tasks`
    );
  }

  createTask(task:any){
    return this.http.post(
      `${environment.apiUrl}/tasks`,
      task
    );
  }

  updateTask(id:string,task:any){
    return this.http.put(
      `${environment.apiUrl}/tasks/${id}`,
      task
    );
  }

  deleteTask(id:string){
    return this.http.delete(
      `${environment.apiUrl}/tasks/${id}`
    );
  }
}