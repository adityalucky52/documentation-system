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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-organization" element={<CreateOrganizationPage />} />
        <Route path="/o/:orgId" element={<DashboardLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<DashboardPage />} />
          <Route path="sites/:siteId" element={<SiteSetupPage />} />
          <Route path="s/:spaceId" element={<SpaceEditorPage />} />
          <Route path="s/:spaceId/~/change-requests" element={<SpaceEditorPage />} />
          <Route path="s/:spaceId/~/changes/:changeRequestId" element={<SpaceEditorPage />} />
          <Route path="changes" element={<GlobalChangeRequestsPage />} />
          <Route path="changes/:changeRequestId" element={<GlobalChangeRequestsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
