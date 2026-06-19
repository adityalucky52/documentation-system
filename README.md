# GitBook Documentation System Clone

A modern, high-performance clone of GitBook's core features. This system supports user registration, organizations, clean custom short URLs, onboarding workflows (choose "Blank" to start building from scratch), nested space structures, and responsive user dashboards.

## Features

- **Robust Authentication:** Secure registration and login flow for users.
- **Organization & Site Scoping:** Multi-tenant architecture allowing users to create organizations and distinct documentation sites.
- **Clean Short URLs:** Clean and readable URL patterns `/o/:orgId/sites/:siteId` with custom short alphanumeric identifiers (e.g. 7-character site IDs and 8-character organization IDs).
- **GitBook-Style Onboarding:** Choose starting templates or a "Blank" setup screen to initialize content spaces.
- **Dynamic Active Space Dashboards:**
  - In-place transition from onboarding to dashboard view (Overview, Editor, Preview, Settings).
  - Left-hand navigation listing nested Spaces underneath parent site names.
  - Interactive "Get started" task checklist.
- **Database Engine:** Powered by PostgreSQL with Prisma ORM.

---

## Tech Stack

### Frontend (Client)
- **Framework:** React with Vite & TypeScript
- **Styling:** Tailwind CSS & Vanilla CSS (Harmonious Dark Theme)
- **Icons:** Lucide React
- **State Management:** Zustand

### Backend (Server)
- **Framework:** Fastify with TypeScript
- **Database ORM:** Prisma
- **Database:** PostgreSQL

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd documentation-system
   ```

2. **Backend Setup:**
   Configure your connection string in `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   JWT_SECRET="your-jwt-secret"
   ```

   Install dependencies and run Prisma migrations:
   ```bash
   cd server
   npm install
   npx prisma db push
   npx prisma generate
   ```

   Start the development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Verify Application:**
   Open [http://localhost:5173/](http://localhost:5173/) in your browser to sign up, log in, create a site, and start onboarding.
