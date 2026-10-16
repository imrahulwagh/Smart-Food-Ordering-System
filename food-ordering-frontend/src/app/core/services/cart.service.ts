import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private cartItems: CartItem[] = this.loadCart();
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cartItems);
  cart$ = this.cartSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(this.calculateCount(this.cartItems));
  cartCount$: Observable<number> = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  private calculateCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }

  private loadCart(): CartItem[] {
    try {
      const saved = sessionStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveCart(): void {
    sessionStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
    this.cartCountSubject.next(this.calculateCount(this.cartItems));
  }

  setCartCount(count: number): void {
    this.cartCountSubject.next(Math.max(0, count));
  }

  incrementCount(delta: number = 1): void {
    this.cartCountSubject.next(this.cartCountSubject.value + delta);
  }

  fetchCartCount(userId: string | null): void {
    if (!userId) {
      this.setCartCount(this.calculateCount(this.cartItems));
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/cart/get-cart.php?user_id=${userId}`).subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.cart)) {
          const count = res.cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
          this.setCartCount(count);
        } else {
          this.setCartCount(0);
        }
      },
      error: () => {
        // Keep current count on network failure
      }
    });
  }

  addToCart(food: any): void {
    const existing = this.cartItems.find(item => item.id === food.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cartItems.push({
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: 1
      });
    }

    this.saveCart();
  }

  removeFromCart(id: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  getTotalCount(): number {
    return this.calculateCount(this.cartItems);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}