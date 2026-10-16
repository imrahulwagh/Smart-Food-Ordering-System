import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home implements OnInit {

  // ================= CATEGORIES =================
  categories: any[] = [
    { id: 1, name: 'Pizza Special', image: 'pizza', count: 2 },
    { id: 2, name: 'Burger', image: 'burger', count: 2 },
    { id: 3, name: 'Biryani', image: 'biryani', count: 2 },
    { id: 4, name: 'Chinese', image: 'chinese', count: 2 }
  ];
  loadingCategories = false;

  // ================= FOODS =================
  foods: any[] = [];
  loadingFoods = true;

  // ================= UI =================
  cartCount = 0;
  menuOpen = false;
  searchQuery = '';

  // ================= CATEGORY ICONS =================
  categoryIcons: { [key: string]: string } = {
    pizza: '🍕',
    burger: '🍔',
    biryani: '🍛',
    chinese: '🍜',
    desserts: '🍰',
    chicken: '🍗',
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
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    this.initCart();
    this.getCategories();
    this.getFoods();
  }

  // =================================================
  // CART SYNC
  // =================================================

  initCart(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });

    const userId = this.auth.getUserId();
    if (userId) {
      this.cartService.fetchCartCount(userId);
    }
  }

  // =================================================
  // CATEGORY API
  // =================================================

  getCategories(): void {
    this.http.get<any>(
      `${environment.apiUrl}/categories/get-categories.php`
    ).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res?.categories) && res.categories.length > 0) {
          this.categories = res.categories;
        }
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
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
    const userId = this.auth.getUserId();

    if (!userId) {
      sessionStorage.setItem('pendingCartItem', JSON.stringify(food));
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
          this.cartService.fetchCartCount(userId);
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
  // UI HELPERS & NAVIGATION
  // =================================================

  searchMenu(): void {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/menu'], {
        queryParams: { q: this.searchQuery.trim() }
      });
    } else {
      this.router.navigate(['/menu']);
    }
  }

  goToCategory(category: any): void {
    if (category?.name) {
      this.router.navigate(['/menu'], {
        queryParams: { category: category.name }
      });
    } else {
      this.router.navigate(['/menu']);
    }
  }

  toggleSearch(): void {
    this.goToMenu();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  logoutCustomer(): void {
    this.auth.logoutCustomer();
    this.cartCount = 0;
  }

  goToMenu(): void {
    this.router.navigate(['/menu']);
  }

}