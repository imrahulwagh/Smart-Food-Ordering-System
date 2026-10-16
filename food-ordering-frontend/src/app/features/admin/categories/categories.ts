import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  adminUsername: string = 'Admin';
  categories: any[] = [];
  searchText: string = '';
  loading: boolean = true;
  errorMessage: string = '';
  showCategoryForm: boolean = false;
  isEditMode: boolean = false;
  selectedCategoryId: number | null = null;

  categoryForm = {
    name: '',
    image: ''
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
  }

  getCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      `${environment.apiUrl}/categories/get-categories.php`
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success === true) {
          this.categories = Array.isArray(res.categories) ? res.categories : [];
        } else {
          this.categories = [];
          this.errorMessage = res?.message || 'Unable to load categories.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Categories API Error:', error);
        this.loading = false;
        this.categories = [];
        this.errorMessage = 'Unable to connect to categories API. The backend may be starting up — please retry.';
        this.cdr.detectChanges();
      }
    });
  }

  get filteredCategories(): any[] {
    if (!this.searchText.trim()) return this.categories;
    const search = this.searchText.toLowerCase().trim();
    return this.categories.filter((category) =>
      String(category.id).toLowerCase().includes(search) ||
      String(category.name || '').toLowerCase().includes(search)
    );
  }

  openAddForm(): void {
    this.showCategoryForm = true;
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryForm = { name: '', image: '' };
  }

  openEditForm(category: any): void {
    this.showCategoryForm = true;
    this.isEditMode = true;
    this.selectedCategoryId = Number(category.id);
    this.categoryForm = {
      name: category.name || '',
      image: category.image || ''
    };
  }

  closeCategoryForm(): void {
    this.showCategoryForm = false;
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryForm = { name: '', image: '' };
  }

  saveCategory(): void {
    const name = this.categoryForm.name.trim();
    const image = this.categoryForm.image.trim();

    if (!name) { alert('Please enter category name.'); return; }
    if (!image) { alert('Please enter category image URL.'); return; }

    if (this.isEditMode) {
      if (!this.selectedCategoryId) { alert('Category ID is missing.'); return; }

      this.http.patch<any>(
        `${environment.apiUrl}/categories/update-category.php`,
        { id: this.selectedCategoryId, name, image }
      ).subscribe({
        next: (res) => {
          if (res?.success === true) {
            this.closeCategoryForm();
            this.getCategories();
          } else {
            alert(res?.message || 'Unable to update category.');
          }
        },
        error: (error) => alert(error?.error?.message || 'Unable to update category.')
      });
      return;
    }

    this.http.post<any>(
      `${environment.apiUrl}/categories/add-category.php`,
      { name, image }
    ).subscribe({
      next: (res) => {
        if (res?.success === true) {
          this.closeCategoryForm();
          this.getCategories();
        } else {
          alert(res?.message || 'Unable to add category.');
        }
      },
      error: (error) => alert(error?.error?.message || 'Unable to add category.')
    });
  }

  deleteCategory(category: any): void {
    if (!category?.id) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${category.name}"?\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    this.http.delete<any>(
      `${environment.apiUrl}/categories/delete-category.php`,
      { body: { id: category.id } }
    ).subscribe({
      next: (res) => {
        if (res?.success === true) {
          this.getCategories();
        } else {
          alert(res?.message || 'Unable to delete category.');
        }
      },
      error: (error) => {
        if (error?.status === 409) {
          const foodNames = error?.error?.foods || [];
          if (foodNames.length > 0) {
            alert('Cannot delete this category.\n\nFood items using this category:\n' + foodNames.join('\n'));
          } else {
            alert(error?.error?.message || 'This category is being used by food items.');
          }
        } else {
          alert(error?.error?.message || 'Unable to delete category.');
        }
      }
    });
  }

  logout(): void {
    this.auth.logoutAdmin();
  }
}