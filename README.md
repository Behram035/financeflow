# FinanceFlow - Finance Management System

A modern, full-stack financial management application built with Next.js 16, TypeScript, MongoDB, and Framer Motion. Track your income, expenses, budgets, and financial goals with an intuitive and responsive interface.

## Features

### Authentication & Security

- **Auth.js Integration**: Email/Password and Google OAuth authentication
- **Secure Password Hashing**: bcryptjs for password security
- **Protected Routes**: Middleware-based route protection
- **Session Management**: JWT-based session handling with 30-day expiration

### Transaction Management

- **CRUD Operations**: Create, read, update, and delete transactions
- **Transaction Types**: Support for both income and expense transactions
- **Categorization**: Organize transactions by custom categories
- **Advanced Filtering**: Filter by date range, category, amount, and type
- **Sorting & Pagination**: Sort by date, amount, or category with pagination
- **Search**: Full-text search across transaction descriptions

### Budget Management

- **Monthly Budgets**: Set spending limits for specific categories
- **Real-time Tracking**: Monitor spending against budget limits
- **Budget Alerts**: Multi-channel notifications (email, push, in-app)
- **Visual Progress**: Progress bars showing spending percentage
- **Category-wise Budgets**: Create separate budgets for different categories

### Analytics & Reports

- **Interactive Dashboard**: Real-time financial overview
- **Recharts Visualizations**:
  - Daily income/expense trends
  - Category-wise expense pie charts
  - Income/expense breakdown charts
- **Financial Summary**: Total income, expenses, and net balance
- **Category Analytics**: Detailed breakdown by category

### User Experience

- **Responsive Design**: Mobile-first, fully responsive interface
- **Dark/Light Mode**: Theme toggle for user preference
- **Smooth Animations**: Framer Motion animations and transitions
- **Form Validation**: React Hook Form with Zod schema validation
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual feedback during data operations

## Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Charts**: Recharts + Chart.js
- **HTTP Client**: Axios
- **UI Components**: Shadcn/ui

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: Auth.js (NextAuth.js v5)
- **Password Security**: bcryptjs
- **Validation**: Zod
- **Notifications**: Nodemailer (Email), Web Push API

### Development Tools

- **Package Manager**: pnpm
- **Build Tool**: Turbopack (Next.js 16 default)
- **Testing**: Jest (optional)
- **Linting**: ESLint (via Next.js)

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/     # Auth.js route handler
│   │   │   └── signup/            # Registration endpoint
│   │   ├── categories/             # Category CRUD APIs
│   │   ├── transactions/           # Transaction CRUD APIs
│   │   └── budgets/                # Budget CRUD APIs
│   ├── auth/
│   │   ├── signin/                 # Sign in page
│   │   └── signup/                 # Sign up page
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout wrapper
│   │   ├── page.tsx                # Dashboard home
│   │   ├── transactions/           # Transactions management
│   │   ├── categories/             # Categories management
│   │   ├── budgets/                # Budget management
│   │   ├── reports/                # Analytics & reports
│   │   └── settings/               # User settings
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home (redirect to dashboard)
│   └── globals.css                 # Global styles
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Protected route wrapper
│   ├── layout/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── Header.tsx              # Top header
│   ├── transactions/
│   │   ├── TransactionForm.tsx     # Transaction form
│   │   └── TransactionsList.tsx    # Transactions list view
│   ├── providers/
│   │   ├── SessionProvider.tsx     # Auth.js provider
│   │   └── ReduxProvider.tsx       # Redux store provider
│   └── ui/                         # Shadcn/ui components
├── lib/
│   ├── auth/
│   │   └── auth.ts                 # Auth.js configuration
│   ├── db/
│   │   ├── mongodb.ts              # MongoDB connection
│   │   └── models/
│   │       ├── User.ts             # User schema
│   │       ├── Category.ts         # Category schema
│   │       ├── Transaction.ts      # Transaction schema
│   │       ├── Budget.ts           # Budget schema
│   │       └── PushSubscription.ts # Push subscription schema
│   ├── validation/
│   │   └── schemas.ts              # Zod validation schemas
│   └── utils.ts                    # Utility functions
├── store/
│   ├── store.ts                    # Redux store configuration
│   ├── hooks.ts                    # Redux hooks
│   └── slices/
│       ├── authSlice.ts            # Auth state
│       ├── transactionSlice.ts     # Transaction state
│       ├── budgetSlice.ts          # Budget state
│       └── uiSlice.ts              # UI state
├── middleware.ts                   # Auth middleware
├── .env.example                    # Environment variables template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database (MongoDB Atlas recommended)
- Google OAuth credentials (for social login)
- SMTP server (for email notifications)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd finance-management
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your values:

   ```env
   # Database
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/finance_db

   # Auth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=openssl rand -base64 32

   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret

   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Web Push
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Sign In

```
POST /api/auth/signin
(Handled by Auth.js)
```

### Categories Endpoints

#### Get Categories

```
GET /api/categories?type=expense
```

#### Create Category

```
POST /api/categories
{
  "name": "Groceries",
  "type": "expense",
  "color": "#3b82f6",
  "icon": "🛒"
}
```

#### Update Category

```
PUT /api/categories/[id]
```

#### Delete Category

```
DELETE /api/categories/[id]
```

### Transactions Endpoints

#### Get Transactions

```
GET /api/transactions?type=expense&categoryId=xxx&page=1&limit=10&startDate=2024-01-01&endDate=2024-01-31&sortBy=date&sortOrder=desc
```

#### Create Transaction

```
POST /api/transactions
{
  "categoryId": "category_id",
  "type": "expense",
  "amount": 50.00,
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "notes": "Weekly groceries"
}
```

#### Update Transaction

```
PUT /api/transactions/[id]
```

#### Delete Transaction

```
DELETE /api/transactions/[id]
```

### Budgets Endpoints

#### Get Budgets

```
GET /api/budgets?month=2024-01
```

#### Create Budget

```
POST /api/budgets
{
  "categoryId": "category_id",
  "limit": 500.00,
  "month": "2024-01-01",
  "alertThreshold": 80
}
```

#### Update Budget

```
PUT /api/budgets/[id]
```

#### Delete Budget

```
DELETE /api/budgets/[id]
```

## State Management

### Redux Slices

#### Auth Slice

- `setSession`: Update user session
- `setLoading`: Set loading state
- `setError`: Set error message
- `clearAuth`: Clear auth state

#### Transaction Slice

- `setTransactions`: Load transactions
- `addTransaction`: Add new transaction
- `updateTransaction`: Update existing
- `deleteTransaction`: Remove transaction
- `setFilters`: Update filter criteria
- `setPagination`: Update pagination

#### Budget Slice

- `setBudgets`: Load budgets
- `addBudget`: Create budget
- `updateBudget`: Update budget
- `deleteBudget`: Remove budget
- `updateBudgetSpending`: Update spent amount

#### UI Slice

- `toggleDarkMode`: Toggle theme
- `toggleSidebar`: Toggle sidebar visibility
- `addNotification`: Add toast notification
- `removeNotification`: Remove notification

## Database Schemas

### User

- `email`: Unique email address
- `name`: Full name
- `password`: Hashed password
- `googleId`: Google OAuth ID
- `image`: Profile picture URL
- `emailVerified`: Verification timestamp

### Category

- `userId`: Reference to user
- `name`: Category name
- `type`: 'income' or 'expense'
- `color`: Hex color code
- `icon`: Emoji or icon identifier

### Transaction

- `userId`: Reference to user
- `categoryId`: Reference to category
- `type`: 'income' or 'expense'
- `amount`: Decimal amount
- `description`: Transaction description
- `date`: Transaction date
- `tags`: Array of tags
- `notes`: Additional notes

### Budget

- `userId`: Reference to user
- `categoryId`: Reference to category
- `month`: Budget month
- `limit`: Monthly spending limit
- `spent`: Current spending
- `alertThreshold`: Alert percentage
