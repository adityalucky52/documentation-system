import { useState, useRef, useEffect } from "react"
import { Sparkles } from "lucide-react"
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
      {activeCR && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-indigo-950/30 border-indigo-500/30 text-indigo-300">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="max-w-[160px] truncate">{activeCR.title}</span>
          <CRStatusBadge status={activeCR.status} />
        </div>
      )}
    </div>
  )
}

