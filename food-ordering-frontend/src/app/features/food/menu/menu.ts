import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  categories: any[] = [];

  foods: any[] = [];

  filteredFoods: any[] = [];

  selectedCategory: any = null;

  searchText = '';

  loadingCategories = true;

  loadingFoods = true;


  categoryIcons: { [key: string]: string } = {
    pizza: '🍕',
    burger: '🍔',
    biryani: '🍛',
    chinese: '🍜',
    desserts: '🍰',
    pasta: '🍝',
    drinks: '🥤',
    healthy: '🥗'
  };


  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.getCategories();

    this.getFoods();

  }


  // ================= CATEGORIES =================

  getCategories(): void {

    this.loadingCategories = true;

    this.http.get<any>(
      'http://localhost:8000/api/categories/get-categories.php'
    )
    .subscribe({

      next: (res) => {

        console.log(
          'Category API Response:',
          res
        );

        if (
          res &&
          res.success
        ) {

          this.categories =
            res.categories || [];

        } else {

          this.categories = [];

        }

        this.loadingCategories = false;

      },

      error: (err) => {

        console.error(
          'Category API Error:',
          err
        );

        this.categories = [];

        this.loadingCategories = false;

      }

    });

  }


  // ================= FOODS =================

  getFoods(): void {

    this.loadingFoods = true;

    this.http.get<any>(
      'http://localhost:8000/api/foods/get-food.php'
    )
    .subscribe({

      next: (res) => {

        console.log(
          'Food API Response:',
          res
        );

        if (
          res &&
          res.success
        ) {

          this.foods =
            res.foods || [];

          this.filteredFoods =
            [...this.foods];

        } else {

          this.foods = [];

          this.filteredFoods = [];

        }

        this.loadingFoods = false;

      },

      error: (err) => {

        console.error(
          'Food API Error:',
          err
        );

        this.foods = [];

        this.filteredFoods = [];

        this.loadingFoods = false;

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

      result = result.filter(
        food =>
          food.category_id ===
          this.selectedCategory.id
      );

    }


    // SEARCH FILTER

    if (
      this.searchText &&
      this.searchText.trim()
    ) {

      const search =
        this.searchText
          .trim()
          .toLowerCase();

      result = result.filter(
        food =>
          food.name
            .toLowerCase()
            .includes(search) ||

          food.description
            .toLowerCase()
            .includes(search)
      );

    }


    this.filteredFoods = result;

  }


  // ================= SEARCH =================

  searchFood(): void {

    this.filterFoods();

  }


  // ================= CATEGORY ICON =================

  getCategoryIcon(
    imageKey: string
  ): string {

    return (
      this.categoryIcons[imageKey] ||
      '🍽️'
    );

  }


  // ================= FOOD COUNT =================

  getFoodCount(): number {

    return this.filteredFoods.length;

  }


  // ================= ADD TO CART =================

  addToCart(food: any): void {

    console.log(
      'Add button clicked:',
      food
    );


    // CHECK LOGIN

    const userId =
      localStorage.getItem('userId');


    if (!userId) {

      console.log(
        'User is not logged in'
      );

      /*
        New user ko register page
        par bhej rahe hain.
      */

      this.router.navigate([
        '/register'
      ]);

      return;

    }


    // CART DATA

    const cartData = {

      user_id: userId,

      food_id: food.id,

      quantity: 1,

      price: food.price

    };


    console.log(
      'Adding to Cart:',
      cartData
    );


    // CALL PHP API

    this.http.post<any>(
      'http://localhost:8000/api/cart/add-cart.php',
      cartData
    )
    .subscribe({

      next: (res) => {

        console.log(
          'Add Cart Response:',
          res
        );


        if (
          res &&
          res.success
        ) {

          console.log(
            'Food added to cart successfully'
          );


          // GO TO CART

          this.router.navigate([
            '/cart'
          ]);

        } else {

          alert(
            res?.message ||
            'Food could not be added to cart.'
          );

        }

      },

      error: (err) => {

        console.error(
          'Add Cart API Error:',
          err
        );

        alert(
          'Something went wrong while adding food to cart.'
        );

      }

    });

  }

}