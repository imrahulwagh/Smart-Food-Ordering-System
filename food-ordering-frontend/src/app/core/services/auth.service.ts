import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  // ==========================================
  // CUSTOMER AUTH
  // ==========================================

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  logoutCustomer(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('pendingCartItem');
    this.router.navigate(['/login']);
  }

  // ==========================================
  // ADMIN AUTH
  // ==========================================

  isAdminLoggedIn(): boolean {
    return localStorage.getItem('adminLoggedIn') === 'true' &&
      !!localStorage.getItem('adminId');
  }

  getAdminId(): string | null {
    return localStorage.getItem('adminId');
  }

  getAdminUsername(): string {
    return localStorage.getItem('adminUsername') || 'Admin';
  }

  getAdminEmail(): string {
    return localStorage.getItem('adminEmail') || '';
  }

  logoutAdmin(): void {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');
    this.router.navigate(['/admin-login']);
  }
}
