import { useEffect } from "react"
import { useParams, useNavigate, Link, Outlet } from "react-router-dom"
import { useAuthStore } from "../../auth/authStore"
import { 
  ChevronDown, 
  Search, 
  Bell, 
  Home, 
  HelpCircle, 
  Settings, 
  MessageSquare 
} from "lucide-react"

export default function DashboardLayout() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const { user, organization, fetchMyOrganization } = useAuthStore()

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate("/login")
      return
    }

    // Fetch organization if it isn't set in store or if it doesn't match the route orgId
    if (!organization || organization.id !== orgId) {
      fetchMyOrganization()
    }
  }, [user, orgId, organization, navigate, fetchMyOrganization])

  const orgName = organization?.name || "Workspace"

  return (
    <div className="flex h-screen w-full bg-[#0c0c0e] text-white font-sans overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-[240px] flex flex-col justify-between border-r border-[#1f1f23] bg-[#0c0c0e] shrink-0">
        <div className="flex flex-col pt-3 px-3 gap-6">
          {/* Org Selector & Search/Notify */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1.5 hover:bg-[#1a1a1e] px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-left truncate max-w-[140px]">
              <span className="truncate">{orgName}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#88888e]" />
            </button>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-[#1a1a1e] rounded-md text-[#88888e] hover:text-white transition-colors">
                <Search className="h-4 w-4" />
              </button>
              <button className="p-1.5 hover:bg-[#1a1a1e] rounded-md text-[#88888e] hover:text-white transition-colors relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-0.5">
            <Link 
              to={`/o/${orgId}/home`}
              className="flex items-center gap-2 bg-[#1c1c1e] text-[#f4f4f5] px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </nav>

          {/* Docs sites Header / Empty State */}
          <div className="flex flex-col gap-1.5 mt-2">
            <button className="flex items-center gap-1 text-[11px] font-bold text-[#88888e] uppercase tracking-wider px-2.5">
              <span>Docs sites</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="px-2.5 py-2 bg-[#0e0e11] border border-[#1f1f23] rounded-md mx-0.5">
              <p className="text-xs text-[#88888e] leading-relaxed">
                Create your first site and publish your content to the web.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="flex items-center gap-0.5 p-3 border-t border-[#1f1f23]">
          <button title="Help" className="p-1.5 hover:bg-[#1a1a1e] rounded-md text-[#88888e] hover:text-white transition-colors">
            <HelpCircle className="h-4 w-4" />
          </button>
          <button title="Settings" className="p-1.5 hover:bg-[#1a1a1e] rounded-md text-[#88888e] hover:text-white transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          <button title="Feedback" className="p-1.5 hover:bg-[#1a1a1e] rounded-md text-[#88888e] hover:text-white transition-colors">
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-[#121214] overflow-y-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
