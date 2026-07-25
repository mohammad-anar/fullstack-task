# Doctor Tracker — Fullstack Healthcare Administration Portal

Doctor Tracker is a secure, performance-focused healthcare administrative platform designed to streamline doctor management, patient record tracking, and real-time clinical analytics. Built as a full-stack Next.js application, it provides hospital administrators with an intuitive dashboard for monitoring workloads, patient admission trends, and medical condition distributions.

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

Follow these steps to run the application locally.

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

Your `.env` file should look like this:

```env
MONGODB_URI=mongodb://localhost:27017/doctor-tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_EMAIL=admin@doctortracker.com
ADMIN_PASSWORD=admin123
```

### 4. Database Seeding
Start the development server:

```bash
npm run dev
```

Then seed the database by either clicking the **"Seed Data"** button on the top navigation bar or running the curl command below:

```bash
curl -X POST http://localhost:3000/api/seed
```

This populates the database with:
- 1 Admin user (`admin@doctortracker.com` / `admin123`)
- 15 Doctors across various medical specializations
- 60 Realistically generated patient records with admission histories

### 5. Accessing the Portal
Navigate to `http://localhost:3000/login` and log in using the demo credentials or click **"Use demo credentials"**.

---

## System Architecture & Data Flow

The application follows a monolithic Next.js architecture where both frontend components and backend RESTful APIs reside in a single codebase.

```
                  ┌─────────────────────────────────────────┐
                  │          Next.js App Router             │
                  │                                         │
                  │   Client Components / UI Views          │
                  │   (/dashboard, /doctors, /patients)     │
                  └────────────────────┬────────────────────┘
                                       │
                         RTK Query / HTTP Requests
                                       │
                  ┌────────────────────▼────────────────────┐
                  │      Next.js Route Handlers             │
                  │      (/api/doctors, /api/patients)      │
                  └────────────────────┬────────────────────┘
                                       │
                          Mongoose Queries & Aggregations
                                       │
                  ┌────────────────────▼────────────────────┐
                  │           MongoDB Database              │
                  └─────────────────────────────────────────┘
```

### Flow Breakdown
1. **Route Protection:** Server-side `middleware.ts` intercepts incoming requests for protected routes (`/(dashboard)`), verifying the `auth-token` HTTP-only cookie using `jose`. Unauthenticated requests are immediately redirected to `/login`.
2. **Client State & Caching:** The frontend uses RTK Query as a single source of truth. Query hooks automatically cache backend data and deduplicate concurrent requests.
3. **Optimistic Updates & Tag Invalidation:** Mutations (e.g., creating a doctor or editing a patient) invalidate RTK Query tags (`Doctors`, `Patients`, `Stats`), triggering background re-fetches so all components stay synchronized without requiring a manual page refresh.

---

## Key Technical Decisions & Architecture Rationale

### 1. RTK Query vs. React Context / Raw `fetch`
*Why RTK Query?*
In a complex management application where actions in one tab (e.g., adding a patient under a doctor in `/doctors`) directly impact metrics elsewhere (e.g., total patient counts on `/dashboard` and patient lists on `/patients`), manual state management quickly becomes error-prone. 

RTK Query was chosen because its tag-based cache invalidation system (`providesTags` / `invalidatesTags`) provides declarative synchronization across views. It eliminates boilerplate loading/error state management and prevents unnecessary network requests through automated response caching.

### 2. Lightweight JWT Auth (`jose`) vs. NextAuth / Third-Party Auth
*Why custom JWT with `jose`?*
For an administrative portal with straightforward role requirements, full auth frameworks like NextAuth can add unnecessary complexity and dependency weight. Using `jose` with standard `httpOnly`, `SameSite=Lax` cookies provided complete control over session lifetime, CSRF mitigation, and edge-compatible JWT verification inside Next.js middleware, keeping the bundle size lean and build times fast.

### 3. Database Query & Indexing Strategy
To ensure fast responses as records scale, MongoDB schemas are structured with explicit single-field and compound text indexes:
- **Text Search:** `DoctorSchema` and `PatientSchema` include `$text` indexes on names, specializations, conditions, and hospital names to support fast regex search without scanning entire collections.
- **Aggregation Pipelines:** The `/api/dashboard/stats` endpoint uses native MongoDB aggregation pipelines (`$group`, `$lookup`, `$project`) to compute counts, workload distributions, and 30-day admission trends directly inside the database engine rather than performing heavy JavaScript map/reduce operations on the server node.
- **Lean Queries:** All read endpoints use `.lean()` to bypass Mongoose document instantiation overhead, returning plain JavaScript objects for maximum serialization speed.

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
│   │   ├── doctors/            # Doctor directory, search & management
│   │   └── patients/           # Patient directory, filtering & edit dialogs
│   ├── api/                    # REST API route handlers
│   │   ├── auth/               # Login, session check, logout
│   │   ├── dashboard/stats/    # Aggregation endpoints
│   │   ├── doctors/            # Doctor CRUD operations
│   │   ├── patients/           # Patient CRUD operations
│   │   └── seed/               # Initial database seeder
│   ├── login/                  # Login view
│   └── globals.css             # Theme tokens & custom utility classes
├── components/
│   ├── dashboard/              # Analytics cards & Recharts wrappers
│   ├── doctors/                # Add/edit dialogs & patient detail sheet
│   ├── layout/                 # Sidebar, header, & navigation controls
│   ├── patients/               # Edit patient form modals
│   └── ui/                     # Reusable Shadcn UI primitives
├── models/                     # Mongoose schemas (Doctor, Patient, User)
├── store/                      # Redux store configuration & RTK Query API definition
└── middleware.ts               # Server-side JWT authentication middleware
```

---

## License & Attribution

Developed as a fullstack demonstration project. Open-source under the [MIT License](LICENSE).
