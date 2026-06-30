import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./features/landing/LandingPage"
import LoginPage from "./features/auth/LoginPage"
import RegisterPage from "./features/auth/RegisterPage"
import CreateOrganizationPage from "./features/org/CreateOrganizationPage"
import DashboardLayout from "./features/dashboard/components/DashboardLayout"
import DashboardPage from "./features/dashboard/DashboardPage"
import SiteSetupPage from "./features/sites-management/components/SiteSetupPage"
import SpaceEditorPage from "./features/editor/components/SpaceEditorPage"
import GlobalChangeRequestsPage from "./features/change-requests/components/GlobalChangeRequestsPage"

/**
 * Main application router configuration using React Router DOM.
 * 
 * Routing structure:
 * - Public Routes:
 *   - `/`: The general LandingPage.
 *   - `/login` / `/register`: Authenticating routes.
 *   - `/create-organization`: Triggers onboarding org setup if the user has no organization yet.
 * 
 * - Protected/Contextual Routes (Nested under `/o/:orgId` with DashboardLayout):
 *   - `index` (`/o/:orgId`): Redirects immediately to `home` (`/o/:orgId/home`).
 *   - `home`: Renders the main DashboardPage (overview of sites, activity).
 *   - `sites/:siteId`: Renders the site settings and space management dashboard (SiteSetupPage).
 *   - `s/:spaceId`: SpaceEditorPage for viewing and managing documents in a Git-like space.
 *   - `s/:spaceId/~/change-requests`: SpaceEditorPage with the Change Requests Drawer opened.
 *   - `s/:spaceId/~/changes/:changeRequestId`: SpaceEditorPage with a specific change request review pane active.
 *   - `changes`: GlobalChangeRequestsPage listing all open pull/change requests for the organization.
 *   - `changes/:changeRequestId`: GlobalChangeRequestsPage targeting a specific change request.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-organization" element={<CreateOrganizationPage />} />
        
        {/* DashboardLayout establishes context for the organization (Navbar, Sidebar, etc.) */}
        <Route path="/o/:orgId" element={<DashboardLayout />}>
          {/* Default redirect from organization root to organization home */}
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<DashboardPage />} />
          <Route path="sites/:siteId" element={<SiteSetupPage />} />
          
          {/* Editor view modes */}
          <Route path="s/:spaceId" element={<SpaceEditorPage />} />
          <Route path="s/:spaceId/~/change-requests" element={<SpaceEditorPage />} />
          <Route path="s/:spaceId/~/changes/:changeRequestId" element={<SpaceEditorPage />} />
          
          {/* Change request management at the organization level */}
          <Route path="changes" element={<GlobalChangeRequestsPage />} />
          <Route path="changes/:changeRequestId" element={<GlobalChangeRequestsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

