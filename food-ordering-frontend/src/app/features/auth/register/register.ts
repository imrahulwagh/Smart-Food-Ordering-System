import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  // ==============================
  // FORM DATA
  // ==============================

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  // ==============================
  // STATUS
  // ==============================

  loading = false;

  message = '';
  messageType = '';

  // PHP REGISTER API
  apiUrl =
    'http://localhost:8000/api/auth/register.php';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ==============================
  // REGISTER USER
  // ==============================

  register(): void {

    // Clear old message
    this.message = '';
    this.messageType = '';

    // ==============================
    // FRONTEND VALIDATION
    // ==============================

    if (!this.name.trim()) {

      this.message =
        'Please enter your full name.';

      this.messageType = 'error';

      return;
    }

    if (!this.email.trim()) {

      this.message =
        'Please enter your email address.';

      this.messageType = 'error';

      return;
    }

    if (!this.phone.trim()) {

      this.message =
        'Please enter your mobile number.';

      this.messageType = 'error';

      return;
    }

    if (!/^[0-9]{10}$/.test(this.phone.trim())) {

      this.message =
        'Mobile number must contain 10 digits.';

      this.messageType = 'error';

      return;
    }

    if (!this.password) {

      this.message =
        'Please enter your password.';

      this.messageType = 'error';

      return;
    }

    if (this.password.length < 6) {

      this.message =
        'Password must be at least 6 characters.';

      this.messageType = 'error';

      return;
    }

    if (!this.confirmPassword) {

      this.message =
        'Please confirm your password.';

      this.messageType = 'error';

      return;
    }

    if (this.password !== this.confirmPassword) {

      this.message =
        'Password and Confirm Password do not match.';

      this.messageType = 'error';

      return;
    }

    // ==============================
    // DATA TO PHP
    // ==============================

    const registerData = {

      name: this.name.trim(),

      email: this.email.trim(),

      phone: this.phone.trim(),

      password: this.password,

      confirmPassword: this.confirmPassword

    };

    console.log(
      'Registration Data:',
      registerData
    );

    // ==============================
    // SEND TO PHP
    // ==============================

    this.loading = true;

    this.http.post<any>(
      this.apiUrl,
      registerData
    )
    .pipe(
      timeout(15000)
    )
    .subscribe({

      // ============================
      // SUCCESS
      // ============================

      next: (response) => {

        console.log(
          'Register API Response:',
          response
        );

        if (
          response &&
          response.success
        ) {

          console.log(
            'Registration successful'
          );

          this.message =
            'Account created successfully!';

          this.messageType =
            'success';

          // Clear form
          this.name = '';
          this.email = '';
          this.phone = '';
          this.password = '';
          this.confirmPassword = '';

          /*
           * Wait for a moment so user can
           * see success message.
           */

          setTimeout(() => {

            this.router.navigate([
              '/login'
            ]);

          }, 1500);

        }
        else {

          this.message =
            response?.message ||
            'Registration failed.';

          this.messageType =
            'error';
        }

        this.loading = false;

      },

      // ============================
      // ERROR
      // ============================

      error: (error) => {

        console.error(
          'Register API Error:',
          error
        );

        this.message =
          error?.error?.message ||
          'Could not create account. Please try again.';

        this.messageType =
          'error';

        this.loading = false;

      }

    });

  }

}