import { useState, useRef, useEffect } from "react"
import { Sparkles, Globe, ChevronDown, X, Check, GitPullRequest, Plus } from "lucide-react"
import { useChangeRequestStore, type ChangeRequest } from "../changeRequestStore"
import { useSitesStore } from "../../sites-management/sitesStore"
import { useAuthStore } from "../../auth/authStore"

/**
 * CRStatusBadge Component.
 * Helper: Renders stylized status pill banners (In review vs Draft) mapping branch properties.
 */
function CRStatusBadge({ status }: { status: ChangeRequest["status"] }) {
  if (status === "OPEN")
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-500/20">
        In review
      </span>
    )
  if (status === "DRAFT")
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-950/40 text-indigo-400 border border-indigo-500/20">
        Draft
      </span>
    )
  return null
}

/**
 * ChangeRequestSwitcher Props.
 * @param spaceId - Unique identifier of active space. Originates in `EditorHeader`.
 * @param showNotification - Triggers status notice flashes. Originates in `EditorHeader`.
 */
interface ChangeRequestSwitcherProps {
  spaceId: string
  showNotification: (msg: string) => void
}

/**
 * ChangeRequestSwitcher Component.
 * 
 * Purpose:
 * Renders a dropdown menu button inside the editor sub-header breadcrumbs.
 * Enables writers to switch between:
 * 1. Read-Only Published Site (main branch).
 * 2. Active Change Request Branches (safe drafts).
 * Also houses a mini form inline inside the footer to spin up new branches instantly.
 */
export default function ChangeRequestSwitcher({ spaceId, showNotification }: ChangeRequestSwitcherProps) {
  const { user } = useAuthStore()
  // Ref container targeting switcher dropdown (used to capture outside click dismissals)
  const switcherRef = useRef<HTMLDivElement>(null)

  // version control store hooks
  const {
    selectedChangeRequestId,
    openChangeRequests,
    selectChangeRequest,
    createChangeRequest,
  } = useChangeRequestStore()

  // Sites store to refetch space page lists
  const { fetchSpace } = useSitesStore()

  // Local UI panel toggles
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [isCreatingCR, setIsCreatingCR] = useState(false)
  const [newCRTitle, setNewCRTitle] = useState("")

  // Derived: Active change request branch object
  const activeCR = openChangeRequests.find((cr) => cr.id === selectedChangeRequestId) ?? null

  // Effect 1: Handle clicks outside the dropdown menu wrapper to dismiss dialog overlays
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsSwitcherOpen(false)
        setIsCreatingCR(false)
        setNewCRTitle("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /**
   * Action: Selects and activates a change request branch.
   * Calls store actions, closes panels, and reloads space contents matching branch revision.
   */
  const handleSelectCR = async (crId: string | null) => {
    selectChangeRequest(crId)
    setIsSwitcherOpen(false)
    setIsCreatingCR(false)
    setNewCRTitle("")
    if (spaceId && user) {
      const cr = openChangeRequests.find((c) => c.id === crId) ?? null
      // Refetch page lists matching specific Git branch source branch ID (defaults to main if null)
      await fetchSpace(spaceId, user.id, cr?.sourceBranchId ?? undefined)
    }
  }

  /**
   * Action: Submits a new Change Request branch creation.
   */
  const handleCreateCR = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCRTitle.trim() || !spaceId || !user) return
    const cr = await createChangeRequest(spaceId, newCRTitle.trim(), user.id)
    if (cr) {
      setNewCRTitle("")
      setIsCreatingCR(false)
      showNotification(`Change request "${cr.title}" created. Select it from the switcher to start editing.`)
    }
  }

  return (
    <div className="relative shrink-0 font-sans" ref={switcherRef}>
      {/* Active Selection Button: Changes color schemes if editing a draft vs browsing live published content */}
      <button
        onClick={() => {
          setIsSwitcherOpen((v) => !v)
          setIsCreatingCR(false)
          setNewCRTitle("")
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
          activeCR
            ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-300 hover:border-indigo-500/50"
            : "bg-[#161618] border-[#2c2c30] text-[#d1d1d6] hover:border-[#3a3a3f] hover:text-white"
        }`}
      >
        {activeCR ? (
          <>
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="max-w-[160px] truncate">{activeCR.title}</span>
            <CRStatusBadge status={activeCR.status} />
          </>
        ) : (
          <>
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>Live</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950/30 text-emerald-400 border border-emerald-500/20">
              Published
            </span>
          </>
        )}
        <ChevronDown className="w-3 h-3 text-[#8e8e93] ml-0.5" />
      </button>

      {/* Switcher Dropdown overlays */}
      {isSwitcherOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-[#161618] border border-[#222225] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2.5 border-b border-[#1f1f23] flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">
              Switch workspace
            </span>
            <button
              onClick={() => setIsSwitcherOpen(false)}
              className="p-0.5 text-[#8e8e93] hover:text-white rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Published Site option (Main Branch) */}
          <button
            onClick={() => handleSelectCR(null)}
            className={`w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-[#1c1c1e] transition-colors cursor-pointer border-b border-[#1f1f23] ${
              !selectedChangeRequestId ? "bg-[#1c1c1e]" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-xs font-semibold text-white">Live</span>
              <span className="text-[10px] text-[#8e8e93]">Read-only published content</span>
            </div>
            {!selectedChangeRequestId && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto shrink-0" />}
          </button>

          {/* Change Requests branches list section */}
          {openChangeRequests.length > 0 && (
            <div className="flex flex-col">
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">
                  Change requests
                </span>
              </div>
              {openChangeRequests.map((cr) => (
                <button
                  key={cr.id}
                  onClick={() => handleSelectCR(cr.id)}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 hover:bg-[#1c1c1e] transition-colors cursor-pointer ${
                    selectedChangeRequestId === cr.id ? "bg-[#1c1c1e]" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white truncate max-w-[180px]">{cr.title}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CRStatusBadge status={cr.status} />
                    </div>
                  </div>
                  {selectedChangeRequestId === cr.id && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Switcher Footer: Add branch shortcuts */}
          <div className="border-t border-[#1f1f23]">
            {!isCreatingCR ? (
              <button
                onClick={() => setIsCreatingCR(true)}
                className="w-full px-3 py-2.5 flex items-center gap-2 text-xs font-semibold text-[#8e8e93] hover:text-white hover:bg-[#1c1c1e] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New change request</span>
              </button>
            ) : (
              <form onSubmit={handleCreateCR} className="p-3 flex flex-col gap-2.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="Describe your changes..."
                  value={newCRTitle}
                  onChange={(e) => setNewCRTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0c0c0e] border border-[#222225] rounded-lg text-xs text-white placeholder-[#4e4e54] focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsCreatingCR(false); setNewCRTitle("") }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#8e8e93] hover:text-white bg-[#1c1c1e] border border-[#2d2d30] rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newCRTitle.trim()}
                    className="px-2.5 py-1 text-[11px] font-semibold text-black bg-white hover:bg-white/90 disabled:bg-[#222225] disabled:text-[#4c4c52] rounded-lg cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

