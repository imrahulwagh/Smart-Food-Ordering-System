import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    AdminSidebar
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  adminUsername: string = 'Admin';
  adminEmail: string = 'admin@gmail.com';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const savedUsername = localStorage.getItem('adminUsername');
    const savedEmail = localStorage.getItem('adminEmail');

    if (savedUsername) {
      this.adminUsername = savedUsername;
    }

    if (savedEmail) {
      this.adminEmail = savedEmail;
    }

    this.getCategories();
  }

  getCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      'http://localhost:8000/api/categories/get-categories.php'
    ).subscribe({
      next: (res) => {
        console.log('Categories API response:', res);

        this.loading = false;

        if (res?.success === true) {
          this.categories = Array.isArray(res.categories)
            ? res.categories
            : [];
        } else {
          this.categories = [];
          this.errorMessage =
            res?.message || 'Unable to load categories.';
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Categories API Error:', error);

        this.loading = false;
        this.categories = [];

        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to categories API.';

        this.cdr.detectChanges();
      }
    });
  }

  get filteredCategories(): any[] {
    if (!this.searchText.trim()) {
      return this.categories;
    }

    const search = this.searchText
      .toLowerCase()
      .trim();

    return this.categories.filter((category) =>
      String(category.id)
        .toLowerCase()
        .includes(search) ||
      String(category.name || '')
        .toLowerCase()
        .includes(search)
    );
  }

  openAddForm(): void {
    this.showCategoryForm = true;
    this.isEditMode = false;
    this.selectedCategoryId = null;

    this.categoryForm = {
      name: '',
      image: ''
    };
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

    this.categoryForm = {
      name: '',
      image: ''
    };
  }

  saveCategory(): void {
    const name = this.categoryForm.name.trim();
    const image = this.categoryForm.image.trim();

    if (!name) {
      alert('Please enter category name.');
      return;
    }

    if (!image) {
      alert('Please enter category image.');
      return;
    }

    if (this.isEditMode) {

      if (!this.selectedCategoryId) {
        alert('Category ID is missing.');
        return;
      }

      const data = {
        id: this.selectedCategoryId,
        name: name,
        image: image
      };

      this.http.patch<any>(
        'http://localhost:8000/api/categories/update-category.php',
        data
      ).subscribe({
        next: (res) => {
          console.log('Update category response:', res);

          if (res?.success === true) {
            alert('Category updated successfully.');
            this.closeCategoryForm();
            this.getCategories();
          } else {
            alert(
              res?.message ||
              'Unable to update category.'
            );
          }
        },

        error: (error) => {
          console.error('Update category error:', error);

          alert(
            error?.error?.message ||
            'Unable to update category.'
          );
        }
      });

      return;
    }

    const data = {
      name: name,
      image: image
    };

    this.http.post<any>(
      'http://localhost:8000/api/categories/add-category.php',
      data
    ).subscribe({
      next: (res) => {
        console.log('Add category response:', res);

        if (res?.success === true) {
          alert('Category added successfully.');
          this.closeCategoryForm();
          this.getCategories();
        } else {
          alert(
            res?.message ||
            'Unable to add category.'
          );
        }
      },

      error: (error) => {
        console.error('Add category error:', error);

        alert(
          error?.error?.message ||
          'Unable to add category.'
        );
      }
    });
  }

  deleteCategory(category: any): void {
    if (!category?.id) {
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    this.http.delete<any>(
      'http://localhost:8000/api/categories/delete-category.php',
      {
        body: {
          id: category.id
        }
      }
    ).subscribe({
      next: (res) => {
        console.log('Delete category response:', res);

        if (res?.success === true) {
          alert('Category deleted successfully.');
          this.getCategories();
        } else {
          alert(
            res?.message ||
            'Unable to delete category.'
          );
        }
      },

      error: (error) => {
        console.error('Delete category error:', error);

        if (error?.status === 409) {
          const foodNames = error?.error?.foods || [];

          if (foodNames.length > 0) {
            alert(
              'Cannot delete this category.\n\n' +
              'Food using this category:\n' +
              foodNames.join('\n')
            );
          } else {
            alert(
              error?.error?.message ||
              'This category is being used by food items.'
            );
          }
        } else {
          alert(
            error?.error?.message ||
            'Unable to delete category.'
          );
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');

    this.router.navigate(['/admin-login']);
  }
}