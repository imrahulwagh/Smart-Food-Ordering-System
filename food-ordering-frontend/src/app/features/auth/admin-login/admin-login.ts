import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin implements OnInit {

  username: string = '';
  password: string = '';
  loading: boolean = false;
  message: string = '';
  messageType: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // If already logged in as admin, redirect to dashboard
    if (this.auth.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  login(): void {
    this.message = '';
    this.messageType = '';

    if (!this.username.trim()) {
      this.message = 'Please enter admin username.';
      this.messageType = 'error';
      return;
    }

    if (!this.password.trim()) {
      this.message = 'Please enter admin password.';
      this.messageType = 'error';
      return;
    }

    if (this.loading) return;

    this.loading = true;
    this.message = 'Authenticating...';
    this.messageType = 'info';

    this.http.post<any>(
      `${environment.apiUrl}/auth/admin-login.php`,
      { username: this.username.trim(), password: this.password }
    )
    .pipe(timeout(8000))
    .subscribe({

      next: (res) => {
        this.loading = false;
        this.message = '';

        if (res?.success === true) {
          sessionStorage.setItem('adminId', String(res.admin_id));
          sessionStorage.setItem('adminUsername', res.username || this.username.trim());
          sessionStorage.setItem('adminEmail', res.email || '');
          sessionStorage.setItem('adminLoggedIn', 'true');

          this.router.navigate(['/admin/dashboard']);
          return;
        }

        this.message = res?.message || 'Invalid admin username or password.';
        this.messageType = 'error';
      },

      error: (error) => {
        this.loading = false;
        console.error('Admin login error:', error);

        if (error?.name === 'TimeoutError') {
          this.message = 'Authentication timed out. Please check your credentials or retry.';
        } else if (error?.status === 0) {
          this.message = 'Cannot reach the server. Please check your connection.';
        } else {
          this.message = error?.error?.message || 'Invalid admin username or password.';
        }

        this.messageType = 'error';
      }

    });
  }

  goToUserLogin(): void {
    this.router.navigate(['/login']);
  }

}