import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';

import { timeout } from 'rxjs/operators';


@Component({

  selector: 'app-cart',

  standalone: true,

  imports: [
    RouterLink,
    CommonModule
  ],

  templateUrl: './cart.html',

  styleUrl: './cart.css'

})


export class Cart implements OnInit {


  // =====================================================
  // CART ITEMS
  // =====================================================

  cartItems: any[] = [];


  // =====================================================
  // CART SUBTOTAL
  // =====================================================

  cartTotal = 0;


  // =====================================================
  // LOADING
  // =====================================================

  loadingCart = true;


  // =====================================================
  // LOGGED-IN USER ID
  // =====================================================

  userId = '';


  // =====================================================
  // DELIVERY FEE
  // =====================================================

  deliveryFee = 40;


  // =====================================================
  // TAX
  // =====================================================

  tax = 22;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef

  ) {}


  // =====================================================
  // COMPONENT LOAD
  // =====================================================

  ngOnInit(): void {

    // LocalStorage se actual logged-in user ID lena

    const savedUserId =
      localStorage.getItem('userId');


    console.log(
      'Logged-in User ID:',
      savedUserId
    );


    // ===================================================
    // USER LOGIN NAHI HAI
    // ===================================================

    if (!savedUserId) {

      console.log(
        'User is not logged in'
      );


      this.cartItems = [];

      this.cartTotal = 0;

      this.loadingCart = false;


      // Angular UI update

      this.cdr.detectChanges();


      return;
    }


    // ===================================================
    // ACTUAL USER UUID SAVE
    // ===================================================

    this.userId =
      savedUserId;


    // ===================================================
    // CART DATABASE SE LOAD
    // ===================================================

    this.getCart();

  }


  // =====================================================
  // GET CART FROM BACKEND
  // =====================================================

  getCart(): void {

    this.loadingCart = true;


    this.http.get<any>(

      `http://localhost:8000/api/cart/get-cart.php?user_id=${this.userId}`

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
          'Cart API Response:',
          res
        );


        // =================================================
        // CART DATA
        // =================================================

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


        // =================================================
        // CONSOLE
        // =================================================

        console.log(
          'Cart Items:',
          this.cartItems
        );


        console.log(
          'Cart Subtotal:',
          this.cartTotal
        );


        // =================================================
        // LOADING COMPLETE
        // =================================================

        this.loadingCart = false;


        // =================================================
        // IMPORTANT FIX
        // =================================================
        // API se data aane ke turant baad
        // Angular screen update karega.

        this.cdr.detectChanges();

      },


      // =================================================
      // ERROR
      // =================================================

      error: (err) => {

        console.error(
          'Cart API Error:',
          err
        );


        this.cartItems = [];

        this.cartTotal = 0;


        this.loadingCart = false;


        // =================================================
        // IMPORTANT FIX
        // =================================================

        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  increaseQuantity(
    item: any
  ): void {

    item.quantity++;


    this.calculateTotal();


    console.log(

      item.name,

      'Quantity:',

      item.quantity

    );

  }


  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  decreaseQuantity(
    item: any
  ): void {

    if (
      item.quantity > 1
    ) {

      item.quantity--;


      this.calculateTotal();


      console.log(

        item.name,

        'Quantity:',

        item.quantity

      );

    }

  }


  // =====================================================
  // CALCULATE CART TOTAL
  // =====================================================

  calculateTotal(): void {

    let total = 0;


    this.cartItems.forEach(

      item => {

        const price =
          Number(
            item.price
          );


        const quantity =
          Number(
            item.quantity
          );


        item.item_total =
          price * quantity;


        total +=
          item.item_total;

      }

    );


    this.cartTotal =
      total;


    console.log(
      'Updated Cart Subtotal:',
      this.cartTotal
    );


    // UI update

    this.cdr.detectChanges();

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
  // REMOVE ITEM FROM CART
  // =====================================================

  removeItem(
    item: any
  ): void {

    console.log(
      'Delete button clicked:',
      item
    );


    // ===================================================
    // 1. CHECK CART ID
    // ===================================================

    if (

      !item ||

      !item.cart_id

    ) {

      console.error(
        'Cart ID not found'
      );


      alert(
        'Cart item ID not found.'
      );


      return;

    }


    // ===================================================
    // 2. CONFIRM DELETE
    // ===================================================

    const confirmDelete =

      confirm(

        `Remove ${item.name} from your cart?`

      );


    if (!confirmDelete) {

      return;

    }


    // ===================================================
    // 3. DELETE DATA
    // ===================================================

    const deleteData = {

      cart_id:
        item.cart_id

    };


    console.log(
      'Deleting cart item:',
      deleteData
    );


    // ===================================================
    // 4. DELETE API
    // ===================================================

    this.http.request<any>(

      'DELETE',

      'http://localhost:8000/api/cart/delete-cart.php',

      {

        body: deleteData

      }

    )

    .pipe(

      timeout(10000)

    )

    .subscribe({

      // =================================================
      // 5. DELETE SUCCESS
      // =================================================

      next: (res) => {

        console.log(
          'Delete Cart Response:',
          res
        );


        // =================================================
        // API SUCCESS
        // =================================================

        if (

          res &&

          res.success

        ) {

          console.log(
            'Cart item deleted from database'
          );


          // =============================================
          // REMOVE SAME ITEM FROM FRONTEND
          // =============================================

          const index =

            this.cartItems.findIndex(

              cartItem =>

                cartItem.cart_id ===
                item.cart_id

            );


          if (
            index !== -1
          ) {

            this.cartItems.splice(

              index,

              1

            );

          }


          // =============================================
          // UPDATE TOTAL
          // =============================================

          this.calculateTotal();


          console.log(
            'Cart item removed from frontend'
          );


          console.log(
            'Remaining Cart Items:',
            this.cartItems
          );


          // =============================================
          // IMPORTANT
          // =============================================

          this.cdr.detectChanges();

        }

        else {

          // =============================================
          // DELETE FAILED
          // =============================================

          console.error(
            'Delete failed:',
            res
          );


          alert(
            'Could not remove item from cart.'
          );

        }

      },


      // =================================================
      // 8. API ERROR
      // =================================================

      error: (err) => {

        console.error(
          'Delete Cart API Error:',
          err
        );


        alert(
          'Something went wrong while removing the item.'
        );

      }

    });

  }

}