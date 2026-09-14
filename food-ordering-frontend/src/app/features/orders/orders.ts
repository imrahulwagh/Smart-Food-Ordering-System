import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    RouterLink,
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const savedUserId =
      localStorage.getItem('userId');

    console.log(
      'Orders User ID:',
      savedUserId
    );

    if (!savedUserId) {

      this.router.navigate([
        '/login'
      ]);

      return;
    }

    this.userId =
      savedUserId;

    this.getOrders();
  }


  /*
  |--------------------------------------------------------------------------
  | GET ALL ORDERS
  |--------------------------------------------------------------------------
  */

  getOrders(): void {

    this.loadingOrders = true;

    const orderData = {
      user_id: this.userId
    };

    console.log(
      'Getting Orders:',
      orderData
    );

    this.http.post<any>(
      'https://smart-food-ordering-system.onrender.com/api/orders/get-orders.php',
      orderData
    )
    .pipe(timeout(10000))
    .subscribe({

      next: (res) => {

        console.log(
          'Orders API Response:',
          res
        );

        if (
          res &&
          res.success
        ) {

          this.orders =
            res.orders || [];

        } else {

          this.orders = [];

          this.message =
            res?.message ||
            'No orders found.';

          this.messageType =
            'error';
        }

        this.loadingOrders =
          false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error(
          'Orders API Error:',
          err
        );

        this.orders = [];

        this.loadingOrders =
          false;

        this.message =
          'Could not load your orders.';

        this.messageType =
          'error';

        this.cdr.detectChanges();
      }

    });
  }


  /*
  |--------------------------------------------------------------------------
  | VIEW ORDER DETAILS
  |--------------------------------------------------------------------------
  */

  viewDetails(order: any): void {

    console.log(
      'Selected Order:',
      order
    );

    this.loadingDetails = true;

    this.selectedOrder = null;

    this.orderItems = [];

    const detailsData = {

      order_id:
        order.id,

      user_id:
        this.userId

    };

    console.log(
      'Order Details Request:',
      detailsData
    );

    this.http.post<any>(
      'https://smart-food-ordering-system.onrender.com/api/orders/get-orders-details.php',
      detailsData
    )
    .pipe(timeout(10000))
    .subscribe({

      next: (res) => {

        console.log(
          'Order Details Response:',
          res
        );

        if (
          res &&
          res.success
        ) {

          this.selectedOrder =
            res.order;

          this.orderItems =
            res.items || [];

          this.message = '';

        } else {

          this.message =
            res?.message ||
            'Could not load order details.';

          this.messageType =
            'error';
        }

        this.loadingDetails =
          false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error(
          'Order Details API Error:',
          err
        );

        this.loadingDetails =
          false;

        this.message =
          'Could not load order details.';

        this.messageType =
          'error';

        this.cdr.detectChanges();
      }

    });
  }


  /*
  |--------------------------------------------------------------------------
  | CLOSE DETAILS
  |--------------------------------------------------------------------------
  */

  closeDetails(): void {

    this.selectedOrder =
      null;

    this.orderItems =
      [];

    this.message = '';

    this.messageType = '';

    this.cdr.detectChanges();
  }


  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  formatDate(dateValue: any): string {

    if (!dateValue) {
      return '-';
    }

    const date =
      new Date(dateValue);

    if (
      isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE + TIME
  |--------------------------------------------------------------------------
  */

  formatDateTime(dateValue: any): string {

    if (!dateValue) {
      return '-';
    }

    const date =
      new Date(dateValue);

    if (
      isNaN(
        date.getTime()
      )
    ) {
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


  /*
  |--------------------------------------------------------------------------
  | ORDER STATUS
  |--------------------------------------------------------------------------
  */

  getStatusClass(
    status: string
  ): string {

    if (!status) {
      return 'status-pending';
    }

    const value =
      status.toLowerCase();

    if (
      value === 'delivered'
    ) {
      return 'status-delivered';
    }

    if (
      value === 'cancelled'
    ) {
      return 'status-cancelled';
    }

    if (
      value === 'confirmed'
    ) {
      return 'status-confirmed';
    }

    return 'status-pending';
  }


  /*
  |--------------------------------------------------------------------------
  | CONTINUE SHOPPING
  |--------------------------------------------------------------------------
  */

  continueShopping(): void {

    this.router.navigate([
      '/menu'
    ]);
  }

}