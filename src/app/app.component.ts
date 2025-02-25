import { Component, effect, OnInit } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserService } from './core/services/user.service';
import { AuthService } from './core/services/authService.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    effect(() => {      
      if (!!this.authService.accessTokenSignal()) {
        this.userService.getUser().subscribe({
          error: e => {
            this.snackBar.open(
              `Error: ${e.error.message || 'Registration failed'}`,
              'Close',
              { duration: 3000, panelClass: 'error' }
            );
          },
        });
      }
    })
  }

  ngOnInit(): void {

  }
}
