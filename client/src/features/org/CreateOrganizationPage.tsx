import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "../auth/authStore"
import BrandingPanel from "../auth/components/BrandingPanel"

/**
 * GitBookLogo SVG Component.
 * Pure visual component representing the branding logo (three slanted gray/black blocks).
 */
const GitBookLogo = () => (
  <div className="flex flex-col gap-[2px] items-start justify-center">
    <div className="w-[18px] h-[7px] bg-[#cfcfd3] rounded-[2px] transform skew-x-[-15deg]"></div>
    <div className="w-[18px] h-[7px] bg-[#898993] rounded-[2px] transform skew-x-[-15deg] translate-x-[2px]"></div>
    <div className="w-[18px] h-[7px] bg-[#4b4b52] rounded-[2px] transform skew-x-[-15deg] translate-x-[4px]"></div>
  </div>
)

/**
 * CreateOrganizationPage Component.
 * 
 * Purpose:
 * Renders the onboarding interface for creating a new workspace organization.
 * 
 * Security & Routing Guard:
 * 1. Checks if a user is logged in. If not, pushes to `/login`.
 * 2. Checks if an organization is already linked. If so, skips onboarding and redirects directly to home.
 * 3. Attempts to fetch existing organization mapping from the server via `fetchMyOrganization()`.
 *    If found, syncs state and redirects the user automatically.
 * 
 * Context & API Flow:
 * - Employs `useAuthStore` (Zustand state store) to fetch user context, cache the organization,
 *   and execute the API post request for org creation.
 */
export default function CreateOrganizationPage() {
  const navigate = useNavigate()
  const { user, organization, createOrganization, fetchMyOrganization } = useAuthStore()
  
  // Controlled input for the new organization name
  const [orgName, setOrgName] = useState("")
  // Local submission indicator loading state
  const [isLoading, setIsLoading] = useState(false)

  // Redirect guard: Redirect immediately if user is already mapped to an organization
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (organization) {
      navigate(`/o/${organization.id}/home`)
      return
    }

    // Double check with server if a session is present but store was initialized without organization details
    fetchMyOrganization().then((org) => {
      if (org) {
        navigate(`/o/${org.id}/home`)
      }
    })
  }, [user, organization, navigate, fetchMyOrganization])

  /**
   * Triggers the creation of the organization on the server.
   * On success, routes the user directly to the home screen of their new organization `/o/:orgId/home`.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const org = await createOrganization(orgName)
    setIsLoading(false)
    if (org) {
      navigate(`/o/${org.id}/home`)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0c0c0e]">
      
      {/* Workspace Onboarding Form Pane (Left hand side on desktop displays) */}
      <div className="flex flex-1 flex-col justify-center items-center py-12 lg:py-0 px-4 sm:px-6">
        <div className="w-full max-w-[420px] flex flex-col gap-9">
          
          {/* Logo container */}
          <div className="flex items-center gap-2">
            <GitBookLogo />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-white leading-tight">
              Create your organization
            </h2>
            <p className="text-sm text-[#71717a]">
              Welcome, {user?.name || user?.email || "developer"}! Let's set up your workspace.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Organization name"
                  required
                  autoFocus
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-10 bg-[#0e0e10] border-[#26262b] text-white placeholder-[#71717a] focus-visible:border-white focus-visible:ring-0 rounded-lg text-sm transition-colors"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !orgName}
                className="w-full h-10 mt-1 bg-[#27272a] hover:bg-[#3f3f46] disabled:bg-[#1a1a1c] disabled:text-[#71717a] text-[#e4e4e7] hover:text-white font-medium text-sm rounded-lg transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-5 text-center">
            <p className="text-xs text-[#71717a] leading-relaxed">
              This will be the home for your team and your documentation. You can invite team members and configure custom domains later.
            </p>
          </div>
        </div>
      </div>

      {/* Visual showcase panel (Right side on desktop displays) */}
      <BrandingPanel />
    </div>
  )
}

