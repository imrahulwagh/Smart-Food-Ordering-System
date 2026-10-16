import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminSidebar
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard implements OnInit {

  // ==========================================
  // ADMIN DETAILS
  // ==========================================

  adminUsername: string = 'Admin';
  adminEmail: string = '';
  adminId: string = '';

  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  totalOrders: number = 0;
  totalRevenue: number = 0;
  pendingOrders: number = 0;
  preparingOrders: number = 0;
  deliveredOrders: number = 0;

  // ==========================================
  // RECENT ORDERS
  // ==========================================

  recentOrders: any[] = [];

  // ==========================================
  // UI STATE
  // ==========================================

  loading: boolean = true;
  errorMessage: string = '';

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  // ==========================================
  // PAGE LOAD
  // ==========================================

  ngOnInit(): void {
    this.adminUsername = this.auth.getAdminUsername();
    this.adminEmail = this.auth.getAdminEmail();
    this.adminId = this.auth.getAdminId() || '';

    this.getDashboardData();
  }

  // ==========================================
  // GET DASHBOARD DATA
  // ==========================================

  getDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      `${environment.apiUrl}/admin/get-dashboard.php`
    ).subscribe({

      next: (res) => {
        this.loading = false;

        if (res?.success === true) {
          this.totalOrders = Number(res.stats?.totalOrders || 0);
          this.totalRevenue = Number(res.stats?.totalRevenue || 0);
          this.pendingOrders = Number(res.stats?.pendingOrders || 0);
          this.preparingOrders = Number(res.stats?.preparingOrders || 0);
          this.deliveredOrders = Number(res.stats?.deliveredOrders || 0);
          this.recentOrders = Array.isArray(res.recentOrders)
            ? res.recentOrders
            : [];
        } else {
          this.errorMessage = res?.message || 'Unable to load dashboard data.';
          this.recentOrders = [];
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Dashboard API Error:', error);
        this.loading = false;
        this.recentOrders = [];
        this.errorMessage = 'Unable to connect to the dashboard API. The backend server may be starting up — please retry in a moment.';
        this.cdr.detectChanges();
      }

    });
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  formatDate(dateValue: any): string {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  formatCurrency(amount: any): string {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  // ==========================================
  // STATUS CLASS
  // ==========================================

  getStatusClass(status: string): string {
    if (!status) return 'status-pending';
    switch (status.toLowerCase()) {
      case 'pending':       return 'status-pending';
      case 'confirmed':     return 'status-confirmed';
      case 'preparing':     return 'status-preparing';
      case 'ready':         return 'status-ready';
      case 'out for delivery': return 'status-out';
      case 'delivered':     return 'status-delivered';
      case 'cancelled':
      case 'canceled':      return 'status-cancelled';
      default:              return 'status-pending';
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {
    this.auth.logoutAdmin();
  }

}