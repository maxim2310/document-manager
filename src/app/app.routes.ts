import { Routes } from '@angular/router';
import { RegisterComponent } from './shared/pages/register/register.component';
import { LoginComponent } from './shared/pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { DocumentManagerComponent } from './shared/pages/document-manager/document-manager.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'manager',
    component: DocumentManagerComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/documents', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
