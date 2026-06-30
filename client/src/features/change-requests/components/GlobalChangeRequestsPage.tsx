import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { GitPullRequest, GitBranch, Calendar, User, CheckCircle2, ChevronDown, Check, GitMerge, Archive } from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useAuthStore } from "../../auth/authStore"
import ChangeRequestReviewPane from "./ChangeRequestReviewPane"

/**
 * GlobalChangeRequestsPage Component.
 * 
 * Purpose:
 * Renders the organization-wide change requests dashboard view.
 * Enables team leaders or users to filter through all drafts, active reviews, merged histories, or closed files
 * across all spaces inside the organization.
 * 
 * Structure:
 * 1. Left Panel (Feed List): Displays list of filtered branches. Provides dropdown filters.
 * 2. Right Panel (Detail Canvas): Shows comparative side-by-side diff details (`ChangeRequestReviewPane`)
 *    when a specific request is clicked, or shows a graphic template placeholder if none is active.
 */
export default function GlobalChangeRequestsPage() {
  // Extract org context and current review targets from routes
  const { orgId, changeRequestId } = useParams<{ orgId: string; changeRequestId: string }>()
  const navigate = useNavigate()
  
  // Use React Router hook to read and sync status filter values directly to search queries
  const [searchParams, setSearchParams] = useSearchParams()
  const currentStatusFilter = searchParams.get("status") || "draft"

  // Fetch session parameters
  const { user } = useAuthStore()
  // Connect change request version control stores
  const { 
    changeRequests, 
    fetchOrgChangeRequests,
    isLoading 
  } = useChangeRequestStore()

  // Dropdown filter list toggle state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)

  // Effect 1: Pull updated list of change requests when the organization or status filters toggle
  useEffect(() => {
    if (orgId && user) {
      fetchOrgChangeRequests(orgId, user.id, currentStatusFilter)
    }
  }, [orgId, currentStatusFilter, user, fetchOrgChangeRequests])

  /**
   * Action: Modifies search query parameters to trigger new api fetches and collapses selection cards.
   */
  const handleStatusFilterChange = (status: string) => {
    setSearchParams({ status })
    setIsFilterDropdownOpen(false)
  }

  /**
   * Helper: Resolves visual display strings from raw enum states.
   */
  const getFilterDisplayName = (status: string) => {
    if (status === "draft") return "Draft"
    if (status === "merged") return "Merged"
    if (status === "open") return "In review"
    if (status === "closed") return "Archived"
    return "Draft"
  }

  return (
    <div className="flex-1 flex w-full h-full text-[#f5f5f7] bg-[#0c0c0e] font-sans overflow-hidden">
      
      {/* Middle Column: Change Requests Feed List */}
      <div className="w-[320px] border-r border-[#1f1f23] bg-[#0c0c0e] flex flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Section Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1f1f23] bg-[#0c0c0e] shrink-0">
            <span className="text-[13px] font-semibold text-[#f5f5f7]">Change requests</span>
            <button className="text-[#8e8e93] hover:text-white text-xs font-semibold hover:bg-[#1a1a1e] px-1.5 py-0.5 rounded transition-colors cursor-pointer">+</button>
          </div>

          {/* Filter Bar Controls */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1f1f23] bg-[#0c0c0e]/50 relative shrink-0">
            <div className="relative">
              {/* Active selection pill button */}
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-[#161618] border border-[#222225] hover:border-[#323236] text-white flex items-center gap-1 cursor-pointer"
              >
                <GitBranch className="w-3 h-3 text-indigo-400" />
                <span>{getFilterDisplayName(currentStatusFilter)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93]" />
              </button>

              {/* Status options dropdown box */}
              {isFilterDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-44 bg-[#161618] border border-[#222225] rounded-lg shadow-xl py-1 z-50 flex flex-col animate-in fade-in duration-100">
                  <button 
                    onClick={() => handleStatusFilterChange("draft")}
                    className="px-3 py-1.5 hover:bg-[#1f1f23] text-left text-xs font-medium text-white flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Draft</span>
                    </div>
                    {currentStatusFilter === "draft" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                  <button 
                    onClick={() => handleStatusFilterChange("open")}
                    className="px-3 py-1.5 hover:bg-[#1f1f23] text-left text-xs font-medium text-white flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>In review</span>
                    </div>
                    {currentStatusFilter === "open" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                  <button 
                    onClick={() => handleStatusFilterChange("merged")}
                    className="px-3 py-1.5 hover:bg-[#1f1f23] text-left text-xs font-medium text-white flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GitMerge className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Merged</span>
                    </div>
                    {currentStatusFilter === "merged" && <Check className="w-3.5 h-3.5 text-[#10b981]" />}
                  </button>
                  <button 
                    onClick={() => handleStatusFilterChange("closed")}
                    className="px-3 py-1.5 hover:bg-[#1f1f23] text-left text-xs font-medium text-white flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Archived</span>
                    </div>
                    {currentStatusFilter === "closed" && <Check className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>
              )}
            </div>
            <button className="px-2.5 py-1 text-xs font-semibold rounded text-[#8e8e93] hover:text-white bg-transparent">
              Yours
            </button>
          </div>

          {/* Change Request Feed List Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {isLoading && changeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-t-indigo-500 border-zinc-700 rounded-full"></div>
                <span className="text-[10px]">Loading changes...</span>
              </div>
            ) : changeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#8e8e93] gap-2">
                <GitPullRequest className="w-8 h-8 text-[#222225]" />
                <span className="text-xs">No change requests found</span>
              </div>
            ) : (
              changeRequests.map((cr) => {
                const spaceName = cr.space?.name || "Space"
                const siteName = cr.space?.site?.name || "Docs"
                const isActive = changeRequestId === cr.id

                return (
                  <div 
                    key={cr.id}
                    onClick={() => navigate(`/o/${orgId}/changes/${cr.id}`)}
                    className={`p-3 border rounded-lg flex flex-col gap-2 transition-all cursor-pointer group ${isActive ? "bg-[#1c1c1e] border-indigo-500/35" : "border-[#1f1f23] hover:border-[#323236] bg-[#121214]"}`}
                  >
                    {/* Site & Space labels */}
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span>{siteName}</span>
                      <span>/</span>
                      <span>{spaceName}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {cr.status === "MERGED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        )}
                        <span className={`text-xs font-bold text-white truncate leading-snug group-hover:text-indigo-400 transition-colors ${isActive ? "text-indigo-400" : ""}`}>
                          {cr.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8e8e93]">
                      <span className="flex items-center gap-0.5">
                        <User className="w-3 h-3" />
                        <span>User</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(cr.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>

      {/* Right Column: Comparative Diff Canvas */}
      <div className="flex-1 flex flex-col h-full bg-[#121214] overflow-hidden">
        {changeRequestId ? (
          /* Render diff review panel if ID exists in URL */
          <ChangeRequestReviewPane />
        ) : (
          /* Render Graphic Placeholder if none is active */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
            
            {/* Stacked decorative card visuals */}
            <div className="relative w-[220px] h-[120px] mb-2 flex items-center justify-center">
              {/* Bottom Layer Card */}
              <div className="absolute w-[200px] h-[100px] bg-[#161618] border border-[#222225] rounded-xl translate-y-[-10px] scale-[0.92] opacity-30 shadow-md"></div>
              {/* Middle Layer Card */}
              <div className="absolute w-[200px] h-[100px] bg-[#161618] border border-[#222225] rounded-xl translate-y-[-5px] scale-[0.96] opacity-60 shadow-lg"></div>
              {/* Foreground main mockup card */}
              <div className="absolute w-[200px] h-[100px] bg-[#161618]/95 border border-[#2d2d30] rounded-xl p-3 shadow-2xl flex flex-col justify-between text-left">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/25 rounded-full text-[9px] font-bold flex items-center gap-0.5">
                    <GitBranch className="w-2.5 h-2.5" />
                    <span>In review</span>
                  </span>
                  <span className="text-[9px] text-zinc-600 font-bold font-mono">#43</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="h-1.5 w-24 bg-zinc-800 rounded"></div>
                  <div className="h-1 w-32 bg-zinc-900 rounded"></div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
                  <div className="h-1 w-10 bg-zinc-900 rounded ml-auto"></div>
                </div>
              </div>
            </div>

            {/* Placeholder descriptions typography */}
            <div className="flex flex-col gap-1.5 max-w-[420px]">
              <h2 className="text-sm font-bold text-white tracking-tight">Select a change request</h2>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Pick a change request from the list to view and review its changes.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

