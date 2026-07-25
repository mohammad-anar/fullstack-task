# Doctor Tracker — Fullstack Healthcare Administration Portal

**Live Application URL:** [https://doctor-portal-three-lyart.vercel.app/login](https://doctor-portal-three-lyart.vercel.app/login)

Doctor Tracker is a secure healthcare administrative platform designed to streamline doctor management, patient record tracking, and real-time clinical analytics. Built as a full-stack Next.js application, it provides hospital administrators with an intuitive dashboard for monitoring workloads, patient admission trends, and medical condition distributions.

---

## Technical Stack

- **Framework:** Next.js 16 (App Router, Server Components & Route Handlers)
- **Database & ODM:** MongoDB with Mongoose
- **State Management & Data Fetching:** Redux Toolkit & RTK Query
- **Authentication:** Custom JWT using `jose` & HTTP-only cookies
- **Form Management & Validation:** React Hook Form & Zod
- **Data Visualization:** Recharts
- **Styling & UI:** Tailwind CSS, Shadcn UI primitives, and Radix UI

---

## Local Setup Guide

### 1. Prerequisites
- Node.js (v18.x or higher)
- MongoDB instance (Local `mongodb://localhost:27017` or MongoDB Atlas cluster)

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/mohammad-anar/fullstack-task.git
cd fullstack-task
npm install --legacy-peer-deps
```

### 3. Environment Configuration
Copy the provided `.env.example` file to create your local `.env` configuration:

```bash
cp .env.example .env
```

Your `.env` file configuration:

```env
MONGODB_URI=mongodb://localhost:27017/doctor-tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_EMAIL=admin@doctortracker.com
ADMIN_PASSWORD=admin123
```

### 4. Running the Development Server
Start the development server:

```bash
npm run dev
```

### 5. Database Seeding
Seed the database by clicking the **"Seed Data"** button on the top navigation bar or making a POST request:

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates:
- 1 Admin user (`admin@doctortracker.com` / `admin123`)
- 15 Doctors across various medical specializations
- 60 Generated patient records with admission histories

### 6. Accessing the Portal
Navigate to `http://localhost:3000/login` and log in using the demo credentials or click **"Use demo credentials"**.

---

## System Architecture & Data Flow

The application follows a monolithic Next.js architecture where frontend UI components and backend RESTful API route handlers reside within a single codebase.

1. **Route Protection:** Server-side middleware (`middleware.ts`) intercepts requests for protected routes (`/(dashboard)`), verifying the `auth-token` HTTP-only cookie using `jose`. Unauthenticated requests are redirected to `/login`.
2. **Client State & Caching:** The frontend uses RTK Query as a single source of truth. Query hooks automatically cache backend data and deduplicate concurrent requests.
3. **Optimistic Updates & Tag Invalidation:** Mutations (such as creating a doctor or editing a patient) invalidate RTK Query tags (`Doctor`, `Patient`, `DashboardStats`), triggering background re-fetches so all UI views stay synchronized automatically.

---

## Technical Decisions & Rationale

### 1. RTK Query vs. React Context / Raw `fetch`
In an administration application where actions in one section (such as adding a patient under a doctor) affect metrics across other pages (such as total patient counts on `/dashboard` and patient tables on `/patients`), manual state management can become error-prone. RTK Query was chosen for its tag-based cache invalidation system (`providesTags` / `invalidatesTags`), providing automatic synchronization across components without redundant network requests.

### 2. Lightweight JWT Auth (`jose`) vs. Heavy Auth Frameworks
For an administrative portal with clear credential requirements, full authentication frameworks add unnecessary complexity and dependency overhead. Using `jose` with `httpOnly`, `SameSite=Lax` cookies provided complete control over session lifetime, CSRF protection, and edge-compatible JWT verification inside Next.js middleware, keeping the bundle size lean and build times fast.

### 3. Database Query & Indexing Strategy
MongoDB schemas are structured with explicit single-field and compound text indexes:
- **Text Search:** `DoctorSchema` and `PatientSchema` include `$text` indexes on names, specializations, conditions, and hospital names to support fast search queries.
- **Aggregation Pipelines:** The `/api/dashboard/stats` endpoint uses native MongoDB aggregation pipelines (`$group`, `$lookup`, `$project`) to compute counts, workload distributions, and 30-day admission trends directly inside the database engine.
- **Lean Queries:** Read endpoints use `.lean()` to bypass Mongoose document instantiation overhead, returning plain JavaScript objects for fast JSON serialization.

---

## REST API Reference

| Method | Route | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates admin credentials and sets JWT cookie | None |
| `GET` | `/api/auth/me` | Validates session and returns current user info | None |
| `POST` | `/api/auth/logout` | Clears authentication cookie | None |
| `GET` | `/api/doctors` | Retrieves paginated doctor list | `page`, `limit`, `search`, `specialization`, `hospital`, `status`, `dateFrom`, `dateTo` |
| `POST` | `/api/doctors` | Creates a new doctor record | None |
| `GET` | `/api/doctors/[id]`| Retrieves doctor profile along with assigned patients | None |
| `PUT` | `/api/doctors/[id]`| Updates doctor information | None |
| `DELETE`| `/api/doctors/[id]`| Deletes a doctor and unassigns/removes their patients | None |
| `GET` | `/api/patients` | Retrieves paginated patient list | `page`, `limit`, `search`, `doctorId`, `condition`, `status`, `gender`, `dateFrom`, `dateTo` |
| `POST` | `/api/patients` | Creates a new patient record | None |
| `PUT` | `/api/patients/[id]`| Updates patient details | None |
| `DELETE`| `/api/patients/[id]`| Deletes a patient record | None |
| `GET` | `/api/dashboard/stats` | Computes clinical analytics & chart data | None |
| `POST` | `/api/seed` | Seeds database with initial test data | None |

---

## Directory Structure

```
src/
├── app/
│   ├── (dashboard)/            # Authenticated route group
│   │   ├── dashboard/          # Analytics overview & charts
│   │   ├── doctors/            # Doctor directory, search & dynamic /doctors/[id] page
│   │   └── patients/           # Patient directory, filtering & edit dialogs
│   ├── api/                    # REST API route handlers
│   │   ├── auth/               # Login, session check, logout
│   │   ├── dashboard/stats/    # Aggregation endpoints
│   │   ├── doctors/            # Doctor CRUD operations & [id]
│   │   ├── patients/           # Patient CRUD operations & [id]
│   │   └── seed/               # Database seeder
│   ├── login/                  # Login view
│   └── globals.css             # Theme tokens & custom styles
├── components/
│   ├── dashboard/              # Analytics cards & charts
│   ├── doctors/                # Add/edit dialogs
│   ├── layout/                 # Sidebar & header navigation
│   ├── patients/               # Edit patient form modals
│   └── ui/                     # Reusable UI primitives
├── models/                     # Mongoose schemas (Doctor, Patient, User)
├── store/                      # Redux store configuration & RTK Query API
└── middleware.ts               # Server-side JWT authentication middleware
```

---

## License & Attribution

Developed as a fullstack demonstration project. Open-source under the [MIT License](LICENSE).
