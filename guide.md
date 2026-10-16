# Smart Food Ordering System --- Development Guide

> Living project log and workflow. Update this file whenever a phase is
> completed, a major decision changes, or a new GitHub checkpoint is
> created.

## 1. Project goal

Upgrade the existing Smart Food Ordering System into a modern,
responsive, production-ready food-ordering website inspired by Zomato
and Swiggy, while preserving and improving the existing project rather
than rebuilding blindly.

Main goals: - Get the existing application running locally and establish
a known-good baseline. - Audit the codebase, identify bugs and security
risks, and fix them systematically. - Remove files only after confirming
they are unused and unnecessary. - Move the application from a friend's
Supabase project to a new Supabase project owned by the project owner. -
Recreate and validate the database schema, policies, and required data
safely. - Improve the user experience and implement a complete
food-ordering flow. - Keep GitHub updated with small, reviewed, stable
commits throughout development. - Verify deployment on Vercel and
document configuration needed for future maintenance.

## 2. Repository and local paths

**GitHub repository:**
https://github.com/imrahulwagh/Smart-Food-Ordering-System

**Deployed website:** https://smart-food-ordering-system.vercel.app/

**Local project root on the developer's Windows machine:**
`D:\Project\WP Project\Smart-Food-Ordering-System`

**Frontend folder:**
`D:\Project\WP Project\Smart-Food-Ordering-System\food-ordering-frontend`

**Backend folder:**
`D:\Project\WP Project\Smart-Food-Ordering-System\food-ordering-backend`

Repository folders observed: - `food-ordering-frontend` --- Angular
application. - `food-ordering-backend` --- PHP backend with `api`,
`config`, `Dockerfile`, `index.php`, and `test.php`. - Root
`.gitignore`.

## 3. Current technology and environment

Observed or reported: - Windows 11, build `10.0.26100.5074` - Git
`2.53.0.windows.1` - Node.js `v24.12.0` - npm `11.6.2` - PHP `8.5.10`
CLI, working at `C:\php\php.exe` - Angular CLI is invoked through the
project's npm script (`npm start` → `ng serve`).

PHP PATH was fixed by adding `C:\php` to the Windows user PATH.
Confirmed commands:

``` cmd
php --version
where php
```

`where php` returned `C:\php\php.exe`.

## 4. Instructions and working rules

Follow these instructions for all future sessions on this project:

1.  Continue from the existing GitHub repository; do not replace it with
    a new project without a clear reason.
2.  Work in small phases and explain commands in beginner-friendly,
    simple English.
3.  Give commands for Windows Command Prompt unless PowerShell is
    specifically needed. Quote paths that contain spaces.
4.  Before editing or deleting files, inspect the existing code and
    understand its purpose.
5.  Never delete files merely because they look unnecessary. Verify
    references, build/test results, and configuration first.
6.  Never run a potentially breaking dependency upgrade blindly. Review
    `npm audit`, package versions, lockfile changes, and build/tests.
7.  Never ask the owner to paste passwords, Supabase service-role keys,
    database connection strings, API secrets, or other credentials into
    chat.
8.  Do not modify or break the friend's Supabase project. Create a
    separate project in the owner's own Supabase account and migrate
    deliberately.
9.  Use environment variables for credentials. Keep `.env` files and
    secrets out of Git; only commit safe examples such as
    `.env.example`.
10. Design and verify Supabase Row Level Security (RLS), authorization,
    and ownership rules before production use.
11. Test each meaningful change locally. Do not claim something works
    until it has been tested.
12. Push stable, reviewed checkpoints to GitHub regularly. Never commit
    secrets, generated junk, or unrelated changes.
13. Update this `guide.md` after each significant phase with completed
    work, decisions, current state, issues, and next steps.
14. Preserve existing working features while improving UI,
    accessibility, responsive behavior, reliability, and security.
15. Treat production readiness as more than appearance: include
    validation, error/loading/empty states, secure access control, order
    integrity, and deployment checks.

## 5. Git workflow and checkpointing

Run Git commands from the repository root:

``` cmd
cd /d "D:\Project\WP Project\Smart-Food-Ordering-System"
git status
```

Before work:

``` cmd
git status
git log -5 --oneline
```

After a completed and tested milestone, review what will be committed:

``` cmd
git diff
git status
git add <specific-files>
git diff --cached
git commit -m "type: short description"
git push origin main
```

Prefer adding specific files instead of `git add .` when there is any
risk of including secrets, local files, or unrelated changes. Use
meaningful commit prefixes such as `docs:`, `fix:`, `feat:`,
`refactor:`, `test:`, and `chore:`.

If a push is rejected, inspect the message and repository state; do not
force-push without a deliberate recovery plan.

## 6. Work completed so far

### Phase 1 --- Environment setup and clone

-   Confirmed Git is installed.
-   Confirmed Node.js and npm are installed.
-   Found PHP installed in `C:\php`; fixed PATH so `php` works globally.
-   Cloned the public GitHub repository successfully.
-   Local clone is at:
    `D:\Project\WP Project\Smart-Food-Ordering-System`
-   `git status` was clean on branch `main`, tracking `origin/main`.
-   Confirmed the repository contains `food-ordering-frontend` and
    `food-ordering-backend`.

### Phase 2 --- Frontend dependency installation and local startup

-   Ran `npm install` in `food-ordering-frontend`.
-   npm installed 473 packages and audited 474 packages.
-   Ran `npm start`; Angular compiled successfully.
-   Local frontend URL: `http://localhost:4200/`.
-   Angular emitted NG8113 warnings about unused imports:
    -   `AdminSidebar` in admin Categories, Foods, OrderDetails, Orders,
        and Users components.
    -   `RouterLinkActive` in admin Dashboard.
    -   `RouterLink` in Orders.
-   These warnings are cleanup candidates, but imports should be checked
    against each component template before removal.

### Phase 3 --- Dependency audit (investigation pending)

`npm audit` reported 13 vulnerabilities: - 2 moderate - 8 high - 3
critical

Packages mentioned in the audit include: - `@angular/router` -
`@modelcontextprotocol/sdk` (transitive through Angular CLI) -
`brace-expansion` - `fast-uri` - `hono` - `http-cache-semantics` -
`ip-address` - `piscina` (critical advisory) - `proxy-addr` (critical
advisory) - `source-map-js` - `undici`

The audit said fixes are available through `npm audit fix`. **No fix has
been run yet.** Next, record a Git checkpoint, review the full
`package.json` and audit details, then apply compatible fixes and re-run
the audit, build, and tests. Avoid `npm audit fix --force` unless a
major upgrade is deliberately assessed.

## 7. Current status

-   [x] Git, Node.js, npm, and PHP available.
-   [x] Repository cloned locally.
-   [x] Git working tree was clean immediately after clone.
-   [x] Frontend dependencies installed.
-   [x] Angular development server starts and compiles.
-   [x] Initial dependency audit captured.
-   [ ] Confirm the app's pages and user flows in the browser.
-   [ ] Inspect backend API endpoints and configuration.
-   [ ] Review `package.json`, resolve dependency vulnerabilities
    safely, and test.
-   [ ] Audit codebase and identify real bugs.
-   [ ] Create a new Supabase project owned by the project owner.
-   [ ] Inspect existing database schema/data and recreate required
    schema in the new project.
-   [ ] Configure environment variables and RLS policies securely.
-   [ ] Connect the application to the new Supabase project.
-   [ ] Improve customer-facing ordering features and admin
    functionality.
-   [ ] Add or improve automated tests and production build checks.
-   [ ] Deploy and verify the production site on Vercel.
-   [ ] Push regular stable GitHub checkpoints.

## 8. Planned product features

Assess the current implementation before deciding what is missing.
Target functionality may include:

### Customer experience

-   Responsive home page and restaurant/food discovery.
-   Search, category filters, sorting, and empty states.
-   Restaurant details, food menu, item details, availability, and
    pricing.
-   Cart with quantity changes, item removal, subtotal, fees, taxes, and
    total.
-   Validated checkout and order confirmation.
-   Authentication, registration, profile, and order history.
-   Order status and clear loading/error feedback.
-   Contact/about pages and accessible navigation.

### Admin experience

-   Protected admin routes and role checks enforced by the
    backend/database, not just hidden UI.
-   Manage foods, categories, restaurants, users, and orders as
    supported by the actual schema.
-   Form validation, error handling, and confirmation before destructive
    actions.
-   Audit of permissions so customers cannot access admin data or change
    other users' orders.

### Production readiness

-   Secure Supabase RLS and least-privilege access.
-   No service-role keys in browser code.
-   Environment variable setup for local development and Vercel.
-   Reliable API/database error handling and input validation.
-   Production build, tests, accessibility, responsive layout, and
    deployment smoke tests.
-   Correct order totals and server/database-side checks for prices and
    order ownership.

## 9. Supabase migration plan

1.  Create a new Supabase project under the owner's own account.
2.  Inspect current frontend/backend code to determine how Supabase is
    accessed.
3.  Obtain schema and table details from the current project owner or
    export only what the owner is authorized to share.
4.  Document tables, columns, types, primary/foreign keys, indexes,
    triggers, functions, storage buckets, and RLS policies.
5.  Recreate schema in the new project using SQL migrations where
    possible.
6.  Add secure RLS policies and test anonymous, customer, and admin
    access.
7.  Migrate only required data that the owner is authorized to use. Do
    not copy secrets or unnecessary personal data.
8.  Configure local environment variables and Vercel environment
    variables with the new project's public URL and publishable/anon key
    as appropriate.
9.  Never expose the service-role key in Angular/browser code.
10. Verify sign-in, menu reads, cart/checkout, order creation, and admin
    permissions before switching production traffic.
11. Keep the old project unchanged until the new setup is verified and a
    rollback path is understood.

## 10. Immediate next steps

1.  Keep the Angular terminal running and check `http://localhost:4200/`
    in the browser.

2.  Open a second terminal and return to the frontend folder:

    ``` cmd
    cd /d "D:\Project\WP Project\Smart-Food-Ordering-System\food-ordering-frontend"
    ```

3.  Review package scripts and dependencies:

    ``` cmd
    type package.json
    npm audit
    ```

4.  From the repository root, inspect backend files and configuration
    without sharing any secrets:

    ``` cmd
    cd /d "D:\Project\WP Project\Smart-Food-Ordering-System"
    dir food-ordering-backend\api
    dir food-ordering-backend\config
    ```

5.  After review, make a stable checkpoint and address dependency
    vulnerabilities safely.

6.  Continue to update this guide as each phase is completed.

## 11. Session handoff format

At the end of each work session, update this file with: - **Date** -
**What was completed** - **Files changed** - **Commands run and
results** - **Tests/build status** - **Git commit hash and push
status** - **Known issues** - **Exact next action**

Do not mark tasks complete unless the result has been verified.

---

## 12. Session handoff — 2026-10-16

### What was completed

**Admin architecture refactor — shared AdminSidebar component**

All five admin feature pages previously duplicated the full sidebar HTML
inline. This caused maintenance burden and inconsistent styling across
pages. The work done this session:

1.  **Upgraded `AdminSidebar` component** (`admin-sidebar.html`,
    `admin-sidebar.css`) — modern dark gradient sidebar with Bootstrap
    Icons, active page highlight in indigo/purple gradient, admin
    profile section, logout button with hover danger style.

2.  **Refactored all 5 admin templates** to use `<app-admin-sidebar>`
    instead of inline sidebar HTML:
    - `foods.html` — new layout + table with thumbnails, availability badges
    - `categories.html` — new layout + image key badges, food count badges
    - `orders.html` — customer avatars, payment badge, `ngModel` status select
    - `users.html` — user photo/avatar display, edit form panel
    - `order-details.html` — meta-grid layout, items table with tfoot total

3.  **Updated all 5 admin component TS files** to import `AdminSidebar`
    and removed now-unused `RouterLink` / `RouterLinkActive` imports.

4.  **Rewrote all 5 admin page CSS files** with a consistent layout
    pattern: `admin-layout` flex container, 250 px sidebar offset via
    `margin-left: 250px` on `.admin-main`, unified button/form/table/
    state-box styles across all pages.

5.  **Revamped dashboard CSS** — stat cards with colored icon boxes
    (blue orders, green revenue, yellow pending, orange preparing,
    purple delivered), proper topbar with admin avatar, status badge
    palette, responsive breakpoints.

6.  **Fixed `angular.json`** — added missing `fileReplacements` entry
    for production build so `environment.prod.ts` correctly replaces
    `environment.ts` in production bundles.

7.  **Fixed `orders.html` status dropdown** — changed `[value]` +
    `(change)` to `[ngModel]` + `(ngModelChange)` so the dropdown
    correctly reflects the current order status rather than defaulting
    to "Pending" for all rows.

### Build status

```
npm run build -- --configuration=production
Exit code: 0
Zero NG8113 warnings, zero errors
Bundle: 110 kB initial (gzipped), all lazy chunks < 16 kB
```

### Git commit

```
bc7b9f7  refactor(admin): replace all duplicate inline sidebars with
         shared AdminSidebar component
40 files changed, 3213 insertions(+), 7230 deletions(-)
```

### Visual verification (localhost:4200)

- Admin login page: polished split-panel (dark left, white right), cold-start info alert ✓
- Admin dashboard: live data — 31 orders, ₹13,680 revenue, stat cards with icons ✓
- Admin foods page: thumbnails, truncated descriptions, availability badges, icon action buttons ✓
- Admin orders page: customer avatars, payment badges, status badges in correct colours ✓
- Sidebar: dark gradient, active page highlighted in indigo, all routes work via routerLink ✓

---

## 13. Customer Frontend & Session Security Hardening (Current Session)

### Changes Made

1. **Session Isolation Across Tabs & Windows (Security Fix):**
   - Migrated all authentication persistence from `localStorage` to `sessionStorage` in `AuthService`, `Login`, `AdminLogin`, `Profile`, `Checkout`, `Menu`, and `Home`.
   - In `AuthService` constructor, actively purges legacy persistent keys (`userId`, `adminLoggedIn`, `adminId`, etc.) from `localStorage`.
   - Now, opening the application in a new tab or window does not auto-login to an existing account, requiring a fresh login per tab as desired while maintaining the session within the active tab.

2. **Instant Menu Categories & Foods Render (Zero Waiting Time):**
   - Initialized default category cards (`Pizza Special`, `Burger`, `Biryani`, `Chinese`, `Desserts`, `Chicken`) and popular foods immediately so the page looks complete (matching Image 3) from the very first frame.
   - Removed the blocking `Loading categories...` text and the `🍽️` emoji inside the `All` button.
   - Fixed category icon mappings (including `🍗` for chicken).
   - Once backend APIs respond, data is smoothly updated without layout jumps.

3. **Hero Search & "Explore Menu" Button Functionality:**
   - Bound the hero search `<input>` to `searchQuery` with `(keyup.enter)` and Search button click.
   - Clicking Search or pressing Enter navigates to `/menu?q=<search>`.
   - Clicking "Explore Menu" navigates to `/menu`.
   - Clicking category cards on the home page navigates to `/menu?category=<name>`.
   - `Menu` component reads query parameters (`q` and `category`) to pre-filter items on load.

4. **Navbar Login/Logout Button Visibility:**
   - On the Home page navbar and Menu header:
     - When unauthenticated: Displays the **Login** button.
     - When authenticated: Automatically hides **Login** and displays **Profile** icon and **Logout** button.

5. **Live Reactive Cart Count Badge:**
   - Updated `CartService` with a reactive `cartCount$` `BehaviorSubject` and `fetchCartCount(userId)`.
   - Home and Menu components subscribe to `cartCount$`.
   - Adding items to cart immediately updates the badge on the dashboard.
   - `Cart` page operations (quantity adjustments, item deletions) keep the count synchronized.

