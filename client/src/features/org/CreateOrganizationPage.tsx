import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "../auth/authStore"
import BrandingPanel from "../auth/components/BrandingPanel"

const GitBookLogo = () => (
  <div className="flex flex-col gap-[2px] items-start justify-center">
    <div className="w-[18px] h-[7px] bg-[#cfcfd3] rounded-[2px] transform skew-x-[-15deg]"></div>
    <div className="w-[18px] h-[7px] bg-[#898993] rounded-[2px] transform skew-x-[-15deg] translate-x-[2px]"></div>
    <div className="w-[18px] h-[7px] bg-[#4b4b52] rounded-[2px] transform skew-x-[-15deg] translate-x-[4px]"></div>
  </div>
)

export default function CreateOrganizationPage() {
  const navigate = useNavigate()
  const { user, organization, createOrganization, fetchMyOrganization } = useAuthStore()
  const [orgName, setOrgName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (organization) {
      navigate(`/o/${organization.id}/home`)
      return
    }

    fetchMyOrganization().then((org) => {
      if (org) {
        navigate(`/o/${org.id}/home`)
      }
    })
  }, [user, organization, navigate, fetchMyOrganization])

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
      {/* Form (Left side on desktop) */}
      <div className="flex flex-1 flex-col justify-center items-center py-12 lg:py-0 px-4 sm:px-6">
        <div className="w-full max-w-[420px] flex flex-col gap-9">
          {/* Logo */}
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

      {/* Visual showcase (Right side on desktop) */}
      <BrandingPanel />
    </div>
  )
}
