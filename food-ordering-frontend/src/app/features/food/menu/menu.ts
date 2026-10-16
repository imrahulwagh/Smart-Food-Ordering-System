import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {

  // Initial category defaults so section displays immediately without delay
  categories: any[] = [
    { id: 1, name: 'Pizza Special', image: 'pizza' },
    { id: 2, name: 'Burger', image: 'burger' },
    { id: 3, name: 'Biryani', image: 'biryani' },
    { id: 4, name: 'Chinese', image: 'chinese' },
    { id: 5, name: 'Desserts', image: 'desserts' },
    { id: 6, name: 'Chicken', image: 'chicken' }
  ];

  // Initial popular dishes so food grid displays immediately
  foods: any[] = [
    {
      id: 1,
      category_id: 1,
      category_name: 'Pizza Special',
      name: 'Margherita Pizza',
      price: 299,
      description: 'Classic cheese and tomato pizza with fresh basil and oregano',
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600',
      s_available: true
    },
    {
      id: 2,
      category_id: 2,
      category_name: 'Burger',
      name: 'Crispy Veg Burger',
      price: 149,
      description: 'Loaded with crispy spiced patty, fresh lettuce and creamy sauce',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      s_available: true
    },
    {
      id: 3,
      category_id: 3,
      category_name: 'Biryani',
      name: 'Hyderabadi Dum Biryani',
      price: 349,
      description: 'Aromatic basmati rice cooked with authentic spices and herbs',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
      s_available: true
    },
    {
      id: 4,
      category_id: 4,
      category_name: 'Chinese',
      name: 'Hakka Noodles',
      price: 199,
      description: 'Wok-tossed noodles with fresh crunchy vegetables and garlic soy sauce',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600',
      s_available: true
    },
    {
      id: 5,
      category_id: 5,
      category_name: 'Desserts',
      name: 'Chocolate Lava Cake',
      price: 129,
      description: 'Warm molten chocolate cake with rich oozing center',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
      s_available: true
    },
    {
      id: 6,
      category_id: 6,
      category_name: 'Chicken',
      name: 'Butter Chicken Special',
      price: 379,
      description: 'Tender chicken simmered in rich creamy makhani gravy',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600',
      s_available: true
    }
  ];

  filteredFoods: any[] = [];
  selectedCategory: any = null;
  searchText = '';
  cartCount = 0;
  loadingCategories = false;
  loadingFoods = false;

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
    salad: '🥗',
    sandwich: '🥪',
    tacos: '🌮',
    soup: '🍲',
    coffee: '☕'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    public cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    this.filteredFoods = [...this.foods];
  }

  ngOnInit(): void {
    // Listen to reactive cart count
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });

    const userId = this.authService.getUserId();
    if (userId) {
      this.cartService.fetchCartCount(userId);
    }

    // Handle incoming search query and category filter from home page
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchText = params['q'];
      }
      if (params['category']) {
        const catName = params['category'].toLowerCase();
        const found = this.categories.find(c => c.name.toLowerCase() === catName);
        this.selectedCategory = found || { name: params['category'] };
      }
      this.filterFoods();
    });

    this.getCategories();
    this.getFoods();
  }

  // ================= CATEGORIES =================

  getCategories(): void {
    this.http.get<any>(
      `${environment.apiUrl}/categories/get-categories.php`
    ).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res?.categories) && res.categories.length > 0) {
          this.categories = res.categories;
          // Re-match selected category if previously selected by name
          if (this.selectedCategory) {
            const match = this.categories.find(
              c => c.name.toLowerCase() === this.selectedCategory.name?.toLowerCase() ||
                   c.id === this.selectedCategory.id
            );
            if (match) this.selectedCategory = match;
          }
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

  // ================= FOODS =================

  getFoods(): void {
    this.http.get<any>(
      `${environment.apiUrl}/foods/get-food.php`
    ).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res?.foods) && res.foods.length > 0) {
          this.foods = res.foods;
          this.filterFoods();
        }
        this.loadingFoods = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingFoods = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ================= CATEGORY SELECT =================

  selectCategory(category: any): void {
    this.selectedCategory = category;
    this.filterFoods();
  }

  // ================= FILTER =================

  filterFoods(): void {
    let result = [...this.foods];

    // CATEGORY FILTER
    if (this.selectedCategory) {
      result = result.filter(food => {
        if (this.selectedCategory.id && food.category_id) {
          return Number(food.category_id) === Number(this.selectedCategory.id);
        }
        if (this.selectedCategory.name) {
          const catName = this.selectedCategory.name.toLowerCase();
          return (
            (food.category_name && food.category_name.toLowerCase().includes(catName)) ||
            (food.name && food.name.toLowerCase().includes(catName)) ||
            (food.description && food.description.toLowerCase().includes(catName))
          );
        }
        return true;
      });
    }

    // SEARCH FILTER
    if (this.searchText && this.searchText.trim()) {
      const search = this.searchText.trim().toLowerCase();
      result = result.filter(food =>
        (food.name && food.name.toLowerCase().includes(search)) ||
        (food.description && food.description.toLowerCase().includes(search))
      );
    }

    this.filteredFoods = result;
  }

  // ================= SEARCH =================

  searchFood(): void {
    this.filterFoods();
  }

  // ================= CATEGORY ICON =================

  getCategoryIcon(imageKey: string): string {
    if (!imageKey) return '🍴';
    const key = imageKey.toLowerCase().trim();
    return this.categoryIcons[key] || '🍴';
  }

  // ================= FOOD COUNT =================

  getFoodCount(): number {
    return this.filteredFoods.length;
  }

  // ================= ADD TO CART =================

  addToCart(food: any): void {
    const userId = this.authService.getUserId();

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
          alert(res?.message || 'Food could not be added to cart.');
        }
      },
      error: (err) => {
        console.error('Add Cart API Error:', err);
        alert('Something went wrong while adding food to cart.');
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logoutCustomer();
    this.cartCount = 0;
  }
}