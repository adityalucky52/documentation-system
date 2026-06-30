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

---

## Workspace Orchestration: SpaceEditorPage

The core editing workspace is managed by [SpaceEditorPage.tsx](file:///c:/Users/INP/Desktop/documentation-system/client/src/features/editor/components/SpaceEditorPage.tsx), which orchestrates document navigation, Git-like version control branching, auto-saving, and peer-review flows.

```mermaid
graph TD
    A[SpaceEditorPage] --> B[EditorSidebar]
    A --> C[EditorHeader]
    A --> D[EditorCanvas]
    A --> E[ChangeRequestsDrawer]
    A --> F[MergeConfirmModal]
    A --> G[RequestReviewModal]
```

### Key Sub-Components
- **[EditorSidebar](file:///c:/Users/INP/Desktop/documentation-system/client/src/features/editor/components/EditorSidebar.tsx)**: Displays the nested page structure of the space, document hierarchy, and page creation/deletion controls.
- **[EditorHeader](file:///c:/Users/INP/Desktop/documentation-system/client/src/features/editor/components/EditorHeader.tsx)**: Navigation breadcrumbs, active workspace sub-tab selector (Overview, Editor, Changes, Preview), and primary Git action triggers (Merge / Request Review).
- **[EditorCanvas](file:///c:/Users/INP/Desktop/documentation-system/client/src/features/editor/components/EditorCanvas.tsx)**: Renders the active rich-text editing workspace or the preview pane.
- **[ChangeRequestsDrawer](file:///c:/Users/INP/Desktop/documentation-system/client/src/features/change-requests/components/ChangeRequestsDrawer.tsx)**: Slide-out drawer displaying Git branches (change requests) with draft, open, or merged states.

### Core Architecture & State Flow

#### 1. Dual-Editing Modes
- **Read-Only Mode (Main / Live Branch)**: Active when no change request is selected (`activeCR === null`). The document content is locked and cannot be directly modified.
- **Editing Mode (Branch Mode)**: Triggered when a change request is selected. Edits are auto-saved to that specific branch.

#### 2. Debounced Auto-Save
Local text inputs (`editTitle`, `editContent`) update the client state instantly. An effect monitors changes and triggers the `updatePage` API mutation only after the user stops typing for **800ms**. This reduces database writes while maintaining real-time saving behavior.

#### 3. Git Branch Lifecycle Operations
- **Request a Review**: Launches `RequestReviewModal` to submit the branch for peer approval, changing its state from `DRAFT` to `OPEN`.
- **Merge to Live**: Launches `MergeConfirmModal`. Before executing the merge API call, it performs an immediate pre-merge auto-save of the active editor drafts to guarantee no text updates are lost. It then merges the branch into the main branch, updates the space structure, and redirects the user back to read-only Mode on the updated main branch.

