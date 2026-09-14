import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class AdminLogin {

  // ==========================================
  // LOGIN FORM
  // ==========================================

  username: string = '';
  password: string = '';

  // ==========================================
  // LOGIN STATUS
  // ==========================================

  loading: boolean = false;

  // ==========================================
  // MESSAGE
  // ==========================================

  message: string = '';
  messageType: string = '';

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  login(): void {

    // Clear previous message
    this.message = '';
    this.messageType = '';

    // ========================================
    // USERNAME VALIDATION
    // ========================================

    if (!this.username.trim()) {

      this.message = 'Please enter admin username.';
      this.messageType = 'error';

      return;
    }

    // ========================================
    // PASSWORD VALIDATION
    // ========================================

    if (!this.password.trim()) {

      this.message = 'Please enter admin password.';
      this.messageType = 'error';

      return;
    }

    // ========================================
    // PREVENT MULTIPLE LOGIN REQUESTS
    // ========================================

    if (this.loading) {
      return;
    }

    this.loading = true;

    // ========================================
    // LOGIN DATA
    // ========================================

    const loginData = {
      username: this.username.trim(),
      password: this.password
    };

    // ========================================
    // CALL ADMIN LOGIN API
    // ========================================

    this.http.post<any>(
      'https://smart-food-ordering-system.onrender.com/api/auth/admin-login.php',
      loginData
    ).subscribe({

      // ======================================
      // API RESPONSE
      // ======================================

      next: (res) => {

        console.log('Admin login response:', res);

        this.loading = false;

        // ====================================
        // VALID ADMIN
        // ====================================

        if (res?.success === true) {

          // Save Admin ID
          localStorage.setItem(
            'adminId',
            String(res.admin_id)
          );

          // Save Admin Username
          localStorage.setItem(
            'adminUsername',
            res.username || this.username.trim()
          );

          // Save Admin Email
          localStorage.setItem(
            'adminEmail',
            res.email || ''
          );

          // Save Admin Login Status
          localStorage.setItem(
            'adminLoggedIn',
            'true'
          );

          // ==================================
          // OPEN ADMIN DASHBOARD
          // ==================================

          this.router.navigate(['/admin/dashboard']);

          return;
        }

        // ====================================
        // INVALID ADMIN
        // ====================================

        this.message =
          res?.message ||
          'Invalid admin username or password.';

        this.messageType = 'error';

      },

      // ======================================
      // API ERROR
      // ======================================

      error: (error) => {

        this.loading = false;

        console.error(
          'Admin login error:',
          error
        );

        this.message =
          error?.error?.message ||
          'Unable to connect to admin login API.';

        this.messageType = 'error';

      }

    });

  }

  // ==========================================
  // BACK TO USER LOGIN
  // ==========================================

  goToUserLogin(): void {

    this.router.navigate(['/login']);

  }

}