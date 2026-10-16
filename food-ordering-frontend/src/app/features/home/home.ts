import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home implements OnInit {

  // ================= CATEGORIES =================
  categories: any[] = [];
  loadingCategories = true;

  // ================= FOODS =================
  foods: any[] = [];
  loadingFoods = true;

  // ================= UI =================
  cartCount = 0;
  menuOpen = false;

  // ================= CATEGORY ICONS =================
  categoryIcons: { [key: string]: string } = {
    pizza: '🍕',
    burger: '🍔',
    biryani: '🍛',
    chinese: '🍜',
    desserts: '🍰',
    pasta: '🍝',
    drinks: '🥤',
    healthy: '🥗',
    sandwich: '🥪',
    salad: '🥗',
    soup: '🍲',
    sushi: '🍱',
    tacos: '🌮',
    coffee: '☕'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getFoods();
  }

  // =================================================
  // CATEGORY API
  // =================================================

  getCategories(): void {
    this.loadingCategories = true;

    this.http.get<any>(
      `${environment.apiUrl}/categories/get-categories.php`
    ).subscribe({
      next: (res) => {
        this.categories = (res?.success && res?.categories) ? res.categories : [];
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = [];
        this.loadingCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  // =================================================
  // FOOD API
  // =================================================

  getFoods(): void {
    this.loadingFoods = true;

    this.http.get<any>(
      `${environment.apiUrl}/foods/get-food.php`
    ).subscribe({
      next: (res) => {
        this.foods = (res?.success && res?.foods) ? res.foods : [];
        this.loadingFoods = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.foods = [];
        this.loadingFoods = false;
        this.cdr.detectChanges();
      }
    });
  }

  // =================================================
  // CATEGORY ITEM COUNT
  // =================================================

  getItemCount(categoryId: number): number {
    return this.foods.filter(food => food.category_id === categoryId).length;
  }

  // =================================================
  // CATEGORY ICON
  // =================================================

  getIcon(imageKey: string): string {
    if (!imageKey) return '🍽️';
    return this.categoryIcons[imageKey.toLowerCase()] || '🍽️';
  }

  // =================================================
  // ADD TO CART
  // =================================================

  addToCart(food: any): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      localStorage.setItem('pendingCartItem', JSON.stringify(food));
      this.router.navigate(['/login']);
      return;
    }

    const cartData = {
      user_id: userId,
      food_id: food.id,
      quantity: 1,
      price: food.price
    };

    this.http.post<any>(
      `${environment.apiUrl}/cart/add-cart.php`,
      cartData
    ).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.router.navigate(['/cart']);
        } else {
          console.error('Could not add to cart:', res);
        }
      },
      error: (err) => {
        console.error('Add Cart API Error:', err);
      }
    });
  }

  // =================================================
  // UI HELPERS
  // =================================================

  toggleSearch(): void {
    console.log('Search clicked');
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }

  goToMenu(): void {
    this.router.navigate(['/menu']);
  }

}