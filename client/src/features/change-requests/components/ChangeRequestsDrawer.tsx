import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { X, GitPullRequest, GitBranch, Plus, Calendar, User, CheckCircle2, ChevronDown, Check, GitMerge, Archive } from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useAuthStore } from "../../auth/authStore"

interface ChangeRequestsDrawerProps {
  onClose: () => void
}

export default function ChangeRequestsDrawer({ onClose }: ChangeRequestsDrawerProps) {
  const { spaceId, orgId } = useParams<{ spaceId: string; orgId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentStatusFilter = searchParams.get("status") || "draft"

  const { user } = useAuthStore()
  const { 
    changeRequests, 
    fetchChangeRequests, 
    createChangeRequest,
    fetchOpenChangeRequests
  } = useChangeRequestStore()

  // Filter dropdown state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)

  // Inline CR creation form toggle
  const [isCreating, setIsCreating] = useState(false)
  const [newCrTitle, setNewCrTitle] = useState("")

  // Fetch change requests when spaceId or filter changes
  useEffect(() => {
    if (spaceId && user) {
      fetchChangeRequests(spaceId, user.id, currentStatusFilter)
    }
  }, [spaceId, currentStatusFilter, user, fetchChangeRequests])

  // Handle switching status filters
  const handleStatusFilterChange = (status: string) => {
    setSearchParams({ status })
    setIsFilterDropdownOpen(false)
  }

  // Handle creating a new change request — does NOT auto-switch workspace
  // Switching is done via the context switcher in the editor header
  const handleCreateCR = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCrTitle.trim() || !spaceId || !user) return

    const newCR = await createChangeRequest(spaceId, newCrTitle.trim(), user.id)
    if (newCR) {
      setNewCrTitle("")
      setIsCreating(false)
      // Refresh the open CRs list so the switcher picks it up
      await fetchOpenChangeRequests(spaceId, user.id)
    }
  }

  // Clicking a CR card opens its review pane
  const handleOpenReviewPane = (crId: string) => {
    navigate(`/o/${orgId}/s/${spaceId}/~/changes/${crId}`)
  }

  const getFilterDisplayName = (status: string) => {
    if (status === "draft") return "Draft"
    if (status === "merged") return "Merged"
    if (status === "open") return "In review"
    if (status === "closed") return "Archived"
    return "Draft"
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-[380px] bg-[#0e0e11] border-l border-[#1f1f23] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1f1f23] bg-[#0c0c0e]">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Change requests</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-[#1a1a1e] rounded text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Dropdowns */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1f1f23] bg-[#0c0c0e]/50 relative">
        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-[#161618] border border-[#222225] hover:border-[#323236] text-white flex items-center gap-1 cursor-pointer"
          >
            <GitBranch className="w-3 h-3 text-indigo-400" />
            <span>{getFilterDisplayName(currentStatusFilter)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93]" />
          </button>

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

        <button className="px-2.5 py-1 text-xs font-semibold rounded text-[#8e8e93] hover:text-white bg-transparent border border-transparent">
          Yours
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Create New Change Request Inline Form */}
        {!isCreating ? (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full py-2 px-3 border border-dashed border-[#222225] hover:border-indigo-500/50 hover:bg-indigo-950/5 text-[#8e8e93] hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Change Request</span>
          </button>
        ) : (
          <form onSubmit={handleCreateCR} className="p-3 border border-[#222225] bg-[#161618] rounded-lg flex flex-col gap-3 animate-in fade-in duration-100">
            <input 
              type="text"
              autoFocus
              placeholder="Describe your changes..."
              value={newCrTitle}
              onChange={(e) => setNewCrTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#0c0c0e] border border-[#222225] rounded-md text-xs text-white placeholder-[#4e4e54] focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#8e8e93] hover:text-white bg-[#1c1c1e] border border-[#2d2d30] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!newCrTitle.trim()}
                className="px-2.5 py-1 text-[11px] font-semibold text-black bg-white hover:bg-white/90 disabled:bg-[#222225] disabled:text-[#4c4c52] rounded cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Change Request Listing */}
        <div className="flex flex-col gap-2">
          {changeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#8e8e93] gap-2">
              <GitPullRequest className="w-8 h-8 text-[#222225]" />
              <span className="text-xs">No change requests found</span>
            </div>
          ) : (
            changeRequests.map((cr) => (
              <div 
                key={cr.id}
                onClick={() => handleOpenReviewPane(cr.id)}
                className="p-3 border border-[#1f1f23] hover:border-[#323236] bg-[#121214] rounded-lg flex flex-col gap-2 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {cr.status === "MERGED" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white truncate leading-snug group-hover:text-indigo-400 transition-colors">
                      {cr.title}
                    </span>
                  </div>
                  {/* Status badge */}
                  {cr.status === "DRAFT" && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-950/40 text-indigo-400 border border-indigo-500/20">
                      Draft
                    </span>
                  )}
                  {cr.status === "OPEN" && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950/40 text-amber-400 border border-amber-500/20">
                      In review
                    </span>
                  )}
                  {cr.status === "MERGED" && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                      Merged
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8e8e93]">
                  <span className="flex items-center gap-0.5">
                    <User className="w-3 h-3" />
                    <span>You</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(cr.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </span>
                </div>

                {cr.status !== "MERGED" && (
                  <p className="text-[10px] text-[#8e8e93] mt-0.5">
                    Open in the editor context switcher to start editing.
                  </p>
                )}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  )
}
