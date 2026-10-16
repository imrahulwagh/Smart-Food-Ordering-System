import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-foods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './foods.html',
  styleUrl: './foods.css'
})
export class Foods implements OnInit {

  adminUsername: string = 'Admin';
  foods: any[] = [];
  categories: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  searchText: string = '';

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
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.adminUsername = this.auth.getAdminUsername();
    this.getCategories();
    this.getFoods();
  }

  getCategories(): void {
    this.http.get<any>(`${environment.apiUrl}/categories/get-categories.php`).subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.categories)) {
          this.categories = res.categories;
        }
      },
      error: () => {}
    });
  }

  getCategoryName(catId: any): string {
    if (!catId) return '—';
    const found = this.categories.find(c => Number(c.id) === Number(catId));
    return found ? found.name : `ID #${catId}`;
  }

  // ==========================================
  // GET FOODS
  // ==========================================

  getFoods(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      `${environment.apiUrl}/foods/get-food.php`
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success === true) {
          this.foods = Array.isArray(res.foods) ? res.foods : [];
        } else {
          this.foods = [];
          this.errorMessage = res?.message || 'Unable to load foods.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Foods API Error:', error);
        this.loading = false;
        this.foods = [];
        this.errorMessage = 'Unable to connect to foods API. The backend may be starting up — please retry.';
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // SEARCH
  // ==========================================

  get filteredFoods(): any[] {
    if (!this.searchText.trim()) return this.foods;
    const search = this.searchText.toLowerCase().trim();
    return this.foods.filter((food: any) =>
      String(food.name || '').toLowerCase().includes(search) ||
      String(food.description || '').toLowerCase().includes(search)
    );
  }

  // ==========================================
  // FORMS
  // ==========================================

  openAddForm(): void {
    this.isEditMode = false;
    this.selectedFoodId = null;
    this.foodForm = { category_id: '', name: '', description: '', price: '', image: '', s_available: true };
    this.showFoodForm = true;
  }

  openEditForm(food: any): void {
    this.isEditMode = true;
    this.selectedFoodId = Number(food.id);
    this.foodForm = {
      category_id: String(food.category_id || ''),
      name: String(food.name || ''),
      description: String(food.description || ''),
      price: String(food.price || ''),
      image: String(food.image || ''),
      s_available: food.s_available === true || food.s_available === 1 || food.s_available === '1'
    };
    this.showFoodForm = true;
  }

  closeFoodForm(): void {
    this.showFoodForm = false;
    this.isEditMode = false;
    this.selectedFoodId = null;
  }

  // ==========================================
  // SAVE FOOD (ADD / EDIT)
  // ==========================================

  saveFood(): void {
    if (!this.foodForm.category_id || !this.foodForm.name.trim() || !this.foodForm.price) {
      alert('Please fill in Category ID, Food Name, and Price.');
      return;
    }

    const payload = {
      category_id: Number(this.foodForm.category_id),
      name: this.foodForm.name.trim(),
      description: this.foodForm.description.trim(),
      price: Number(this.foodForm.price),
      image: this.foodForm.image.trim(),
      s_available: this.foodForm.s_available
    };

    if (!this.isEditMode) {
      this.http.post<any>(`${environment.apiUrl}/foods/add-food.php`, payload).subscribe({
        next: (res) => {
          if (res?.success === true) { this.closeFoodForm(); this.getFoods(); }
          else { alert(res?.message || 'Unable to add food.'); }
        },
        error: (error) => alert(error?.error?.message || 'Unable to add food.')
      });
      return;
    }

    if (!this.selectedFoodId) { alert('Food ID is missing.'); return; }

    this.http.patch<any>(`${environment.apiUrl}/foods/update-food.php`,
      { ...payload, id: this.selectedFoodId }
    ).subscribe({
      next: (res) => {
        if (res?.success === true) { this.closeFoodForm(); this.getFoods(); }
        else { alert(res?.message || 'Unable to update food.'); }
      },
      error: (error) => alert(error?.error?.message || 'Unable to update food.')
    });
  }

  // ==========================================
  // DELETE FOOD
  // ==========================================

  deleteFood(food: any): void {
    if (!food?.id) return;

    if (!confirm(`Are you sure you want to delete "${food.name}"?\nThis action cannot be undone.`)) return;

    this.http.delete<any>(
      `${environment.apiUrl}/foods/delete-food.php`,
      { body: { id: Number(food.id) } }
    ).subscribe({
      next: (res) => {
        if (res?.success === true) { this.getFoods(); }
        else { alert(res?.message || 'Unable to delete food.'); }
      },
      error: (error) => alert(error?.error?.message || 'Unable to delete food.')
    });
  }

  // ==========================================
  // AVAILABILITY
  // ==========================================

  getAvailability(food: any): string {
    return (food?.s_available === true || food?.s_available === 1 || food?.s_available === '1')
      ? 'Available' : 'Unavailable';
  }

  getAvailabilityClass(food: any): string {
    return this.getAvailability(food) === 'Available' ? 'available' : 'unavailable';
  }

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  formatCurrency(amount: any): string {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {
    this.auth.logoutAdmin();
  }

}