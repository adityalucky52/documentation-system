import { Link, useParams } from "react-router-dom"
import { useAuthStore } from "../auth/authStore"
import { useSitesStore } from "../sites-management/sitesStore"
import { 
  Plus, 
  GitBranch, 
  Tv, 
  BookOpen, 
  ArrowRight
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const userName = user?.name || user?.email?.split("@")[0] || "aditya"
  const { sites, setCreateModalOpen } = useSitesStore()
  const { orgId } = useParams<{ orgId: string }>()

  return (
    <div className="max-w-[1012px] w-full mx-auto px-8 py-10 flex flex-col gap-9 font-sans text-[#f5f5f7]">
      {/* Welcome Title */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white leading-tight">
          Welcome back
        </h1>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* New Card */}
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-[#161618] border border-[#222225] hover:border-[#323236] hover:bg-[#1a1a1c] rounded-xl transition-all cursor-pointer group w-full text-left"
        >
          <div className="w-11 h-11 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center transition-colors">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#9a9a9f] group-hover:text-white transition-colors">New</span>
        </button>

        {/* Change requests */}
        <button className="flex flex-col items-center justify-center gap-3 p-6 bg-[#161618] border border-[#222225] hover:border-[#323236] hover:bg-[#1a1a1c] rounded-xl transition-all cursor-pointer group">
          <div className="w-11 h-11 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center transition-colors">
            <GitBranch className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#9a9a9f] group-hover:text-white transition-colors">Change requests</span>
        </button>

        {/* Invite */}
        <button className="flex flex-col items-center justify-center gap-3 p-6 bg-[#161618] border border-[#222225] hover:border-[#323236] hover:bg-[#1a1a1c] rounded-xl transition-all cursor-pointer group">
          <div className="w-11 h-11 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center transition-colors">
            <div className="flex items-center gap-[1px]">
              <span className="text-xs font-bold text-white leading-none">G</span>
              <span className="text-xs font-bold text-[#8e8e93] leading-none">+</span>
            </div>
          </div>
          <span className="text-sm font-medium text-[#9a9a9f] group-hover:text-white transition-colors">Invite</span>
        </button>
      </div>

      {/* Recents Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wider text-[#8e8e93] uppercase">Recents</h2>
        
        {sites.length === 0 ? (
          <div className="p-8 text-center bg-[#161618] border border-[#222225] rounded-xl">
            <p className="text-sm text-[#8e8e93]">No recent sites. Create one to get started!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sites.map((site) => (
              <Link 
                key={site.id}
                to={`/o/${orgId}/sites/${site.id}`}
                className="flex items-center justify-between p-4 bg-[#161618] border border-[#222225] hover:border-[#323236] hover:bg-[#1a1a1c] rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] shrink-0 group-hover:text-white transition-colors">
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="h-5 w-5"
                    >
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <path d="M4 15h16" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-[#8e8e93]">{userName}</span>
                      <span className="text-[#3a3a3f]">/</span>
                      <span className="font-semibold text-white group-hover:text-white transition-colors">{site.name}</span>
                    </div>
                    <span className="text-xs text-[#8e8e93] mt-0.5">Last edited {site.updatedAt}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>


      {/* Bottom Grid: Dive Deeper & Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
        {/* Dive Deeper */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold tracking-wider text-[#8e8e93] uppercase">Dive deeper</h2>
          
          <div className="flex flex-col gap-3">
            {/* Webinars Card */}
            <div className="p-4 bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] shrink-0">
                  <Tv className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold text-white">Webinars</h3>
                  <p className="text-xs text-[#8e8e93] leading-relaxed max-w-[280px]">
                    Watch our webinars to learn how to create engaging and interactive docs.
                  </p>
                </div>
              </div>
              <a href="#" className="flex items-center gap-1 text-xs text-[#8e8e93] hover:text-white transition-colors font-medium shrink-0 group">
                <span>Watch now</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Read the docs */}
            <div className="p-4 bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold text-white">Read the docs</h3>
                  <p className="text-xs text-[#8e8e93] leading-relaxed max-w-[280px]">
                    Find articles, guides, and much more to get the most out of your setup.
                  </p>
                </div>
              </div>
              <a href="#" className="flex items-center gap-1 text-xs text-[#8e8e93] hover:text-white transition-colors font-medium shrink-0 group">
                <span>Documentation</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Extend with integrations */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wider text-[#8e8e93] uppercase">Extend with integrations</h2>
            <a href="#" className="flex items-center gap-1 text-xs text-[#8e8e93] hover:text-white transition-colors font-medium group">
              <span>View more</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="flex flex-col gap-3">
            {/* Slack Integration */}
            <div className="p-4 bg-[#161618] border border-[#222225] hover:border-[#323236] hover:bg-[#1a1a1c] rounded-xl flex items-center gap-3.5 transition-all cursor-pointer group">
              {/* Slack Colored Icon Grid Replica */}
              <div className="w-10 h-10 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="h-5.5 w-5.5">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.043zm2.52-6.341a2.528 2.528 0 0 1-2.52-2.522 2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52v2.52H8.824zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H3.779a2.528 2.528 0 0 1-2.52-2.52V10.085a2.528 2.528 0 0 1 2.52-2.52h5.045zm6.341-2.52a2.528 2.528 0 0 1 2.522-2.522 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.52h-2.522v-2.518zm-1.261 0a2.528 2.528 0 0 1-2.522 2.52H6.301a2.528 2.528 0 0 1-2.52-2.52V3.779a2.528 2.528 0 0 1 2.52-2.52H11.38a2.528 2.528 0 0 1 2.522 2.52v5.045zm-2.52 6.341a2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.522 2.528 2.528 0 0 1-2.52-2.522v-2.52h2.52zm0-1.261a2.528 2.528 0 0 1-2.522-2.52V6.301a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52H13.882z" fill="#e01e5a"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-white transition-colors">Slack</span>
            </div>

            {/* GitHub Sync Integration */}
            <div className="p-4 bg-[#161618] border border-[#222225] hover:border-[#323236] hover:bg-[#1a1a1c] rounded-xl flex items-center gap-3.5 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 fill-white">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-white transition-colors">GitHub Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
