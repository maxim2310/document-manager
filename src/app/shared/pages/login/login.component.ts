import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/authService.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NavigationService } from '../../../core/services/navService.service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    HeaderComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  hidePassword = signal(true);
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private navService: NavigationService
  ) {
    this.authService.logout();
    this.loginForm = this.fb.nonNullable.group({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.snackBar.open(
        'Invalid credentials, please check your input',
        'Close',
        { duration: 3000, panelClass: 'error' }
      );
      return;
    }

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: token => {
        this.snackBar.open('Login successful', 'Close', { duration: 3000 });
        this.navService.toManager();
      },
      error: err => {
        this.snackBar.open(
          `Error: ${err.error.message || 'Login failed'}`,
          'Close',
          { duration: 3000, panelClass: 'error' }
        );
      },
    });
  }
}
