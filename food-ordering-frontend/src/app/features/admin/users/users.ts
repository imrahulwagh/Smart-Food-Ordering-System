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
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  adminUsername: string = 'Admin';
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
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.adminUsername = this.auth.getAdminUsername();
    this.getUsers();
  }

  // --------------------------------------------------
  // GET USERS
  // --------------------------------------------------

  getUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      `${environment.apiUrl}/users/get-users.php`
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success === true) {
          this.users = Array.isArray(res.users) ? res.users : [];
        } else {
          this.users = [];
          this.errorMessage = res?.message || 'Unable to load users.';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Users API Error:', error);
        this.loading = false;
        this.users = [];
        this.errorMessage = 'Unable to connect to users API. The backend may be starting up — please retry.';
        this.cdr.detectChanges();
      }
    });
  }

  // --------------------------------------------------
  // SEARCH USERS
  // --------------------------------------------------

  get filteredUsers(): any[] {
    if (!this.searchText.trim()) return this.users;
    const search = this.searchText.toLowerCase().trim();
    return this.users.filter((user) =>
      String(user.id || '').toLowerCase().includes(search) ||
      String(user.full_name || '').toLowerCase().includes(search) ||
      String(user.email || '').toLowerCase().includes(search) ||
      String(user.phone || '').toLowerCase().includes(search)
    );
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

  closeUserForm(): void {
    this.showUserForm = false;
    this.isEditMode = false;
    this.selectedUserId = null;
    this.userForm = { full_name: '', phone: '', email: '', photo: '' };
  }

  // --------------------------------------------------
  // UPDATE USER
  // --------------------------------------------------

  updateUser(): void {
    if (!this.selectedUserId) { alert('User ID is missing.'); return; }

    const full_name = this.userForm.full_name.trim();
    const email = this.userForm.email.trim();

    if (!full_name) { alert('Please enter full name.'); return; }
    if (!email) { alert('Please enter email.'); return; }

    this.http.patch<any>(
      `${environment.apiUrl}/users/update-user.php`,
      {
        id: this.selectedUserId,
        full_name,
        phone: this.userForm.phone.trim(),
        email,
        photo: this.userForm.photo.trim()
      }
    ).subscribe({
      next: (res) => {
        if (res?.success === true) { this.closeUserForm(); this.getUsers(); }
        else { alert(res?.message || 'Unable to update user.'); }
      },
      error: (error) => alert(error?.error?.message || 'Unable to update user.')
    });
  }

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  deleteUser(user: any): void {
    if (!user?.id) return;

    if (!confirm(`Are you sure you want to delete "${user.full_name}"?\nThis action cannot be undone.`)) return;

    this.http.delete<any>(
      `${environment.apiUrl}/users/delete-user.php`,
      { body: { id: user.id } }
    ).subscribe({
      next: (res) => {
        if (res?.success === true) { this.getUsers(); }
        else { alert(res?.message || 'Unable to delete user.'); }
      },
      error: (error) => {
        const message = error?.error?.error?.message || error?.error?.message || '';
        if (message.includes('orders') || message.includes('foreign key') || message.includes('referenced')) {
          alert('This user cannot be deleted because they have existing orders.');
        } else {
          alert(error?.error?.message || 'Unable to delete user.');
        }
      }
    });
  }

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  formatDate(dateValue: any): string {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  logout(): void {
    this.auth.logoutAdmin();
  }
}