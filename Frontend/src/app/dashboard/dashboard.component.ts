import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { TaskService } from '../core/services/task.service';
import { UserService } from '../core/services/user.service';
import { SocketService } from '../core/services/socket.service';
import { Task } from '../models/task';
import { User } from '../models/user';
import { Subscription } from 'rxjs';
import { MatSnackBarModule,MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MatSnackBarModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  username: string = '';
  role: string = '';
  currentUserId: string = '';

  tasks: any[] = [];
  filteredTasks: any[] = [];
  users: User[] = [];

  showFormModal: boolean = false;
  editingTask: any = null;
  taskForm: FormGroup;
  selectedFilter: 'All' | 'Pending' | 'Completed' = 'All';

  // Stats
  totalCount: number = 0;
  pendingCount: number = 0;
  completedCount: number = 0;

  private socketSub!: Subscription;

  constructor(
    private auth: AuthService,
    private taskService: TaskService,
    private userService: UserService,
    private socketService: SocketService,
    private fb: FormBuilder,
    private router: Router,
  private snackBar: MatSnackBar

  ) {
    this.username = this.auth.getUsername() || '';
    this.role = this.auth.getRole() || '';
    if (typeof localStorage !== 'undefined') {
      this.currentUserId = localStorage.getItem('userId') || '';
    }

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      assignedTo: [''],
      status: ['Pending']
    });
  }

  ngOnInit() {
    this.loadTasks();
    if (this.role === 'Manager' || this.role === 'TeamLead') {
      this.loadUsers();
    }
    this.setupSocketConnection();
  }

ngOnDestroy() {
  if (this.socketSub) {
    this.socketSub.unsubscribe();
  }
}
setupSocketConnection() {
  this.socketSub = this.socketService
    .onTaskUpdated()
    .subscribe({
      next: (data: any) => {

        console.log(
          'Socket Event Received:',
          data
        );

        switch (data.action) {

          case 'create':

            if (
              !this.tasks.some(
                t => t._id === data.task._id
              ) &&
              this.canSeeTask(data.task)
            ) {

              this.tasks = [
                data.task,
                ...this.tasks
              ];
            }

            break;

case 'update':

  const index = this.tasks.findIndex(
    t => t._id === data.task._id
  );

  if (index !== -1) {

    this.tasks[index] =
      data.task;

  } else if (
    this.canSeeTask(
      data.task
    )
  ) {

    this.tasks.push(
      data.task
    );
  }

  break;

          case 'delete':

            this.tasks = this.tasks.filter(
              t => t._id !== data.taskId
            );

            break;
        }

        this.filterTasks();
      },
      error: (err) => {
        console.error(
          'Socket Error:',
          err
        );
      }
    });
}

  canSeeTask(task: any): boolean {
    if (this.role === 'Manager') {
      return true;
    }
    const assigneeId = task.assignedTo?._id || task.assignedTo;
    if (this.role === 'TeamLead') {
      return assigneeId === this.currentUserId || this.users.some(u => u._id === assigneeId);
    }
    // Employee
    return assigneeId === this.currentUserId;
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (res: any) => {
        this.tasks = res || [];
        this.filterTasks();
      },
      error: (err) => {
        console.error('Error fetching tasks', err);
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res || [];
        // Add self to assignees list so Team Lead can assign to self
        if (this.role === 'TeamLead' && !this.users.some(u => u._id === this.currentUserId)) {
          this.users.unshift({
            _id: this.currentUserId,
            username: `${this.username} (Self)`,
            email: '',
            role: 'TeamLead'
          });
        }
      },
      error: (err) => {
        console.error('Error fetching users', err);
      }
    });
  }

  filterTasks() {
    if (this.selectedFilter === 'All') {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(
        t => t.status === this.selectedFilter
      );
    }
    this.calculateStats();
  }

  calculateStats() {
    this.totalCount = this.tasks.length;
    this.pendingCount = this.tasks.filter(t => t.status === 'Pending').length;
    this.completedCount = this.tasks.filter(t => t.status === 'Completed').length;
  }

  setFilter(filter: 'All' | 'Pending' | 'Completed') {
    this.selectedFilter = filter;
    this.filterTasks();
  }

  openCreateModal() {
    this.editingTask = null;
    this.taskForm.reset({
      title: '',
      description: '',
      assignedTo: this.role === 'Employee' ? this.currentUserId : '',
      status: 'Pending'
    });

    if (this.role === 'Employee') {
      this.taskForm.get('assignedTo')?.clearValidators();
    } else {
      this.taskForm.get('assignedTo')?.setValidators([Validators.required]);
    }
    this.taskForm.get('assignedTo')?.updateValueAndValidity();

    this.showFormModal = true;
  }

  openEditModal(task: any) {
    this.editingTask = task;
    const assigneeId = task.assignedTo?._id || task.assignedTo || '';
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      assignedTo: assigneeId,
      status: task.status
    });

    if (this.role === 'Employee') {
      this.taskForm.get('assignedTo')?.clearValidators();
    } else {
      this.taskForm.get('assignedTo')?.setValidators([Validators.required]);
    }
    this.taskForm.get('assignedTo')?.updateValueAndValidity();

    this.showFormModal = true;
  }

  closeModal() {
    this.showFormModal = false;
  }

saveTask() {

  if (this.taskForm.invalid) {
    this.taskForm.markAllAsTouched();
    return;
  }

  const payload = this.taskForm.value;

  if (this.editingTask) {

    this.taskService
      .updateTask(
        this.editingTask._id,
        payload
      )
      .subscribe({
        next: () => {

          this.closeModal();

          this.snackBar.open(
            'Task updated successfully',
            'Success',
            {
              duration: 3000,        horizontalPosition: 'right',
    verticalPosition: 'top'
            }
          );
        },

        error: (err) => {

          this.snackBar.open(
            err.error?.message ||
            'Error updating task',
            'Error',
            {
              duration: 3000,
                      horizontalPosition: 'right',
    verticalPosition: 'top'
            }
          );
        }
      });

  } else {

    this.taskService
      .createTask(payload)
      .subscribe({
        next: () => {

          this.closeModal();

          this.taskForm.reset({
            title: '',
            description: '',
            assignedTo: '',
            status: 'Pending'
          });

          this.snackBar.open(
            'Task created successfully',
            'Success',
            {
              duration: 3000,
              horizontalPosition: 'right',
    verticalPosition: 'top'
            }
          );
        },

        error: (err) => {

          this.snackBar.open(
            'Error creating task',
            'Error',
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }
          );
        }
      });
  }
}
toggleTaskStatus(task: any) {

  const nextStatus =
    task.status === 'Completed'
      ? 'Pending'
      : 'Completed';

  const payload = {
    title: task.title,
    description: task.description,
    status: nextStatus,
    assignedTo:
      task.assignedTo?._id ||
      task.assignedTo
  };

  this.taskService
    .updateTask(task._id, payload)
    .subscribe({
      next: () => {

        this.snackBar.open(
          `Task marked as ${nextStatus}`,
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          }
        );

        // NO loadTasks()
      },

      error: (err) => {

        this.snackBar.open(
          err.error?.message ||
          'Error updating task',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          }
        );
      }
    });
}

deleteTask(id: string) {

  if (
    !confirm(
      'Are you sure you want to delete this task?'
    )
  ) {
    return;
  }

  this.taskService
    .deleteTask(id)
    .subscribe({
      next: () => {

        this.snackBar.open(
          'Task deleted successfully',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          }
        );

        // NO loadTasks()
      },

      error: (err) => {

        this.snackBar.open(
          err.error?.message ||
          'Error deleting task',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          }
        );
      }
    });
}

  hasTasksForUser(user: User): boolean {
    if (!user._id) return false;
    return this.tasks.some(t => {
      const assigneeId = t.assignedTo?._id || t.assignedTo;
      return assigneeId === user._id;
    });
  }

logout() {

  this.socketService.disconnect();

  this.auth.logout();

  this.router.navigate([
    '/login'
  ]);
}
}


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Subscription } from 'rxjs';

// import { AuthService } from '../core/services/auth.service';
// import { TaskService } from '../core/services/task.service';
// import { UserService } from '../core/services/user.service';
// import { SocketService } from '../core/services/socket.service';
// import { User } from '../models/user';
// import { MatSnackBar } from '@angular/material/snack-bar';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   templateUrl: './dashboard.component.html'
// })
// export class DashboardComponent implements OnInit, OnDestroy {

//   username = '';
//   role = '';
//   currentUserId = '';

//   tasks: any[] = [];
//   filteredTasks: any[] = [];
//   users: User[] = [];

//   selectedFilter: 'All' | 'Pending' | 'Completed' = 'All';

//   showFormModal = false;
//   editingTask: any = null;
//   taskForm: FormGroup;

//   totalCount = 0;
//   pendingCount = 0;
//   completedCount = 0;

//   private socketSub!: Subscription;

//   constructor(
//     private auth: AuthService,
//     private taskService: TaskService,
//     private userService: UserService,
//     private socketService: SocketService,
//     private fb: FormBuilder,
//     private router: Router,
//     private snackBar: MatSnackBar
//   ) {

//     this.username = this.auth.getUsername() || '';
//     this.role = this.auth.getRole() || '';
//     this.currentUserId = localStorage.getItem('userId') || '';

//     this.taskForm = this.fb.group({
//       title: ['', [Validators.required, Validators.minLength(3)]],
//       description: [''],
//       assignedTo: [''],
//       status: ['Pending']
//     });
//   }

//   ngOnInit() {
//     this.loadTasks();

//     if (this.role !== 'Employee') {
//       this.loadUsers();
//     }

//     this.listenSocket();
//   }

//   ngOnDestroy() {
//     this.socketSub?.unsubscribe();
//   }

//   // ================= SOCKET =================
//   listenSocket() {
//     this.socketSub = this.socketService.onTaskUpdated()
//       .subscribe((data: any) => {

//         if (data.action === 'create') {
//           this.tasks = [data.task, ...this.tasks];
//         }

//         if (data.action === 'update') {
//           this.tasks = this.tasks.map(t =>
//             t._id === data.task._id ? data.task : t
//           );
//         }

//         if (data.action === 'delete') {
//           this.tasks = this.tasks.filter(t => t._id !== data.taskId);
//         }

//         this.applyUI();
//       });
//   }

//   // ================= LOAD DATA =================
//   loadTasks() {
//     this.taskService.getTasks().subscribe({
//       next: (res: any) => {
//         this.tasks = res || [];
//         this.applyUI();
//       }
//     });
//   }

//   loadUsers() {
//     this.userService.getUsers().subscribe({
//       next: (res: any) => {
//         this.users = res || [];
//       }
//     });
//   }

//   // ================= UI SYNC (IMPORTANT) =================
//   applyUI() {
//     this.filterTasks();
//     this.calculateStats();
//   }

//   filterTasks() {
//     if (this.selectedFilter === 'All') {
//       this.filteredTasks = [...this.tasks];
//     } else {
//       this.filteredTasks = this.tasks.filter(t => t.status === this.selectedFilter);
//     }
//   }

//   calculateStats() {
//     this.totalCount = this.tasks.length;
//     this.pendingCount = this.tasks.filter(t => t.status === 'Pending').length;
//     this.completedCount = this.tasks.filter(t => t.status === 'Completed').length;
//   }

//   setFilter(filter: any) {
//     this.selectedFilter = filter;
//     this.applyUI();
//   }

//   // ================= CREATE =================
//   saveTask() {
//     if (this.taskForm.invalid) return;

//     const payload = this.taskForm.value;

//     if (this.editingTask) {

//       this.taskService.updateTask(this.editingTask._id, payload)
//         .subscribe({
//           next: (res: any) => {

//             this.updateLocal(res?.task || { ...this.editingTask, ...payload });

//             this.closeModal();

//             this.toast('Task updated');
//           }
//         });

//     } else {

//       this.taskService.createTask(payload)
//         .subscribe({
//           next: (res: any) => {

//             this.tasks = [res?.task, ...this.tasks];

//             this.applyUI();

//             this.closeModal();

//             this.toast('Task created');
//           }
//         });
//     }
//   }

//   // ================= TOGGLE =================
//   toggleTaskStatus(task: any) {

//     const updated = {
//       ...task,
//       status: task.status === 'Completed' ? 'Pending' : 'Completed'
//     };

//     this.taskService.updateTask(task._id, updated)
//       .subscribe({
//         next: () => {
//           this.updateLocal(updated);
//           this.toast('Status updated');
//         }
//       });
//   }

//   // ================= DELETE =================
//   deleteTask(id: string) {

//     this.taskService.deleteTask(id)
//       .subscribe({
//         next: () => {
//           this.tasks = this.tasks.filter(t => t._id !== id);
//           this.applyUI();
//           this.toast('Deleted');
//         }
//       });
//   }

//   // ================= UPDATE HELPERS =================
//   updateLocal(task: any) {
//     const i = this.tasks.findIndex(t => t._id === task._id);

//     if (i !== -1) this.tasks[i] = task;

//     this.applyUI();
//   }

//   // ================= MODAL =================
//   openCreateModal() {
//     this.editingTask = null;
//     this.showFormModal = true;
//     this.taskForm.reset({ status: 'Pending' });
//   }

//   openEditModal(task: any) {
//     this.editingTask = task;
//     this.showFormModal = true;

//     this.taskForm.patchValue(task);
//   }

//   closeModal() {
//     this.showFormModal = false;
//   }

//   // ================= UTILS =================
//   toast(msg: string) {
//     this.snackBar.open(msg, 'OK', {
//       duration: 2000,
//       horizontalPosition: 'right',
//       verticalPosition: 'top'
//     });
//   }

//   logout() {
//     this.socketService.disconnect();
//     this.auth.logout();
//     this.router.navigate(['/login']);
//   }
// }