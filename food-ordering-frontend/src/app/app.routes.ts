import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // ==========================================
  // PUBLIC ROUTES
  // ==========================================

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot/forgotPassword').then(m => m.ForgotPassword)
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./features/food/menu/menu').then(m => m.Menu)
  },
  {
    path: 'restaurants',
    loadComponent: () =>
      import('./features/restaurants/restaurants').then(m => m.Restaurants)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about').then(m => m.About)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact').then(m => m.Contact)
  },

  // ==========================================
  // CUSTOMER PROTECTED ROUTES
  // ==========================================

  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart').then(m => m.Cart),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/orders').then(m => m.Orders),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },

  // ==========================================
  // ADMIN AUTH
  // ==========================================

  {
    path: 'admin-login',
    loadComponent: () =>
      import('./features/auth/admin-login/admin-login').then(m => m.AdminLogin)
  },

  // ==========================================
  // ADMIN PROTECTED ROUTES
  // ==========================================

  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/orders',
    loadComponent: () =>
      import('./features/admin/orders/orders').then(m => m.Orders),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/orders/:id',
    loadComponent: () =>
      import('./features/admin/order-details/order-details').then(m => m.OrderDetails),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/foods',
    loadComponent: () =>
      import('./features/admin/foods/foods').then(m => m.Foods),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/categories',
    loadComponent: () =>
      import('./features/admin/categories/categories').then(m => m.Categories),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./features/admin/users/users').then(m => m.Users),
    canActivate: [adminGuard]
  },

  // ==========================================
  // DEMO / 404
  // ==========================================

  {
    path: 'demo',
    loadComponent: () =>
      import('./features/demo/demo').then(m => m.Demo)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];