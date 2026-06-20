import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSitesStore } from "../sitesStore"
import { useAuthStore } from "../../auth/authStore"
import { 
  BookOpen, 
  Upload, 
  Globe, 
  Send, 
  PenTool, 
  UserPlus, 
  Palette, 
  Plus,
  Compass,
  ChevronRight,
  GitBranch,
  Trash2
} from "lucide-react"

export default function SiteSetupPage() {
  const { siteId, orgId } = useParams<{ siteId: string; orgId: string }>()
  const navigate = useNavigate()
  const { sites, setupSite, deleteSite } = useSitesStore()
  const { user } = useAuthStore()
  const site = sites.find((s) => s.id === siteId)
  const siteName = site?.name || "Site"
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "preview" | "settings" | "publish">("overview")

  const handleSetupBlank = async () => {
    if (!site || !user) return
    await setupSite(site.id, "blank", user.id)
  }

  const handleDeleteSite = async () => {
    if (!site || !user) return
    if (confirm(`Are you absolutely sure you want to delete the site "${site.name}"? This action is permanent and cannot be undone.`)) {
      const success = await deleteSite(site.id, user.id)
      if (success) {
        navigate(`/o/${orgId}/home`)
      }
    }
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Site not found
      </div>
    )
  }

  // IF SITE IS NOT SETUP: Show Onboarding template/blank options
  if (!site.isSetup) {
    return (
      <div className="max-w-[1012px] w-full mx-auto px-8 py-12 flex flex-col gap-10 font-sans text-[#f5f5f7]">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-[#8e8e93] font-medium">
            <span>Docs sites</span>
            <span>/</span>
            <span className="text-white">{siteName}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white leading-tight mt-1">
            Set up your space
          </h1>
          <p className="text-sm text-[#8e8e93]">
            Choose how you want to start building content for <strong className="text-white font-medium">{siteName}</strong>.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Docs Template Option */}
          <div className="flex flex-col bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl overflow-hidden group cursor-pointer transition-all hover:translate-y-[-2px]">
            {/* Preview Illustration */}
            <div className="h-[150px] bg-[#0c0c0e] border-b border-[#222225] flex items-center justify-center p-4 relative overflow-hidden shrink-0">
              <div className="w-[180px] h-[100px] bg-[#161618] border border-[#222225] rounded-lg p-2.5 flex flex-col gap-1.5 shadow-lg group-hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-[#312e81]/30 border border-[#4338ca]/30 flex items-center justify-center text-[#818cf8]">
                    <BookOpen className="h-2 w-2" />
                  </div>
                  <div className="h-1.5 w-12 bg-[#3a3a3f] rounded"></div>
                </div>
                <div className="h-1 w-28 bg-[#2c2c30] rounded"></div>
                <div className="h-1 w-24 bg-[#2c2c30] rounded"></div>
                <div className="h-1 w-20 bg-[#2c2c30] rounded"></div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl"></div>
            </div>
            {/* Card Body */}
            <div className="p-5 flex flex-col gap-1.5">
              <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                Docs template
              </h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Start with a ready-made documentation layout you can customize.
              </p>
            </div>
          </div>

          {/* Import Option */}
          <div className="flex flex-col bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl overflow-hidden group cursor-pointer transition-all hover:translate-y-[-2px]">
            {/* Preview Illustration */}
            <div className="h-[150px] bg-[#0c0c0e] border-b border-[#222225] flex items-center justify-center p-4 relative overflow-hidden shrink-0">
              <div className="flex items-center gap-6 group-hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-xl bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93]">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-[#312e81]/20 border border-[#4338ca]/30 flex items-center justify-center text-[#818cf8]">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="h-1 w-10 bg-[#3a3a3f] rounded"></div>
                </div>
              </div>
            </div>
            {/* Card Body */}
            <div className="p-5 flex flex-col gap-1.5">
              <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                Import
              </h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Bring in existing content from online docs, Markdown, or HTML files.
              </p>
            </div>
          </div>

          {/* Blank Option */}
          <div 
            onClick={handleSetupBlank}
            className="flex flex-col bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl overflow-hidden group cursor-pointer transition-all hover:translate-y-[-2px]"
          >
            {/* Preview Illustration */}
            <div className="h-[150px] bg-[#0c0c0e] border-b border-[#222225] flex items-center justify-center p-4 relative overflow-hidden shrink-0">
              <div className="w-[180px] h-[100px] bg-[#161618] border border-[#222225] rounded-lg p-3 flex flex-col gap-2 shadow-lg group-hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-1.5 border-b border-[#222225] pb-2">
                  <div className="h-1.5 w-16 bg-[#3a3a3f] rounded"></div>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="h-1 w-24 bg-[#2c2c30] rounded"></div>
                  <div className="h-1 w-16 bg-[#2c2c30] rounded"></div>
                </div>
              </div>
            </div>
            {/* Card Body */}
            <div className="p-5 flex flex-col gap-1.5">
              <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                Blank
              </h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Begin with an empty space and create everything from scratch.
              </p>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // IF SITE IS SETUP: Show Active Site Dashboard (Overview, checklist, spaces)
  return (
    <div className="flex-1 flex flex-col w-full h-full text-[#f5f5f7] bg-[#0c0c0e] overflow-y-auto">
      {/* Dynamic Sub-header Navigation */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-[#1f1f23] bg-[#0e0e11] sticky top-0 z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8e8e93]">
          <span>Docs sites</span>
          <span>/</span>
          <span className="text-white bg-[#1c1c1e] px-2 py-0.5 rounded text-[11px] font-bold">L</span>
          <span className="text-white font-medium">{siteName}</span>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "overview" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
          >
            Overview
          </button>
          <button 
            onClick={() => {
              if (site.spaces && site.spaces.length > 0) {
                navigate(`/o/${orgId}/s/${site.spaces[0].id}`)
              } else {
                setActiveTab("editor")
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "editor" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
          >
            Editor
          </button>
          <button 
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "preview" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
          >
            Preview
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "settings" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab("publish")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0070f3] text-white hover:bg-[#0060d3] transition-colors flex items-center gap-1 cursor-pointer`}
          >
            <Send className="h-3 w-3" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout Columns */}
      <div className="max-w-[1200px] w-full mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Site Info Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#161618] border border-[#222225] rounded-xl overflow-hidden p-5 flex flex-col gap-6">
            
            {/* Visual Preview Box */}
            <div className="aspect-[4/3] w-full bg-[#0c0c0e] border border-[#222225] rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden">
              <div className="h-1.5 w-16 bg-[#3a3a3f] rounded"></div>
              <div className="h-1 w-24 bg-[#2c2c30] rounded"></div>
              <div className="h-1 w-20 bg-[#2c2c30] rounded"></div>
              <div className="w-[80px] h-[50px] bg-[#161618] border border-[#222225] rounded absolute bottom-2 right-2 p-1.5 flex flex-col gap-1">
                <div className="h-1 w-10 bg-[#3a3a3f] rounded"></div>
                <div className="h-0.5 w-8 bg-[#2c2c30] rounded"></div>
              </div>
            </div>

            {/* Site Name and Status */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-white tracking-tight">{siteName}</h2>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-[#e0a800]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e0a800]"></span>
                  <span>Unpublished</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8e8e93]">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Public</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#1f1f23]"></div>

            {/* Site structure spaces list */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">
                Site structure
              </h4>
              <div className="flex flex-col gap-1">
                {site.spaces?.map((space) => (
                  <div 
                    key={space.id} 
                    className="flex items-center justify-between px-2.5 py-1.5 bg-[#0c0c0e]/60 border border-[#222225] rounded-md text-xs font-medium text-white"
                  >
                    <div className="flex items-center gap-2">
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-4 w-4 text-[#88888e]"
                      >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                        <path d="M6 6h10"/>
                        <path d="M6 10h10"/>
                      </svg>
                      <span>{space.name}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[#88888e]" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Get Started Checklist (8 cols) or Settings Panel */}
        {activeTab === "settings" ? (
          <div className="lg:col-span-8 flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1.5 shrink-0">
              <h2 className="text-sm font-semibold tracking-wider text-[#8e8e93] uppercase">Site Settings</h2>
              <p className="text-xs text-[#8e8e93]">Manage configurations and control access for this documentation site.</p>
            </div>

            <div className="bg-[#161618] border border-[#e11d48]/20 rounded-xl p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 border-b border-[#222225] pb-4">
                <h3 className="text-sm font-semibold text-white">Danger Zone</h3>
                <p className="text-xs text-[#8e8e93]">Irreversible actions regarding this documentation site.</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-semibold text-white">Delete this site</h4>
                  <p className="text-[11px] text-[#8e8e93]">Once deleted, all pages, spaces, and content will be permanently lost.</p>
                </div>
                <button 
                  onClick={handleDeleteSite}
                  className="px-4 py-2 bg-[#e11d48]/10 hover:bg-[#e11d48] border border-[#e11d48]/30 hover:border-transparent text-[#f43f5e] hover:text-white rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Site</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold tracking-wider text-[#8e8e93] uppercase">Get started</h2>
              <span className="text-xs font-semibold text-[#8e8e93] bg-[#161618] px-2 py-0.5 rounded border border-[#222225]">
                0/7 tasks completed
              </span>
            </div>

            <div className="flex flex-col gap-3">
              
              {/* Task 1: Edit your content (Expanded active task) */}
              <div className="bg-[#161618] border border-[#222225] rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-white shrink-0">
                      <PenTool className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <h3 className="text-sm font-semibold text-white">Edit your content</h3>
                      <p className="text-xs text-[#8e8e93] leading-relaxed max-w-[500px]">
                        Create a change request to edit your site's content safely, then merge it to update your site when ready.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expand controls */}
                <div className="flex items-center gap-3 pl-[50px] mt-1">
                  <button className="px-3.5 py-1.5 text-xs font-semibold text-black bg-white hover:bg-white/95 rounded-md flex items-center gap-1.5 transition-all cursor-pointer">
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>Edit in your first change request</span>
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-md transition-colors cursor-pointer">
                    Skip for now
                  </button>
                </div>
              </div>

              {/* Task 2: Invite teammates */}
              <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
                    Invite teammates
                  </span>
                </div>
                <Plus className="h-4 w-4 text-[#8e8e93]" />
              </div>

              {/* Task 3: Customize look and feel */}
              <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
                    <Palette className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
                    Customize the look and feel
                  </span>
                </div>
                <Plus className="h-4 w-4 text-[#8e8e93]" />
              </div>

              {/* Task 4: Add structure to site */}
              <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
                    Add structure to your site
                  </span>
                </div>
                <Plus className="h-4 w-4 text-[#8e8e93]" />
              </div>

              {/* Task 5: Add custom domain */}
              <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
                    Add a custom domain
                  </span>
                </div>
                <Plus className="h-4 w-4 text-[#8e8e93]" />
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
