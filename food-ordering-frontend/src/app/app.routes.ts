import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Demo } from './features/demo/demo';
import { Checkout } from './features/checkout/checkout';
import { Orders as CustomerOrders } from './features/orders/orders';
import { AdminLogin } from './features/auth/admin-login/admin-login';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Orders as AdminOrders } from './features/admin/orders/orders';
import { OrderDetails } from './features/admin/order-details/order-details';
import { Foods } from './features/admin/foods/foods';
import { Categories } from './features/admin/categories/categories';
import { Users } from './features/admin/users/users';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'login',
    component: Login
  },
  {
  path: 'register',
  loadComponent: () =>
    import('./features/auth/register/register')
      .then(m => m.Register)
},
{
  path: 'forgot-password',
  loadComponent: () =>
    import('./features/auth/forgot/forgotPassword')
      .then(m => m.ForgotPassword)
}
,
{
  path: 'menu',
  loadComponent: () =>
    import('./features/food/menu/menu')
      .then(m => m.Menu)
},
{
  path: 'cart',
  loadComponent: () =>
    import('./features/cart/cart')
      .then(m => m.Cart)
}
,{
  path: 'restaurants',
  loadComponent: () =>
    import('./features/restaurants/restaurants')
      .then(m => m.Restaurants)
},
{
  path: 'about',
  loadComponent: () =>
    import('./features/about/about')
      .then(m => m.About)
},
{
  path: 'contact',
  loadComponent: () =>
    import('./features/contact/contact')
      .then(m => m.Contact)
},
{
  path: 'profile',
  loadComponent: () =>
    import('./features/profile/profile')
      .then(m => m.Profile)
},


{
    path: 'demo',
    component: Demo
  }
,
{
  path: 'checkout',
  component: Checkout
}
,
{
  path: 'orders',
  component: CustomerOrders
}
,
{ path: 'admin-login',
   component: AdminLogin
  
},
{
  path: 'admin/dashboard',
  component: Dashboard
},
{
  path: 'admin/orders',
  component: AdminOrders
}
,
{ 
  path: 'admin/orders/:id'
  , component: OrderDetails
},
{ 
  path: 'admin/foods', 
  component: Foods 
},
{
  path: 'admin/categories',
  component: Categories
},
{
  path: 'admin/users',
  component: Users
}
];