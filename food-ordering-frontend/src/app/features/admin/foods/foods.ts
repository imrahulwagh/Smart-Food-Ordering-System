import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-foods',
  standalone: true,

  imports: [
  CommonModule,
  FormsModule,
  RouterLink,
  RouterLinkActive,
  AdminSidebar
],

  templateUrl: './foods.html',
  styleUrl: './foods.css'
})
export class Foods implements OnInit {

  adminUsername: string = 'Admin';
  adminEmail: string = 'admin@gmail.com';

  foods: any[] = [];

  loading: boolean = true;
  errorMessage: string = '';

  searchText: string = '';

  // Add/Edit form
  showFoodForm: boolean = false;
  isEditMode: boolean = false;

  selectedFoodId: number | null = null;

  foodForm = {
    category_id: '',
    name: '',
    description: '',
    price: '',
    image: '',
    s_available: true
  };


  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    const savedUsername =
      localStorage.getItem('adminUsername');

    const savedEmail =
      localStorage.getItem('adminEmail');

    if (savedUsername) {
      this.adminUsername = savedUsername;
    }

    if (savedEmail) {
      this.adminEmail = savedEmail;
    }

    this.getFoods();
  }


  // ==========================================
  // GET FOODS
  // ==========================================

  getFoods(): void {

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      'https://smart-food-ordering-system.onrender.com/api/foods/get-food.php'
    ).subscribe({

      next: (res) => {

        console.log('Foods API Response:', res);

        this.loading = false;

        if (res?.success === true) {

          this.foods = Array.isArray(res.foods)
            ? res.foods
            : [];

        } else {

          this.foods = [];

          this.errorMessage =
            res?.message ||
            'Unable to load foods.';
        }

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Foods API Error:', error);

        this.loading = false;
        this.foods = [];

        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to foods API.';

        this.cdr.detectChanges();
      }
    });
  }


  // ==========================================
  // SEARCH
  // ==========================================

  get filteredFoods(): any[] {

    if (!this.searchText.trim()) {
      return this.foods;
    }

    const search =
      this.searchText.toLowerCase().trim();

    return this.foods.filter((food: any) => {

      return (
        String(food.name || '')
          .toLowerCase()
          .includes(search) ||

        String(food.description || '')
          .toLowerCase()
          .includes(search)
      );

    });
  }


  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {

    this.isEditMode = false;
    this.selectedFoodId = null;

    this.foodForm = {
      category_id: '',
      name: '',
      description: '',
      price: '',
      image: '',
      s_available: true
    };

    this.showFoodForm = true;
  }


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  openEditForm(food: any): void {

    this.isEditMode = true;

    this.selectedFoodId = Number(food.id);

    this.foodForm = {
      category_id: String(food.category_id || ''),
      name: String(food.name || ''),
      description: String(food.description || ''),
      price: String(food.price || ''),
      image: String(food.image || ''),
      s_available:
        food.s_available === true ||
        food.s_available === 1 ||
        food.s_available === '1'
    };

    this.showFoodForm = true;
  }


  // ==========================================
  // CLOSE FORM
  // ==========================================

  closeFoodForm(): void {

    this.showFoodForm = false;

    this.isEditMode = false;

    this.selectedFoodId = null;
  }


  // ==========================================
  // SAVE FOOD
  // ADD / EDIT
  // ==========================================

  saveFood(): void {

    if (
      !this.foodForm.category_id ||
      !this.foodForm.name.trim() ||
      !this.foodForm.price
    ) {

      alert(
        'Please fill Category ID, Food Name and Price.'
      );

      return;
    }


    // ========================================
    // ADD FOOD
    // ========================================

    if (!this.isEditMode) {

      this.http.post<any>(
        'https://smart-food-ordering-system.onrender.com/api/foods/add-food.php',

        {
          category_id:
            Number(this.foodForm.category_id),

          name:
            this.foodForm.name.trim(),

          description:
            this.foodForm.description.trim(),

          price:
            Number(this.foodForm.price),

          image:
            this.foodForm.image.trim(),

          s_available:
            this.foodForm.s_available
        }

      ).subscribe({

        next: (res) => {

          console.log('Add Food Response:', res);

          if (res?.success === true) {

            alert('Food added successfully.');

            this.closeFoodForm();

            this.getFoods();

          } else {

            alert(
              res?.message ||
              'Unable to add food.'
            );
          }
        },

        error: (error) => {

          console.error(
            'Add Food Error:',
            error
          );

          alert(
            error?.error?.message ||
            'Unable to connect to Add Food API.'
          );
        }
      });

      return;
    }


    // ========================================
    // EDIT FOOD
    // ========================================

    if (!this.selectedFoodId) {

      alert('Food ID is missing.');

      return;
    }


    this.http.patch<any>(
      'https://smart-food-ordering-system.onrender.com/api/foods/update-food.php',

      {
        id: this.selectedFoodId,

        category_id:
          Number(this.foodForm.category_id),

        name:
          this.foodForm.name.trim(),

        description:
          this.foodForm.description.trim(),

        price:
          Number(this.foodForm.price),

        image:
          this.foodForm.image.trim(),

        s_available:
          this.foodForm.s_available
      }

    ).subscribe({

      next: (res) => {

        console.log(
          'Update Food Response:',
          res
        );

        if (res?.success === true) {

          alert(
            'Food updated successfully.'
          );

          this.closeFoodForm();

          this.getFoods();

        } else {

          alert(
            res?.message ||
            'Unable to update food.'
          );
        }
      },

      error: (error) => {

        console.error(
          'Update Food Error:',
          error
        );

        alert(
          error?.error?.message ||
          'Unable to connect to Update Food API.'
        );
      }
    });
  }


  // ==========================================
  // DELETE FOOD
  // ==========================================

  deleteFood(food: any): void {

    if (!food?.id) {
      return;
    }


    const confirmDelete =
      confirm(
        `Are you sure you want to delete "${food.name}"?`
      );


    if (!confirmDelete) {
      return;
    }


    this.http.delete<any>(
      'https://smart-food-ordering-system.onrender.com/api/foods/delete-food.php',

      {
        body: {
          id: Number(food.id)
        }
      }

    ).subscribe({

      next: (res) => {

        console.log(
          'Delete Food Response:',
          res
        );

        if (res?.success === true) {

          alert(
            'Food deleted successfully.'
          );

          this.getFoods();

        } else {

          alert(
            res?.message ||
            'Unable to delete food.'
          );
        }
      },

      error: (error) => {

        console.error(
          'Delete Food Error:',
          error
        );

        alert(
          error?.error?.message ||
          'Unable to connect to Delete Food API.'
        );
      }
    });
  }


  // ==========================================
  // AVAILABILITY
  // ==========================================

  getAvailability(food: any): string {

    if (
      food?.s_available === true ||
      food?.s_available === 1 ||
      food?.s_available === '1'
    ) {

      return 'Available';
    }

    return 'Unavailable';
  }


  getAvailabilityClass(food: any): string {

    return this.getAvailability(food) === 'Available'
      ? 'available'
      : 'unavailable';
  }


  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  formatCurrency(amount: any): string {

    const value =
      Number(amount || 0);

    return '₹' +
      value.toLocaleString('en-IN');
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');

    this.router.navigate(['/admin-login']);
  }

}