import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  orders: any[] = [];
  selectedOrder: any = null;
  orderItems: any[] = [];

  loadingOrders = true;
  loadingDetails = false;

  userId = '';
  message = '';
  messageType = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const savedUserId = this.auth.getUserId();
    if (!savedUserId) {
      this.router.navigate(['/login']);
      return;
    }
    this.userId = savedUserId;
    this.getOrders();
  }

  // ==========================================
  // GET ALL ORDERS
  // ==========================================

  getOrders(): void {
    this.loadingOrders = true;

    this.http.post<any>(
      `${environment.apiUrl}/orders/get-orders.php`,
      { user_id: this.userId }
    )
    .pipe(timeout(15000))
    .subscribe({
      next: (res) => {
        if (res && res.success) {
          this.orders = res.orders || [];
        } else {
          this.orders = [];
          this.message = res?.message || 'No orders found.';
          this.messageType = 'info';
        }
        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Orders API Error:', err);
        this.orders = [];
        this.loadingOrders = false;
        this.message = 'Could not load your orders. The backend may be starting up — please retry.';
        this.messageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // VIEW ORDER DETAILS
  // ==========================================

  viewDetails(order: any): void {
    this.loadingDetails = true;
    this.selectedOrder = null;
    this.orderItems = [];

    this.http.post<any>(
      `${environment.apiUrl}/orders/get-order-details.php`,
      { order_id: order.id, user_id: this.userId }
    )
    .pipe(timeout(15000))
    .subscribe({
      next: (res) => {
        if (res && res.success) {
          this.selectedOrder = res.order;
          this.orderItems = res.items || [];
          this.message = '';
        } else {
          this.message = res?.message || 'Could not load order details.';
          this.messageType = 'error';
        }
        this.loadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Order Details API Error:', err);
        this.loadingDetails = false;
        this.message = 'Could not load order details.';
        this.messageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // CLOSE DETAILS
  // ==========================================

  closeDetails(): void {
    this.selectedOrder = null;
    this.orderItems = [];
    this.message = '';
    this.messageType = '';
    this.cdr.detectChanges();
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  formatDate(dateValue: any): string {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatDateTime(dateValue: any): string {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  // ==========================================
  // STATUS CLASS
  // ==========================================

  getStatusClass(status: string): string {
    if (!status) return 'status-pending';
    switch (status.toLowerCase()) {
      case 'pending':          return 'status-pending';
      case 'confirmed':        return 'status-confirmed';
      case 'preparing':        return 'status-preparing';
      case 'ready':            return 'status-ready';
      case 'out for delivery': return 'status-out';
      case 'delivered':        return 'status-delivered';
      case 'cancelled':
      case 'canceled':         return 'status-cancelled';
      default:                 return 'status-pending';
    }
  }

  // ==========================================
  // CONTINUE SHOPPING
  // ==========================================

  continueShopping(): void {
    this.router.navigate(['/menu']);
  }

}