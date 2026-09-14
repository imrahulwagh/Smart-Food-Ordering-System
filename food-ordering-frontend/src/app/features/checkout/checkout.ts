import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { timeout } from 'rxjs/operators';


@Component({

  selector: 'app-checkout',

  standalone: true,

  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],

  templateUrl: './checkout.html',

  styleUrl: './checkout.css'

})


export class Checkout implements OnInit {


  // =====================================================
  // CART
  // =====================================================

  cartItems: any[] = [];

  cartTotal = 0;


  // =====================================================
  // CHARGES
  // =====================================================

  deliveryFee = 40;

  tax = 22;


  // =====================================================
  // USER
  // =====================================================

  userId = '';

  address = '';

  phone = '';


  // =====================================================
  // PAYMENT
  // =====================================================

  paymentMethod = 'COD';


  // =====================================================
  // LOADING
  // =====================================================

  loadingCart = true;

  placingOrder = false;


  // =====================================================
  // MESSAGE
  // =====================================================

  message = '';

  messageType = '';


  // =====================================================
  // ORDER SUCCESS
  // =====================================================

  orderPlaced = false;

  orderId: any = null;

  deliveryDate = '';


  constructor(

    private http: HttpClient,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // =====================================================
  // PAGE LOAD
  // =====================================================

  ngOnInit(): void {

    const savedUserId =
      localStorage.getItem('userId');


    console.log(
      'Checkout User ID:',
      savedUserId
    );


    // ===================================================
    // LOGIN CHECK
    // ===================================================

    if (!savedUserId) {

      this.router.navigate([
        '/login'
      ]);

      return;
    }


    this.userId =
      savedUserId;


    // ===================================================
    // LOAD CART
    // ===================================================

    this.getCart();

  }


  // =====================================================
  // GET CART
  // =====================================================

  getCart(): void {

    this.loadingCart = true;


    this.http.get<any>(

      `https://smart-food-ordering-system.onrender.com/api/cart/get-cart.php?user_id=${this.userId}`

    )

    .pipe(

      timeout(10000)

    )

    .subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (res) => {

        console.log(
          'Checkout Cart Response:',
          res
        );


        if (

          res &&

          res.success

        ) {

          this.cartItems =
            res.cart || [];


          this.cartTotal =
            Number(
              res.cart_total
            ) || 0;

        }

        else {

          this.cartItems = [];

          this.cartTotal = 0;

        }


        this.loadingCart = false;


        this.cdr.detectChanges();

      },


      // =================================================
      // ERROR
      // =================================================

      error: (err) => {

        console.error(
          'Checkout Cart Error:',
          err
        );


        this.cartItems = [];

        this.cartTotal = 0;

        this.loadingCart = false;


        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // FINAL TOTAL
  // =====================================================

  getFinalTotal(): number {

    return (

      this.cartTotal +

      this.deliveryFee +

      this.tax

    );

  }


  // =====================================================
  // PAYMENT METHOD
  // =====================================================

  selectPaymentMethod(
    method: string
  ): void {

    this.paymentMethod =
      method;


    this.message = '';

    this.messageType = '';


    console.log(
      'Selected Payment Method:',
      this.paymentMethod
    );


    this.cdr.detectChanges();

  }


  // =====================================================
  // CONFIRM ORDER
  // =====================================================

  confirmOrder(): void {

    // ===================================================
    // ADDRESS CHECK
    // ===================================================

    if (
      !this.address.trim()
    ) {

      this.message =
        'Please enter your delivery address.';

      this.messageType =
        'error';


      this.cdr.detectChanges();


      return;

    }


    // ===================================================
    // PHONE CHECK
    // ===================================================

    if (

      !/^[0-9]{10}$/.test(

        this.phone.trim()

      )

    ) {

      this.message =
        'Phone number must contain exactly 10 digits.';

      this.messageType =
        'error';


      this.cdr.detectChanges();


      return;

    }


    // ===================================================
    // CART CHECK
    // ===================================================

    if (
      this.cartItems.length === 0
    ) {

      this.message =
        'Your cart is empty.';

      this.messageType =
        'error';


      this.cdr.detectChanges();


      return;

    }


    // ===================================================
    // ONLINE PAYMENT
    // ===================================================

    if (
      this.paymentMethod === 'ONLINE'
    ) {

      this.message =
        'Online payment will be available soon.';

      this.messageType =
        'error';


      this.cdr.detectChanges();


      return;

    }


    // ===================================================
    // COD ORDER
    // ===================================================

    const orderData = {

      user_id:
        this.userId,

      address:
        this.address.trim(),

      phone:
        this.phone.trim(),

      payment_method:
        'COD'

    };


    console.log(
      'Placing Order:',
      orderData
    );


    // ===================================================
    // START ORDER
    // ===================================================

    this.placingOrder = true;

    this.message = '';

    this.messageType = '';


    this.cdr.detectChanges();


    // ===================================================
    // PLACE ORDER API
    // ===================================================

    this.http.post<any>(

      'https://smart-food-ordering-system.onrender.com/api/orders/place-order.php',

      orderData

    )

    .pipe(

      timeout(15000)

    )

    .subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (res) => {

        console.log(
          'Place Order Response:',
          res
        );


        if (

          res &&

          res.success

        ) {

          // =============================================
          // ORDER SUCCESS
          // =============================================

          this.orderPlaced =
            true;


          // =============================================
          // ORDER ID
          // =============================================

          if (
            res.order
          ) {

            this.orderId =
              res.order.id;

          }


          // =============================================
          // DELIVERY DATE
          // =============================================

          const date =
            new Date();


          date.setDate(
            date.getDate() + 2
          );


          this.deliveryDate =
            date.toLocaleDateString(
              'en-IN',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }
            );


          // =============================================
          // MESSAGE
          // =============================================

          this.message =
            'Your order has been confirmed successfully!';

          this.messageType =
            'success';


          // =============================================
          // CART CLEAR
          // =============================================

          this.cartItems = [];

          this.cartTotal = 0;


          console.log(
            'Order placed successfully'
          );


          console.log(
            'Order ID:',
            this.orderId
          );


          console.log(
            'Delivery Date:',
            this.deliveryDate
          );

        }

        else {

          this.message =

            res?.message ||

            'Could not place order.';

          this.messageType =
            'error';

        }


        this.placingOrder = false;


        this.cdr.detectChanges();

      },


      // =================================================
      // API ERROR
      // =================================================

      error: (err) => {

        console.error(
          'Place Order API Error:',
          err
        );


        this.message =
          'Something went wrong while placing the order.';

        this.messageType =
          'error';


        this.placingOrder = false;


        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // GO TO MY ORDERS
  // =====================================================

  goToOrders(): void {
  this.router.navigate(['/orders']);
}


  // =====================================================
  // CONTINUE SHOPPING
  // =====================================================

  continueShopping(): void {

    this.router.navigate([
      '/menu'
    ]);

  }

}