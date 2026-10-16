import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
export class AdminSidebar implements OnInit {

  adminUsername: string = 'Admin';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.adminUsername = this.auth.getAdminUsername();
  }

  logout(): void {
    this.auth.logoutAdmin();
  }
}