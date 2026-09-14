import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
  RouterLink,
  Router
} from '@angular/router';

import { CommonModule } from '@angular/common';


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


  // ================= CART =================

  cartCount = 0;
  menuOpen = false;


  // ================= FOODS =================

  foods: any[] = [];


  // ================= LOADING =================

  loadingCategories = true;

  loadingFoods = true;


  // ================= CATEGORY ICONS =================

  categoryIcons: {
    [key: string]: string
  } = {

    pizza: '🍕',

    burger: '🍔',

    biryani: '🍛',

    chinese: '🍜',

    desserts: '🍰',

    pasta: '🍝',

    drinks: '🥤',

    healthy: '🥗'

  };


  // ================= CONSTRUCTOR =================

  constructor(

    private http: HttpClient,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // ================= PAGE LOAD =================

  ngOnInit(): void {

    console.log('HOME PAGE STARTED');

    this.getCategories();

    this.getFoods();

  }


  // =================================================
  // CATEGORY API
  // =================================================

  getCategories(): void {

    console.log('Fetching categories...');

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
          res.success &&
          res.categories
        ) {

          this.categories =
            res.categories;

        }

        else {

          this.categories = [];

        }


        console.log(
          'Home Categories:',
          this.categories
        );


        this.loadingCategories = false;


        // IMPORTANT
        // Angular screen ko immediately update karega

        this.cdr.detectChanges();

      },


      error: (err) => {

        console.error(
          'Category API Error:',
          err
        );


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

    console.log('Fetching foods...');

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
          res.success &&
          res.foods
        ) {

          this.foods =
            res.foods;

        }

        else {

          this.foods = [];

        }


        console.log(
          'Home Foods:',
          this.foods
        );


        this.loadingFoods = false;


        // IMPORTANT
        // API response ke baad
        // screen immediately refresh hogi

        this.cdr.detectChanges();

      },


      error: (err) => {

        console.error(
          'Food API Error:',
          err
        );


        this.foods = [];

        this.loadingFoods = false;


        this.cdr.detectChanges();

      }

    });

  }


  // =================================================
  // CATEGORY ITEM COUNT
  // =================================================

  getItemCount(
    categoryId: number
  ): number {

    return this.foods.filter(

      food =>
        food.category_id === categoryId

    ).length;

  }


  // =================================================
  // CATEGORY ICON
  // =================================================

  getIcon(
    imageKey: string
  ): string {

    return (

      this.categoryIcons[imageKey]

      ||

      '🍽️'

    );

  }


  // =================================================
  // ADD TO CART
  // =================================================

  addToCart(food: any): void {

    console.log(
      'Add to Cart clicked:',
      food
    );


    // ================= USER CHECK =================

    const userId =
      localStorage.getItem('userId');


    console.log(
      'Current User ID:',
      userId
    );


    // =================================================
    // USER NOT LOGGED IN
    // =================================================

    if (!userId) {

      console.log(
        'User is not logged in'
      );


      // Selected food temporarily save

      localStorage.setItem(

        'pendingCartItem',

        JSON.stringify(food)

      );


      // Login page

      this.router.navigate([
        '/login'
      ]);


      return;

    }


    // =================================================
    // USER LOGGED IN
    // =================================================

    const cartData = {

      user_id: userId,

      food_id: food.id,

      quantity: 1,

      price: food.price

    };


    console.log(
      'Adding to cart:',
      cartData
    );


    // ================= ADD CART API =================

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


          // Cart page

          this.router.navigate([
            '/cart'
          ]);

        }

        else {

          console.error(
            'Food could not be added to cart'
          );

        }

      },


      error: (err) => {

        console.error(
          'Add Cart API Error:',
          err
        );

      }

    });

  }


  // =================================================
  // SEARCH
  // =================================================

  toggleSearch(): void {

    console.log(
      'Search clicked'
    );

  }
  toggleMenu(): void {
  this.menuOpen = !this.menuOpen;
}

}