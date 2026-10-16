import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {
    // Purge legacy persistent keys so opening a new tab/window never auto-authenticates
    try {
      localStorage.removeItem('userId');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('pendingCartItem');
    } catch (e) {
      // Storage access blocked or restricted
    }
  }

  // ==========================================
  // CUSTOMER AUTH (Session-based)
  // ==========================================

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userId');
  }

  getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  logoutCustomer(): void {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('pendingCartItem');
    sessionStorage.removeItem('cart');
    localStorage.removeItem('userId');
    localStorage.removeItem('pendingCartItem');
    this.router.navigate(['/login']);
  }

  // ==========================================
  // ADMIN AUTH (Session-based)
  // ==========================================

  isAdminLoggedIn(): boolean {
    return sessionStorage.getItem('adminLoggedIn') === 'true' &&
      !!sessionStorage.getItem('adminId');
  }

  getAdminId(): string | null {
    return sessionStorage.getItem('adminId');
  }

  getAdminUsername(): string {
    return sessionStorage.getItem('adminUsername') || 'Admin';
  }

  getAdminEmail(): string {
    return sessionStorage.getItem('adminEmail') || '';
  }

  logoutAdmin(): void {
    sessionStorage.removeItem('adminId');
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');
    this.router.navigate(['/admin-login']);
  }
}

