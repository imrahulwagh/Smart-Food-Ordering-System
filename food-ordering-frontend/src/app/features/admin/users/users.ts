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
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    AdminSidebar
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  adminUsername: string = 'Admin';
  adminEmail: string = 'admin@gmail.com';

  users: any[] = [];

  searchText: string = '';

  loading: boolean = true;
  errorMessage: string = '';

  showUserForm: boolean = false;
  isEditMode: boolean = false;

  selectedUserId: string | null = null;

  userForm = {
    full_name: '',
    phone: '',
    email: '',
    photo: ''
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

    this.getUsers();
  }


  // --------------------------------------------------
  // GET USERS
  // --------------------------------------------------

  getUsers(): void {

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      'https://smart-food-ordering-system.onrender.com/api/users/get-users.php'
    ).subscribe({

      next: (res) => {

        console.log('Users API response:', res);

        this.loading = false;

        if (res?.success === true) {

          this.users =
            Array.isArray(res.users)
              ? res.users
              : [];

        } else {

          this.users = [];

          this.errorMessage =
            res?.message ||
            'Unable to load users.';
        }

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Users API Error:',
          error
        );

        this.loading = false;
        this.users = [];

        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to users API.';

        this.cdr.detectChanges();
      }
    });
  }


  // --------------------------------------------------
  // SEARCH USERS
  // --------------------------------------------------

  get filteredUsers(): any[] {

    if (!this.searchText.trim()) {
      return this.users;
    }

    const search =
      this.searchText
        .toLowerCase()
        .trim();

    return this.users.filter((user) => {

      return (
        String(user.id || '')
          .toLowerCase()
          .includes(search) ||

        String(user.full_name || '')
          .toLowerCase()
          .includes(search) ||

        String(user.email || '')
          .toLowerCase()
          .includes(search) ||

        String(user.phone || '')
          .toLowerCase()
          .includes(search)
      );

    });
  }


  // --------------------------------------------------
  // EDIT USER
  // --------------------------------------------------

  openEditForm(user: any): void {

    this.showUserForm = true;
    this.isEditMode = true;

    this.selectedUserId = user.id;

    this.userForm = {
      full_name: user.full_name || '',
      phone: user.phone || '',
      email: user.email || '',
      photo: user.photo || ''
    };
  }


  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  closeUserForm(): void {

    this.showUserForm = false;
    this.isEditMode = false;

    this.selectedUserId = null;

    this.userForm = {
      full_name: '',
      phone: '',
      email: '',
      photo: ''
    };
  }


  // --------------------------------------------------
  // UPDATE USER
  // --------------------------------------------------

  updateUser(): void {

    if (!this.selectedUserId) {

      alert('User ID is missing.');

      return;
    }

    const full_name =
      this.userForm.full_name.trim();

    const phone =
      this.userForm.phone.trim();

    const email =
      this.userForm.email.trim();

    const photo =
      this.userForm.photo.trim();


    if (!full_name) {

      alert('Please enter full name.');

      return;
    }

    if (!email) {

      alert('Please enter email.');

      return;
    }


    const data = {

      id: this.selectedUserId,

      full_name: full_name,

      phone: phone,

      email: email,

      photo: photo

    };


    this.http.patch<any>(
      'https://smart-food-ordering-system.onrender.com/api/users/update-user.php',
      data
    ).subscribe({

      next: (res) => {

        console.log(
          'Update user response:',
          res
        );

        if (res?.success === true) {

          alert(
            'User updated successfully.'
          );

          this.closeUserForm();

          this.getUsers();

        } else {

          alert(
            res?.message ||
            'Unable to update user.'
          );
        }
      },

      error: (error) => {

        console.error(
          'Update user error:',
          error
        );

        alert(
          error?.error?.message ||
          'Unable to update user.'
        );
      }
    });
  }


  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  deleteUser(user: any): void {

    if (!user?.id) {
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete "${user.full_name}"?`
    );

    if (!confirmDelete) {
      return;
    }


    this.http.delete<any>(
      'https://smart-food-ordering-system.onrender.com/api/users/delete-user.php',
      {
        body: {
          id: user.id
        }
      }
    ).subscribe({

      next: (res) => {

        console.log(
          'Delete user response:',
          res
        );

        if (res?.success === true) {

          alert(
            'User deleted successfully.'
          );

          this.getUsers();

        } else {

          alert(
            res?.message ||
            'Unable to delete user.'
          );
        }
      },

      error: (error) => {

        console.error(
          'Delete user error:',
          error
        );


        // Foreign key error

        if (error?.status === 409 ||
            error?.status === 400 ||
            error?.status === 500) {

          const message =
            error?.error?.error?.message ||
            error?.error?.message ||
            '';

          if (
            message.includes('orders') ||
            message.includes('foreign key') ||
            message.includes('referenced')
          ) {

            alert(
              'This user cannot be deleted because the user has existing orders.'
            );

            return;
          }
        }


        alert(
          error?.error?.message ||
          'Unable to delete user.'
        );
      }
    });
  }


  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  formatDate(dateValue: any): string {

    if (!dateValue) {
      return '-';
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  }


  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  logout(): void {

    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');

    this.router.navigate([
      '/admin-login'
    ]);
  }
}