import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebar
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {

  orderId: string = '';
  order: any = null;
  items: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  adminUsername: string = 'Admin';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.adminUsername = this.auth.getAdminUsername();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.orderId = id;
        this.getOrderDetails();
      } else {
        this.errorMessage = 'Order ID not found.';
        this.loading = false;
      }
    });
  }

  getOrderDetails(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      `${environment.apiUrl}/admin/get-orders.php`
    ).subscribe({
      next: (res) => {
        if (!res?.success || !Array.isArray(res.orders)) {
          this.loading = false;
          this.errorMessage = 'Unable to load order.';
          this.cdr.detectChanges();
          return;
        }

        const selectedOrder = res.orders.find(
          (item: any) => String(item.id) === String(this.orderId)
        );

        if (!selectedOrder) {
          this.loading = false;
          this.errorMessage = 'Order not found.';
          this.cdr.detectChanges();
          return;
        }

        this.order = selectedOrder;
        this.getOrderItems();
      },
      error: (error) => {
        console.error('Get order error:', error);
        this.loading = false;
        this.errorMessage = 'Unable to connect to orders API.';
        this.cdr.detectChanges();
      }
    });
  }

  getOrderItems(): void {
    if (!this.order?.user_id) {
      this.loading = false;
      this.errorMessage = 'User information not found for this order.';
      this.cdr.detectChanges();
      return;
    }

    this.http.post<any>(
      `${environment.apiUrl}/orders/get-order-details.php`,
      { order_id: this.order.id, user_id: this.order.user_id }
    ).subscribe({
      next: (res) => {
        if (res?.success === true) {
          this.order = { ...this.order, ...(res.order || {}) };
          this.items = Array.isArray(res.items) ? res.items : [];
          this.loading = false;
        } else {
          this.errorMessage = res?.message || 'Unable to load order details.';
          this.loading = false;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Order Details API Error:', error);
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to load order details.';
        this.cdr.detectChanges();
      }
    });
  }

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

  formatDate(dateValue: any): string {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  formatCurrency(amount: any): string {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  getItemName(item: any): string {
    return item?.food_name || item?.name || item?.food?.name || ('Food ID: ' + (item?.food_id || '-'));
  }

  getItemPrice(item: any): number {
    return Number(item?.price || item?.unit_price || 0);
  }

  getItemQuantity(item: any): number {
    return Number(item?.quantity || 1);
  }

  getItemTotal(item: any): number {
    if (item?.total_price !== undefined) return Number(item.total_price);
    if (item?.subtotal !== undefined) return Number(item.subtotal);
    return this.getItemPrice(item) * this.getItemQuantity(item);
  }

  goBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  logout(): void {
    this.auth.logoutAdmin();
  }

}