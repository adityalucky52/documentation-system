import { useEffect } from "react"
import { useParams, useNavigate, Link, Outlet } from "react-router-dom"
import { useAuthStore } from "../../auth/authStore"
import { useSitesStore } from "../../sites/sitesStore"
import CreateSiteModal from "../../sites/components/CreateSiteModal"
import { 
  ChevronDown, 
  Search, 
  Bell, 
  Home, 
  HelpCircle, 
  Settings, 
  MessageSquare,
  Plus,
  LogOut
} from "lucide-react"

export default function DashboardLayout() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const { user, organization, fetchMyOrganization, logout } = useAuthStore()
  
  // Sites Store integration
  const { sites, fetchSites, isCreateModalOpen, setCreateModalOpen } = useSitesStore()

  const handleLogout = () => {
    logout()
    useSitesStore.setState({ sites: [] })
  }

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

  useEffect(() => {
    if (user) {
      fetchSites(user.id)
    }
  }, [user, fetchSites])

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

          {/* Docs sites Header / Sites List */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between px-2.5">
              <button className="flex items-center gap-1 text-[11px] font-bold text-[#88888e] uppercase tracking-wider">
                <span>Docs sites</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <button 
                onClick={() => setCreateModalOpen(true)}
                className="p-1 hover:bg-[#1c1c1e] text-[#88888e] hover:text-white rounded transition-colors cursor-pointer"
                title="Create a new site"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {sites.length === 0 ? (
              <div className="px-2.5 py-2 bg-[#0e0e11] border border-[#1f1f23] rounded-md mx-0.5">
                <p className="text-xs text-[#88888e] leading-relaxed">
                  Create your first site and publish your content to the web.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto px-1">
                {sites.map((site) => (
                  <div key={site.id} className="flex flex-col gap-0.5">
                    {/* Parent Site Link */}
                    <Link 
                      to={`/o/${orgId}/sites/${site.id}`}
                      className="flex items-center gap-2.5 hover:bg-[#1a1a1e] px-2.5 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group text-[#8e8e93] hover:text-white"
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-4 w-4 text-[#88888e] group-hover:text-white shrink-0 transition-colors"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <path d="M4 15h16" />
                      </svg>
                      <span className="truncate text-white/90 group-hover:text-white transition-colors">{site.name}</span>
                    </Link>

                    {/* Nested Spaces */}
                    {site.isSetup && site.spaces && site.spaces.map((space) => (
                      <div 
                        key={space.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 ml-4 rounded-md text-xs font-medium text-[#8e8e93] hover:text-white hover:bg-[#1a1a1e] transition-colors cursor-pointer group"
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="h-3.5 w-3.5 text-[#88888e] group-hover:text-white shrink-0"
                        >
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                          <path d="M6 6h10"/>
                          <path d="M6 10h10"/>
                        </svg>
                        <span className="truncate">{space.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="flex items-center gap-0.5 p-3 border-t border-[#1f1f23] w-full justify-between">
          <div className="flex items-center gap-0.5">
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
          <button 
            title="Log out" 
            onClick={handleLogout}
            className="p-1.5 hover:bg-[#1a1a1e] rounded-md text-[#88888e] hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-[#121214] overflow-y-auto flex flex-col">
        <Outlet />
      </main>

      {/* CREATE SITE MODAL */}
      <CreateSiteModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />
    </div>
  )
}

