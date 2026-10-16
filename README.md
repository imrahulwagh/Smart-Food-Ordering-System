# 🍕 Smart Food Ordering System (Foodie)

[![Angular](https://img.shields.io/badge/Angular-18+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-Backend%20Hosting-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend%20Hosting-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A modern, full-stack online food ordering and restaurant management platform. Built with **Angular** standalone components, responsive Vanilla CSS, a **PHP REST API** backend, and **Supabase** (PostgreSQL + Auth).

---

## 🚀 Live Deployments

- **Frontend (Vercel):** [Deployed on Vercel](https://food-ordering-frontend-ten.vercel.app)
- **Backend API (Render):** `https://smart-food-ordering-system.onrender.com/api`
- **Database:** Supabase Managed PostgreSQL & Authentication

---

## ✨ Features

### 👤 Customer App
- **Browse & Filter:** 7 curated categories (Pizza, Burgers, Biryani, Chinese, South Indian, Desserts, Beverages) and 35+ items with high-resolution imagery.
- **Instant Search:** Real-time food search by dish name and description.
- **Cart & Checkout:** Add items, modify quantities, review cart totals, and place orders with delivery address and phone number (Cash on Delivery / Online).
- **Order Tracking:** Track order history, order items, timestamps, and live statuses (*Pending, Confirmed, Preparing, Ready, Out for Delivery, Delivered*).
- **Fast Authentication:** Client-side email validation with rapid response handling (< 8s max).

### 🛠️ Admin Management Panel
- **Dashboard:** Real-time metrics for total orders, total revenue (₹), pending, preparing, and delivered orders, plus recent orders table.
- **Order Management:** View all customer orders, filter by status, and update order progress with a single click.
- **Food Items Management:** Full CRUD (Create, Read, Update, Delete) with category dropdown selection and live web image URL preview.
- **Category Management:** Manage menu categories with category icons and cover imagery.
- **User Directory:** View registered customers and profile details.
- **Secure Admin Authentication:** Session-based admin login with automatic logout on tab close.

---

## 🏗️ Architecture & Tech Stack

```text
┌─────────────────────────────────┐      HTTP REST      ┌─────────────────────────────────┐
│     Angular 18 Frontend         │ ──────────────────> │         PHP 8.4 Backend         │
│  (Vercel SPA Hosting)           │ <────────────────── │      (Render Web Service)       │
└─────────────────────────────────┘                     └────────────────┬────────────────┘
                                                                         │
                                                                         │ cURL HTTPS
                                                                         ▼
                                                        ┌─────────────────────────────────┐
                                                        │       Supabase Cloud            │
                                                        │  - PostgreSQL Database          │
                                                        │  - Supabase Auth API            │
                                                        │  - PostgREST REST API           │
                                                        └─────────────────────────────────┘
```

- **Frontend:** Angular 18 (Standalone Components, Signals, RxJS, HttpClient, Router)
- **Styling:** Custom Vanilla CSS with modern cards, responsive grids, and Bootstrap Icons
- **Backend:** PHP 8.4 RESTful API with structured endpoint routing and cURL client
- **Database:** Supabase PostgreSQL with 7 relational tables
- **Authentication:** Supabase GoTrue Auth for customers, secure hashed admin verification

---

## 📁 Repository Structure

```text
Smart-Food-Ordering-System/
├── supabase_schema.sql         # Complete PostgreSQL schema (7 tables)
├── seed_data.sql               # 7 categories & 35 food items with working images
├── vercel.json                 # Root Vercel build & SPA rewrite config
├── README.md                   # Project documentation
│
├── food-ordering-backend/      # PHP Backend API
│   ├── api/
│   │   ├── admin/              # Admin endpoints (get-dashboard, get-orders, update-order-status)
│   │   ├── auth/               # Auth endpoints (login, register, admin-login)
│   │   ├── cart/               # Shopping cart endpoints
│   │   ├── categories/         # Category endpoints
│   │   ├── foods/              # Food CRUD endpoints
│   │   ├── orders/             # Customer order endpoints
│   │   └── users/              # User management endpoints
│   ├── config/
│   │   └── db.php              # Supabase connection & environment loader
│   ├── .env.example            # Environment variables template
│   └── Dockerfile              # Docker container setup for Render
│
└── food-ordering-frontend/     # Angular Frontend
    ├── src/
    │   ├── app/
    │   │   ├── core/           # Services (Auth, Cart, Food) & Guards
    │   │   ├── features/       # Feature pages (home, menu, cart, checkout, admin, auth)
    │   │   └── shared/         # Reusable components (Navbar, Footer, AdminSidebar)
    │   └── environments/       # Environment configs (development & production)
    ├── package.json
    └── vercel.json             # Frontend SPA rewrite rules
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have:
1. **Node.js**: v18.19.0 or higher ([Download Node.js](https://nodejs.org/))
2. **PHP**: v8.1 or higher with `curl` and `json` extensions enabled ([Download PHP](https://www.php.net/downloads))
3. **Git**: Installed on your system
4. **Supabase Account**: Free account at [supabase.com](https://supabase.com)

---

## 💾 Database Setup (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. In the left navigation, open the **SQL Editor**.
3. Create a **New Query**, copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql), paste and click **Run**.
   - This creates all 7 tables: `profiles`, `categories`, `food_items`, `cart_items`, `orders`, `order_items`, and `admin`.
4. Create another **New Query**, copy the entire contents of [`seed_data.sql`](./seed_data.sql), paste and click **Run**.
   - This populates 7 categories and 35 menu items with verified high-resolution food images.
5. In Supabase, go to **Project Settings -> API** to get:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon / public key**
   - **service_role secret key**

---

## 💻 Local Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/imrahulwagh/Smart-Food-Ordering-System.git
cd Smart-Food-Ordering-System
```

---

### 2. Configure & Run Backend (PHP)

1. Navigate to the backend directory:
   ```bash
   cd food-ordering-backend
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   SUPABASE_SECRET_KEY=your-supabase-service-role-key
   ```
4. Start the local PHP development server:
   ```bash
   php -S localhost:8000
   ```
   *The backend API will be running at `http://localhost:8000/api`.*

---

### 3. Configure & Run Frontend (Angular)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd food-ordering-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your API URL in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8000/api' // or your live Render API URL
   };
   ```
4. Start the Angular development server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to:
   ```text
   http://localhost:4200
   ```

---

## 🌐 Deployment Instructions

### Deploy Backend on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `Smart-Food-Ordering-System`.
4. Configure service settings:
   - **Name:** `smart-food-ordering-system`
   - **Root Directory:** `food-ordering-backend`
   - **Runtime:** `Docker` (Render will automatically detect `food-ordering-backend/Dockerfile`)
   - **Instance Type:** `Free`
5. Add the following **Environment Variables** in the Render settings:
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_KEY` = `your-supabase-anon-key`
   - `SUPABASE_SECRET_KEY` = `your-supabase-service-role-key`
6. Click **Deploy Web Service**. Your API will be live at `https://<your-service>.onrender.com/api`.

---

### Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project** and import `Smart-Food-Ordering-System`.
3. Configure project settings:
   - **Framework Preset:** `Angular`
   - **Root Directory:** `food-ordering-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/food-ordering-frontend/browser`
4. In `food-ordering-frontend/src/environments/environment.prod.ts`, ensure `apiUrl` points to your live Render backend URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://smart-food-ordering-system.onrender.com/api'
   };
   ```
5. Click **Deploy**. Vercel will build and deploy the SPA with all client-side routes handled by `vercel.json`.

---

## 🔐 Default Credentials

### Administrator Account
- **Admin Login Route:** `/admin-login`
- **Username:** `admin`
- **Password:** `adminpassword`
*(Configured in `supabase_schema.sql` under the `admin` table. Change this password after initial deployment).*

### Customer Account
- **Customer Login Route:** `/login`
- **Registration Route:** `/register`
- New customers can register instantly with their Name, Email, Phone, and Password.

---

## 🛡️ Security Features

- **Rapid Credential Validation:** Missing credentials or invalid email formats are caught instantly on the client side (< 50ms) without hanging.
- **Fail-Safe Timeouts:** Network requests capped at 8 seconds so users never experience indefinitely frozen loading spinners.
- **Clean Fallback Handling:** Supabase query errors or empty table states return safe fallback structures (0 stats, empty arrays) to prevent UI crashes.
- **SQL Injection Prevention:** Parameterized queries and sanitized inputs via Supabase REST API endpoints.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
