import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  email = '';
  password = '';
  loading = false;
  message = '';
  messageType = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Redirect already-logged-in users
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  login(): void {
    this.message = '';

    if (!this.email.trim()) {
      this.message = 'Please enter your email address.';
      this.messageType = 'error';
      return;
    }

    if (!this.password.trim()) {
      this.message = 'Please enter your password.';
      this.messageType = 'error';
      return;
    }

    this.loading = true;

    this.http.post<any>(
      `${environment.apiUrl}/auth/login.php`,
      { email: this.email.trim(), password: this.password }
    )
    .pipe(timeout(90000))
    .subscribe({

      next: (res) => {
        this.loading = false;

        if (res && res.success && res.user_id) {
          localStorage.setItem('userId', res.user_id);

          // Handle pending cart item added before login
          const pendingItem = localStorage.getItem('pendingCartItem');

          if (pendingItem) {
            try {
              const food = JSON.parse(pendingItem);
              const cartData = {
                user_id: res.user_id,
                food_id: food.id,
                quantity: 1,
                price: food.price
              };

              this.http.post<any>(
                `${environment.apiUrl}/cart/add-cart.php`,
                cartData
              )
              .pipe(timeout(15000))
              .subscribe({
                next: (cartRes) => {
                  localStorage.removeItem('pendingCartItem');
                  this.message = cartRes?.success
                    ? 'Login successful! Item added to your cart.'
                    : 'Login successful, but item could not be added to cart.';
                  this.messageType = cartRes?.success ? 'success' : 'error';
                  setTimeout(() => this.router.navigate(['/cart']), 500);
                },
                error: () => {
                  localStorage.removeItem('pendingCartItem');
                  this.message = 'Login successful, but item could not be added to cart.';
                  this.messageType = 'error';
                  setTimeout(() => this.router.navigate(['/home']), 1000);
                }
              });
            } catch {
              localStorage.removeItem('pendingCartItem');
              this.message = 'Login successful!';
              this.messageType = 'success';
              setTimeout(() => this.router.navigate(['/home']), 500);
            }
          } else {
            this.message = 'Login successful! Redirecting...';
            this.messageType = 'success';
            setTimeout(() => this.router.navigate(['/home']), 500);
          }
        } else {
          this.message = res?.message || 'Invalid email or password. Please check your details.';
          this.messageType = 'error';
        }
      },

      error: (err) => {
        this.loading = false;
        console.error('Login API Error:', err);

        if (err?.name === 'TimeoutError') {
          this.message = 'Server is taking too long. First request may take 30–60s. Please try again.';
        } else {
          this.message = 'Invalid email or password. Please check your details.';
        }
        this.messageType = 'error';
      }

    });
  }

  continueWithGoogle(): void {
    this.message = 'Google login is not configured yet. Please use email and password.';
    this.messageType = 'error';
  }

}