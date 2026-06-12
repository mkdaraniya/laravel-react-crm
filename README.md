# ReactCRM

A full-stack CRM application built with Laravel 13 and React 18. Manage contacts, deals, invoices, tasks, and team members with a clean Kanban pipeline and real-time activity feed.

## Tech Stack

**Backend**
- Laravel 13 / PHP 8.3
- MySQL
- Laravel Sanctum (API token auth)
- RESTful JSON API

**Frontend**
- React 18 with Vite 8
- React Router DOM v7
- Axios (HTTP client)
- Tailwind CSS 3
- Recharts (charts)
- dnd-kit (drag & drop)
- react-hot-toast (notifications)

## Features

- **Auth** — Login, register, profile update, password change, account deletion
- **Dashboard** — Revenue chart, active leads, deal velocity stats, live activity feed (auto-refresh)
- **Pipeline** — Kanban board with drag & drop between stages, deal creation
- **Contacts** — CRUD with search, filter by status, sortable table, row selection
- **Deals** — Track deals through pipeline stages, mark won/lost
- **Tasks** — Create, assign, prioritize, toggle complete, filter by user/status
- **Invoices** — Generate invoice numbers, mark paid, track outstanding amounts
- **Settings** — Company info, pipeline stage management, user management with role changes
- **API** — Consistent JSON responses, global error handling, sort/paginate on all lists

## Folder Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── BaseController.php      # successResponse / errorResponse
│   │       ├── AuthController.php
│   │       ├── ContactController.php
│   │       ├── DashboardController.php
│   │       ├── DealController.php
│   │       ├── InvoiceController.php
│   │       ├── PipelineStageController.php
│   │       ├── SettingController.php
│   │       ├── TaskController.php
│   │       └── UserController.php
│   ├── Requests/                        # Form validation
│   └── Resources/                       # API resource transformers
├── Models/
└── Providers/

resources/js/
├── api/                                 # Axios API client modules
├── components/ui/                       # Reusable UI components
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useSort.js
├── pages/
│   ├── Contacts.jsx                     # Sortable table, search, filter
│   ├── Dashboard.jsx                    # Charts, live feed
│   ├── Pipeline.jsx                     # Drag & drop Kanban
│   ├── Tasks.jsx                        # Kanban-style task board
│   ├── Billing.jsx                      # Invoice management
│   ├── Settings.jsx                     # Company, stages, users
│   ├── Profile.jsx                      # Profile & password
│   ├── Login.jsx
│   └── Register.jsx
├── utils/
│   ├── constants.js                     # Status colors, options
│   └── formatters.js                    # Currency, date helpers
├── routes.jsx                           # Centralized routing
├── App.jsx
└── app.jsx

routes/
├── api.php                              # API routes
└── web.php                              # SPA catch-all
```

## Installation

```bash
git clone https://github.com/yourusername/reactcrm.git
cd reactcrm

cp .env.example .env
# Update DB credentials in .env

composer install
npm install

php artisan key:generate
php artisan migrate --seed

npm run build

php artisan serve
```

Visit `http://localhost:8000` and register a new account.

## API Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message",
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "total": 50
  }
}
```

Errors return:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {}
}
```

## What Makes This Project Stand Out

- Global error handling catches all exceptions with proper HTTP status codes
- Base controller provides consistent success/error response methods
- All write operations use database transactions
- Sort field whitelisting prevents SQL injection
- Frontend has separate routes file, utils, hooks for clean organization
- Tables support sorting, filtering, pagination, and row selection
- Reusable UI components (Modal, Button, Pagination, ConfirmDialog)
