import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./features/landing/LandingPage"
import LoginPage from "./features/auth/LoginPage"
import RegisterPage from "./features/auth/RegisterPage"
import CreateOrganizationPage from "./features/org/CreateOrganizationPage"
import DashboardLayout from "./features/dashboard/components/DashboardLayout"
import DashboardPage from "./features/dashboard/DashboardPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-organization" element={<CreateOrganizationPage />} />
        <Route path="/o/:orgId" element={<DashboardLayout />}>
          <Route path="home" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
