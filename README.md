# Doctor Tracker — Healthcare Administration Portal

A modern, fullstack healthcare administration portal for managing doctors, patients, and analytics — built with **Next.js 16 App Router**, **MongoDB**, **Redux Toolkit (RTK Query)**, and **Shadcn UI**.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Secure Auth** | JWT cookie-based auth with middleware route protection |
| 📊 **Analytics Dashboard** | Real-time KPI cards, area charts, bar charts, donut charts |
| 👨‍⚕️ **Doctor Management** | Table & grid view, search, filters, create/delete, detail drawer |
| 🏥 **Patient Management** | Full CRUD, multi-filter (condition, status, gender, doctor, date) |
| 📱 **Responsive Design** | Mobile drawer navigation, responsive layouts |
| 🌙 **Dark Mode** | Full dark/light mode with localStorage persistence |
| 🌱 **Seed Data** | One-click database seeding (15 doctors, 60 patients) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **State Management** | Redux Toolkit |
| **Data Fetching** | RTK Query |
| **UI Components** | Shadcn UI + Tailwind CSS v4 |
| **Data Visualization** | Recharts |
| **Database** | MongoDB + Mongoose |
| **Authentication** | Jose (JWT) + bcryptjs |
| **Forms** | React Hook Form + Zod |
| **Animations** | tw-animate-css + CSS keyframes |

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
git clone https://github.com/mohammad-anar/fullstack-task.git
cd fullstack-task
npm install --legacy-peer-deps
```

### 2. Environment Variables
Create a `.env` file in the project root:
```env
MONGODB_URI=mongodb://localhost:27017/doctor-tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@doctortracker.com
ADMIN_PASSWORD=admin123
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Seed the Database
Visit the **Dashboard** and click the **"Seed Data"** button, or make a POST request:
```bash
curl -X POST http://localhost:3000/api/seed
```
This creates:
- 1 admin user (`admin@doctortracker.com` / `admin123`)
- 15 doctors across all specializations
- 60 patients with realistic medical data

### 5. Login
Use the demo credentials or click **"Use demo credentials"** on the login page.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                     │
│                                                                   │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │   /login    │  │   /(dashboard)  │  │    /api/*            │ │
│  │             │  │   /dashboard    │  │    /auth/login       │ │
│  │  JWT Auth   │  │   /doctors      │  │    /auth/me          │ │
│  │  Form       │  │   /patients     │  │    /doctors          │ │
│  └─────────────┘  └─────────────────┘  │    /patients         │ │
│                                         │    /dashboard/stats  │ │
│          Middleware (JWT Verify)         │    /seed             │ │
│                                         └──────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
   │  Redux RTK  │   │   MongoDB   │   │   Shadcn UI  │
   │   Query     │   │  Mongoose   │   │   Recharts   │
   │  (Cache)    │   │  (Data)     │   │  (Visuals)   │
   └─────────────┘   └─────────────┘   └─────────────┘
```

### Data Flow
1. User opens app → **Middleware** checks JWT cookie → redirects to `/login` if missing
2. Login form → `POST /api/auth/login` → JWT stored in httpOnly cookie
3. Dashboard layout → RTK Query `GET /api/auth/me` → bootstraps Redux auth state
4. All data operations → RTK Query endpoints → Next.js API routes → MongoDB
5. Cache invalidation via RTK Query tags ensures UI stays in sync after mutations

---

## 🔑 Technical Decisions

### Why RTK Query?
RTK Query provides automatic cache management, request deduplication, and optimistic updates with minimal boilerplate. Tag-based cache invalidation ensures that creating/editing/deleting a doctor or patient automatically updates all related queries (doctor list, patient list, dashboard stats).

### Why Next.js App Router?
- **Route Groups** `(dashboard)` keep the authenticated layout isolated from the public login route
- **Middleware** handles JWT verification server-side before any page renders — zero client-side flash
- **API Routes** colocated with the frontend eliminate the need for a separate backend server

### Why MongoDB with Mongoose?
- Flexible document model suits healthcare data with optional fields
- Aggregation pipelines power the dashboard analytics efficiently
- Text indexes on name/specialization/hospital/condition enable fast full-text search

### Why Jose over next-auth?
Jose provides lightweight, standards-compliant JWT operations (HS256 signing/verification) without the complexity and peer dependency conflicts of full auth frameworks — ideal for a focused admin portal.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Auth-protected route group
│   │   ├── layout.tsx         # Sidebar + Header layout
│   │   ├── dashboard/         # Analytics dashboard
│   │   ├── doctors/           # Doctor management
│   │   └── patients/          # Patient management
│   ├── api/
│   │   ├── auth/              # Login, Me, Logout
│   │   ├── doctors/           # Doctors CRUD + [id]
│   │   ├── patients/          # Patients CRUD + [id]
│   │   ├── dashboard/stats/   # Analytics aggregation
│   │   └── seed/              # Database seeder
│   ├── login/                 # Public login page
│   └── globals.css            # Design system tokens
├── components/
│   ├── layout/                # Sidebar, Header
│   ├── dashboard/             # StatCard, Charts
│   ├── doctors/               # Dialogs, Detail Sheet
│   ├── patients/              # Edit dialog
│   ├── providers/             # Redux Provider
│   └── ui/                    # Shadcn components
├── models/                    # Mongoose schemas
│   ├── User.ts
│   ├── Doctor.ts
│   └── Patient.ts
├── store/
│   ├── store.ts               # Redux store
│   ├── hooks.ts               # Typed hooks
│   ├── slices/authSlice.ts    # Auth state
│   └── services/apiService.ts # RTK Query API
└── middleware.ts              # JWT route protection
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/doctors` | List doctors (search, filter, paginate) |
| POST | `/api/doctors` | Create doctor |
| GET | `/api/doctors/[id]` | Doctor detail + patients |
| PUT | `/api/doctors/[id]` | Update doctor |
| DELETE | `/api/doctors/[id]` | Delete doctor + patients |
| GET | `/api/patients` | List patients (search, filter, paginate) |
| POST | `/api/patients` | Add patient |
| PUT | `/api/patients/[id]` | Update patient |
| DELETE | `/api/patients/[id]` | Delete patient |
| GET | `/api/dashboard/stats` | Analytics data |
| POST | `/api/seed` | Seed database |

---

## 🎨 Design System

The UI uses a **Medical Teal/Cyan** palette built on OKLCH color space for perceptually uniform colors:
- **Primary**: `oklch(0.52 0.18 220)` — Medical Cyan
- **Charts**: 6-color harmonious palette across cyan, green, amber, purple, orange, indigo
- **Dark Mode**: Deep navy background `oklch(0.11 0.015 255)` for clinical aesthetics
- **Glassmorphism**: Used on login card with `backdrop-filter: blur(12px)`
- **Micro-animations**: `animate-fade-in`, `animate-slide-up` on page transitions, hover lift on cards

---

*Built with ❤️ using Next.js, MongoDB, Redux Toolkit, and Shadcn UI*
