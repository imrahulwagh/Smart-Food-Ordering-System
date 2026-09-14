import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css'
})
export class AdminSidebar {

  adminUsername: string = 'Admin';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const savedUsername = localStorage.getItem('adminUsername');

    if (savedUsername) {
      this.adminUsername = savedUsername;
    }
  }

  logout(): void {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');

    this.router.navigate(['/admin-login']);
  }
}