import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

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

  // Cart items
  cartItems: any[] = [];
  cartTotal = 0;
  loadingCart = true;
  userId = '';
  deliveryFee = 40;
  tax = 22;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const savedUserId = this.authService.getUserId();

    console.log('Logged-in User ID:', savedUserId);

    if (!savedUserId) {
      console.log('User is not logged in');
      this.cartItems = [];
      this.cartTotal = 0;
      this.loadingCart = false;
      this.cdr.detectChanges();
      return;
    }

    this.userId = savedUserId;
    this.getCart();
  }

  // Load cart items from backend
  getCart(): void {
    this.loadingCart = true;

    this.http.get<any>(
      `${environment.apiUrl}/cart/get-cart.php?user_id=${this.userId}`
    )
    .pipe(timeout(15000))
    .subscribe({
      next: (res) => {
        console.log('Cart API Response:', res);

        if (res && res.success) {
          this.cartItems = res.cart || [];
          this.cartTotal = Number(res.cart_total) || 0;
        } else {
          this.cartItems = [];
          this.cartTotal = 0;
        }

        this.loadingCart = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Cart API Error:', err);
        this.cartItems = [];
        this.cartTotal = 0;
        this.loadingCart = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Sync quantity changes with backend
  updateQuantity(item: any, newQty: number): void {
    if (newQty < 1) return;
    const oldQty = item.quantity;
    item.quantity = newQty;
    this.calculateTotal();

    if (!item.cart_id) return;

    this.http.post<any>(`${environment.apiUrl}/cart/update-cart.php`, {
      cart_id: item.cart_id,
      quantity: newQty
    })
    .pipe(timeout(10000))
    .subscribe({
      next: (res) => {
        console.log('Cart quantity updated in backend:', res);
      },
      error: (err) => {
        console.error('Failed to sync cart quantity with backend:', err);
        // Rollback on network failure
        item.quantity = oldQty;
        this.calculateTotal();
      }
    });
  }

  increaseQuantity(item: any): void {
    this.updateQuantity(item, Number(item.quantity) + 1);
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, Number(item.quantity) - 1);
    }
  }

  calculateTotal(): void {
    let total = 0;
    this.cartItems.forEach(item => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      item.item_total = price * quantity;
      total += item.item_total;
    });

    this.cartTotal = total;
    this.cdr.detectChanges();
  }

  getFinalTotal(): number {
    return this.cartTotal + this.deliveryFee + this.tax;
  }

  removeItem(item: any): void {
    if (!item || !item.cart_id) {
      alert('Cart item ID not found.');
      return;
    }

    const confirmDelete = confirm(`Remove ${item.name} from your cart?`);
    if (!confirmDelete) return;

    const deleteData = {
      cart_id: item.cart_id
    };

    this.http.request<any>(
      'DELETE',
      `${environment.apiUrl}/cart/delete-cart.php`,
      { body: deleteData }
    )
    .pipe(timeout(10000))
    .subscribe({
      next: (res) => {
        if (res && res.success) {
          const index = this.cartItems.findIndex(
            cartItem => cartItem.cart_id === item.cart_id
          );

          if (index !== -1) {
            this.cartItems.splice(index, 1);
          }

          this.calculateTotal();
          this.cdr.detectChanges();
        } else {
          alert('Could not remove item from cart.');
        }
      },
      error: (err) => {
        console.error('Delete Cart API Error:', err);
        alert('Something went wrong while removing the item.');
      }
    });
  }
}