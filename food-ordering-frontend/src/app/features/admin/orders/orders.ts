import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    AdminSidebar
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  adminUsername: string = 'Admin';
  adminEmail: string = 'admin@gmail.com';

  orders: any[] = [];

  loading: boolean = true;
  errorMessage: string = '';

  selectedStatus: string = 'All';

  statusList: string[] = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const savedUsername =
      localStorage.getItem('adminUsername');

    const savedEmail =
      localStorage.getItem('adminEmail');

    if (savedUsername) {
      this.adminUsername = savedUsername;
    }

    if (savedEmail) {
      this.adminEmail = savedEmail;
    }

    this.getOrders();
  }


  // ==========================================
  // GET ALL ORDERS
  // ==========================================

  getOrders(): void {

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      'http://localhost:8000/api/admin/get-orders.php'
    ).subscribe({

      next: (res) => {

        console.log(
          'Orders API response:',
          res
        );

        this.loading = false;

        if (res && res.success === true) {

          this.orders = Array.isArray(res.orders)
            ? res.orders
            : [];

        } else {

          this.orders = [];

          this.errorMessage =
            res?.message ||
            'Unable to load orders.';
        }

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'FULL ORDERS API ERROR:',
          error
        );

        console.error(
          'Status:',
          error?.status
        );

        console.error(
          'Error body:',
          error?.error
        );

        console.error(
          'URL:',
          error?.url
        );

        this.loading = false;
        this.orders = [];

        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to orders API.';

        this.cdr.detectChanges();
      }

    });
  }


  // ==========================================
  // FILTER ORDERS
  // ==========================================

  get filteredOrders(): any[] {

    if (this.selectedStatus === 'All') {
      return this.orders;
    }

    return this.orders.filter((order) => {

      const status =
        order.status ||
        order.order_status ||
        'Pending';

      return status.toLowerCase() ===
        this.selectedStatus.toLowerCase();

    });
  }


  // ==========================================
  // CHANGE ORDER STATUS
  // ==========================================

  updateStatus(
    order: any,
    newStatus: string
  ): void {

    if (!order || !order.id) {
      return;
    }

    const oldStatus =
      order.status ||
      order.order_status ||
      'Pending';

    if (oldStatus === newStatus) {
      return;
    }

    this.http.put<any>(
      'http://localhost:8000/api/admin/update-order-status.php',
      {
        order_id: order.id,
        status: newStatus
      }
    ).subscribe({

      next: (res) => {

        console.log(
          'Status update response:',
          res
        );

        if (res?.success === true) {

          order.status = newStatus;
          order.order_status = newStatus;

        } else {

          alert(
            res?.message ||
            'Unable to update order status.'
          );
        }

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Status update error:',
          error
        );

        alert(
          error?.error?.message ||
          'Unable to update order status.'
        );

        this.cdr.detectChanges();
      }

    });
  }


  // ==========================================
  // VIEW ORDER
  // ==========================================

  viewOrder(order: any): void {

    if (!order?.id) {
      return;
    }

    this.router.navigate([
      '/admin/orders',
      order.id
    ]);
  }


  // ==========================================
  // FORMAT DATE
  // ==========================================

  formatDate(dateValue: any): string {

    if (!dateValue) {
      return '-';
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  }


  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  formatCurrency(amount: any): string {

    const value =
      Number(amount || 0);

    return '₹' +
      value.toLocaleString('en-IN');
  }


  // ==========================================
  // STATUS CLASS
  // ==========================================

  getStatusClass(status: string): string {

    if (!status) {
      return 'status-pending';
    }

    switch (status.toLowerCase()) {

      case 'pending':
        return 'status-pending';

      case 'confirmed':
        return 'status-confirmed';

      case 'preparing':
        return 'status-preparing';

      case 'ready':
        return 'status-ready';

      case 'out for delivery':
        return 'status-out';

      case 'delivered':
        return 'status-delivered';

      case 'cancelled':
      case 'canceled':
        return 'status-cancelled';

      default:
        return 'status-pending';
    }
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');

    this.router.navigate([
      '/admin-login'
    ]);
  }

}