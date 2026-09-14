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
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [
  CommonModule,
  RouterLink,
  RouterLinkActive,
  AdminSidebar
],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css'
})


export class Dashboard implements OnInit {


  // ==========================================
  // ADMIN DETAILS
  // ==========================================

  adminUsername: string = 'Admin';

  adminEmail: string = 'admin@gmail.com';

  adminId: string = '1';


  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  totalOrders: number = 0;

  totalRevenue: number = 0;

  pendingOrders: number = 0;

  preparingOrders: number = 0;

  deliveredOrders: number = 0;


  // ==========================================
  // RECENT ORDERS
  // ==========================================

  recentOrders: any[] = [];


  // ==========================================
  // LOADING
  // ==========================================

  loading: boolean = true;


  // ==========================================
  // ERROR
  // ==========================================

  errorMessage: string = '';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private router: Router,

    private http: HttpClient,

    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // PAGE LOAD
  // ==========================================

  ngOnInit(): void {


    const savedUsername =
      localStorage.getItem('adminUsername');


    const savedEmail =
      localStorage.getItem('adminEmail');


    const savedAdminId =
      localStorage.getItem('adminId');


    if (savedUsername) {

      this.adminUsername =
        savedUsername;

    }


    if (savedEmail) {

      this.adminEmail =
        savedEmail;

    }


    if (savedAdminId) {

      this.adminId =
        savedAdminId;

    }


    this.getDashboardData();

  }


  // ==========================================
  // GET DASHBOARD DATA
  // ==========================================

  getDashboardData(): void {


    this.loading = true;

    this.errorMessage = '';


    this.http.get<any>(
      'http://localhost:8000/api/admin/get-dashboard.php'
    )

    .subscribe({


      // ======================================
      // SUCCESS
      // ======================================

      next: (res) => {


        console.log(
          'Dashboard API response:',
          res
        );


        this.loading = false;


        if (res?.success === true) {


          // ==================================
          // TOTAL ORDERS
          // ==================================

          this.totalOrders =
            Number(
              res.stats?.totalOrders || 0
            );


          // ==================================
          // TOTAL REVENUE
          // ==================================

          this.totalRevenue =
            Number(
              res.stats?.totalRevenue || 0
            );


          // ==================================
          // PENDING
          // ==================================

          this.pendingOrders =
            Number(
              res.stats?.pendingOrders || 0
            );


          // ==================================
          // PREPARING
          // ==================================

          this.preparingOrders =
            Number(
              res.stats?.preparingOrders || 0
            );


          // ==================================
          // DELIVERED
          // ==================================

          this.deliveredOrders =
            Number(
              res.stats?.deliveredOrders || 0
            );


          // ==================================
          // RECENT ORDERS
          // ==================================

          this.recentOrders =
            Array.isArray(
              res.recentOrders
            )
              ? res.recentOrders
              : [];


          this.cdr.detectChanges();

        }


        else {


          this.errorMessage =
            res?.message ||
            'Unable to load dashboard data.';


          this.recentOrders = [];


          this.cdr.detectChanges();

        }

      },


      // ======================================
      // ERROR
      // ======================================

      error: (error) => {


        console.error(
          'Dashboard API Error:',
          error
        );


        this.loading = false;


        this.recentOrders = [];


        this.errorMessage =
          error?.error?.message ||
          'Unable to connect to dashboard API.';


        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // FORMAT DATE
  // ==========================================

  formatDate(
    dateValue: any
  ): string {


    if (!dateValue) {

      return '-';

    }


    const date =
      new Date(dateValue);


    if (
      isNaN(
        date.getTime()
      )
    ) {

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


  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  formatCurrency(
    amount: any
  ): string {


    const value =
      Number(amount || 0);


    return '₹' +
      value.toLocaleString(
        'en-IN'
      );

  }


  // ==========================================
  // STATUS CLASS
  // ==========================================

  getStatusClass(
    status: string
  ): string {


    if (!status) {

      return 'status-pending';

    }


    switch (
      status.toLowerCase()
    ) {


      case 'pending':

        return 'status-pending';


      case 'confirmed':

        return 'status-confirmed';


      case 'preparing':

        return 'status-preparing';


      case 'ready':

        return 'status-ready';


      case 'out for delivery':

        return 'status-out';


      case 'delivered':

        return 'status-delivered';


      case 'cancelled':

        return 'status-cancelled';


      case 'canceled':

        return 'status-cancelled';


      default:

        return 'status-pending';

    }

  }


  // ==========================================
  // VIEW ALL ORDERS
  // ==========================================

  viewAllOrders(): void {


    this.router.navigate([
      '/admin/orders'
    ]);

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {


    localStorage.removeItem(
      'adminId'
    );


    localStorage.removeItem(
      'adminUsername'
    );


    localStorage.removeItem(
      'adminEmail'
    );


    localStorage.removeItem(
      'adminLoggedIn'
    );


    this.router.navigate([
      '/admin-login'
    ]);

  }

}