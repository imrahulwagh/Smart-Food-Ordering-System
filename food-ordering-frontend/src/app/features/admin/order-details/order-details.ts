import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
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
  adminEmail: string = 'admin@gmail.com';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const savedUsername = localStorage.getItem('adminUsername');
    const savedEmail = localStorage.getItem('adminEmail');

    if (savedUsername) {
      this.adminUsername = savedUsername;
    }

    if (savedEmail) {
      this.adminEmail = savedEmail;
    }

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

    // First get all orders
    // We need user_id because the existing
    // order-details API requires user_id.

    this.http.get<any>(
      'http://localhost:8000/api/admin/get-orders.php'
    ).subscribe({

      next: (res) => {

        console.log('Admin Orders Response:', res);

        if (!res?.success || !Array.isArray(res.orders)) {

          this.loading = false;
          this.errorMessage = 'Unable to load order.';
          this.cdr.detectChanges();
          return;
        }

        // Find selected order
        const selectedOrder = res.orders.find(
          (item: any) =>
            String(item.id) === String(this.orderId)
        );

        if (!selectedOrder) {

          this.loading = false;
          this.errorMessage = 'Order not found.';
          this.cdr.detectChanges();
          return;
        }

        this.order = selectedOrder;

        console.log('Selected Order:', this.order);

        // Now get order items
        this.getOrderItems();

      },

      error: (error) => {

        console.error('Get order error:', error);

        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to orders API.';

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
      'http://localhost:8000/api/orders/get-order-details.php',
      {
        order_id: this.order.id,
        user_id: this.order.user_id
      }
    ).subscribe({

      next: (res) => {

        console.log('Order Details Response:', res);

        if (res?.success === true) {

          this.order = {
            ...this.order,
            ...(res.order || {})
          };

          this.items = Array.isArray(res.items)
            ? res.items
            : [];

          this.loading = false;

        } else {

          this.errorMessage =
            res?.message || 'Unable to load order details.';

          this.loading = false;
        }

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Order Details API Error:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to load order details.';

        this.cdr.detectChanges();
      }

    });
  }


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


  formatDate(dateValue: any): string {

    if (!dateValue) {
      return '-';
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }


  formatCurrency(amount: any): string {

    const value = Number(amount || 0);

    return '₹' + value.toLocaleString('en-IN');
  }


  getItemName(item: any): string {

    return (
      item?.food_name ||
      item?.name ||
      item?.food?.name ||
      ('Food ID: ' + (item?.food_id || '-'))
    );
  }


  getItemPrice(item: any): number {

    return Number(
      item?.price ||
      item?.unit_price ||
      0
    );
  }


  getItemQuantity(item: any): number {

    return Number(
      item?.quantity ||
      1
    );
  }


  getItemTotal(item: any): number {

    if (item?.total_price !== undefined) {
      return Number(item.total_price);
    }

    if (item?.subtotal !== undefined) {
      return Number(item.subtotal);
    }

    return this.getItemPrice(item) *
           this.getItemQuantity(item);
  }


  goBack(): void {

    this.router.navigate(['/admin/orders']);

  }


  logout(): void {

    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');

    this.router.navigate(['/admin-login']);
  }

}