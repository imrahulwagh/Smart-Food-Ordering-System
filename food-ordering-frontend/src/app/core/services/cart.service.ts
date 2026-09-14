import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  private loadCart(): CartItem[] {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
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

  getTotalCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}