import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  managers: any[] = [];
  teamLeads: any[] = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Employee', [Validators.required]],
      manager: [''],
      teamLead: ['']
    });
  }

  ngOnInit() {
    this.loadHelpers();

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });

    this.onRoleChange('Employee');
  }

  loadHelpers() {
    this.auth.getRegisterHelpers().subscribe({
      next: (res: any) => {
        this.managers = res.managers || [];
        this.teamLeads = res.teamLeads || [];
      },
      error: (err) => {
        console.error('Error loading registration helpers', err);
      }
    });
  }

  onRoleChange(role: string) {
    const managerCtrl = this.registerForm.get('manager');
    const teamLeadCtrl = this.registerForm.get('teamLead');

    if (role === 'Employee') {
      managerCtrl?.setValidators([Validators.required]);
      teamLeadCtrl?.setValidators([Validators.required]);
    } else if (role === 'TeamLead') {
      managerCtrl?.setValidators([Validators.required]);
      teamLeadCtrl?.clearValidators();
      teamLeadCtrl?.setValue('');
    } else {
      managerCtrl?.clearValidators();
      managerCtrl?.setValue('');
      teamLeadCtrl?.clearValidators();
      teamLeadCtrl?.setValue('');
    }

    managerCtrl?.updateValueAndValidity();
    teamLeadCtrl?.updateValueAndValidity();
  }

  submit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.auth.register(this.registerForm.value).subscribe({
      next: () => {
        alert('Registered Successfully!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}