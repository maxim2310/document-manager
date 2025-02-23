import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRoleEnum } from '../../modules/RolesEnum';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/authService.service';
import { NavigationService } from '../../../core/services/navService.service';
import { HeaderComponent } from '../../components/header/header.component';

interface RegisterForm {
  email: FormControl<string>;
  password: AbstractControl<string>;
  fullName: AbstractControl<string>;
  role: AbstractControl<UserRoleEnum>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    HeaderComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private navService = inject(NavigationService);

  roles = Object.values(UserRoleEnum);
  hidePassword = signal(true);

  registerForm = this.fb.nonNullable.group<RegisterForm>({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    role: new FormControl(UserRoleEnum.USER, { nonNullable: true }),
  });

  constructor() {}

  onSubmit() {
    if (this.registerForm.invalid) {
      this.snackBar.open(
        'Please fill out all required fields correctly',
        'Close',
        { duration: 3000, panelClass: 'error' }
      );
      return;
    }

    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Registration successful', 'Close', {
          duration: 3000,
        });
        this.navService.toManager();
      },
      error: err =>
        this.snackBar.open(
          `Error: ${err.error.message || 'Registration failed'}`,
          'Close',
          { duration: 3000, panelClass: 'error' }
        ),
    });
  }
}
