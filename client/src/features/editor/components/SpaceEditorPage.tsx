import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../auth/authStore"
import { useSitesStore, type Page } from "../../sites-management/sitesStore"
import { useEditorStore } from "../editorStore"
import { useChangeRequestStore } from "../../change-requests/changeRequestStore"
import ChangeRequestsDrawer from "../../change-requests/components/ChangeRequestsDrawer"
import ChangeRequestReviewPane from "../../change-requests/components/ChangeRequestReviewPane"

// Subcomponents
import EditorSidebar from "./EditorSidebar"
import EditorHeader from "./EditorHeader"
import EditorCanvas from "./EditorCanvas"
import RequestReviewModal from "../../change-requests/components/RequestReviewModal"
import MergeConfirmModal from "../../change-requests/components/MergeConfirmModal"
import { ArrowLeft } from "lucide-react"

/**
 * SpaceEditorPage Component.
 * 
 * Purpose:
 * The central workspace orchestrator for document editing. It binds sidebar structures,
 * header control hubs, and main editor canvases into a Git-like branching editor layout.
 * 
 * State & Store Integrations:
 * - `useParams`: Extracts `:spaceId`, `:orgId`, and optional `:changeRequestId` (for review overlays) from the URL.
 * - `useAuthStore`: Retrieves the currently logged-in user profile.
 * - `useSitesStore`: Manages the currently selected `currentSpace` document structure.
 * - `useEditorStore`: Triggers the page content `updatePage` API action.
 * - `useChangeRequestStore`: Tracks Git-like branch selectors (`activeBranchId`), list of open change requests (`openChangeRequests`),
 *   and branch activation callbacks.
 * 
 * Git Branching Logic & Editing Modes:
 * - DocuSphere operates in two modes:
 *   1. Read-Only Mode (Main branch): When no change request branch is active. User cannot directly modify texts.
 *   2. Editing Mode (Branch mode): Triggered when an active change request is selected (`activeCR !== null`).
 *      Auto-save commits changes to that specific branch.
 * 
 * React Lifecycle Hooks (Effects):
 * 1. CR Fetch: Syncs the list of open change requests for the space.
 * 2. Space Sync: Refetches page trees when the active branch context toggles.
 * 3. Page Selection: Ensures a document is always active by default.
 * 4. State Sync: Populates the text area drafts (`editTitle`, `editContent`) when switching pages.
 * 5. Debounced Auto-save: Triggers `updatePage` API call 800ms after the user stops typing in Editing Mode.
 */
export default function SpaceEditorPage() {
  // Extract route parameters
  const { spaceId, orgId, changeRequestId } = useParams<{
    spaceId: string
    orgId: string
    changeRequestId: string
  }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Sites Store integration for space details
  const { currentSpace, fetchSpace, isLoading } = useSitesStore()
  // Editor Store integration for page updating callbacks
  const { updatePage } = useEditorStore()
  // Change Request Store integration for branching state controls
  const {
    selectedChangeRequestId,
    openChangeRequests,
    selectChangeRequest,
    fetchOpenChangeRequests,
  } = useChangeRequestStore()

  // Local UI States
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<"editor" | "preview" | "changes">("editor")
  // Buffered text drafts for input forms (updates local state immediately, auto-saves to backend after debounce)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  // Modal Dialog states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Sub-navigation tab inside the change request drawer
  const [activeCRTab, setActiveCRTab] = useState<"overview" | "editor" | "changes" | "preview">("editor")

  // Derived: Is the Git Change Request drawer open?
  const isDrawerOpen = window.location.pathname.includes("~/change-requests")
  // Derived: Active change request branch object
  const activeCR = openChangeRequests.find((cr) => cr.id === selectedChangeRequestId) ?? null
  // Derived: Editing mode flag
  const isEditingMode = activeCR !== null

  // Effect 1: Fetch list of open change requests on component mount or context changes
  useEffect(() => {
    if (spaceId && user) {
      fetchOpenChangeRequests(spaceId, user.id)
    }
  }, [spaceId, user, fetchOpenChangeRequests])

  // Effect 2: Refetch space page trees when spaceId, user, or active branch selector changes
  useEffect(() => {
    if (spaceId && user) {
      fetchSpace(spaceId, user.id)
    }
  }, [spaceId, user, selectedChangeRequestId, fetchSpace])

  // Effect 3: Automatically select the first page of a space when space data first loads
  useEffect(() => {
    if (currentSpace?.pages && currentSpace.pages.length > 0) {
      if (!selectedPage || !currentSpace.pages.some((p) => p.id === selectedPage.id)) {
        setSelectedPage(currentSpace.pages[0])
      } else {
        // Sync updated content of currently selected page
        const updated = currentSpace.pages.find((p) => p.id === selectedPage.id)
        if (updated) setSelectedPage(updated)
      }
    } else {
      setSelectedPage(null)
    }
  }, [currentSpace]) // eslint-disable-line

  // Effect 4: Reset draft values in form controls when the active page or branch toggles
  useEffect(() => {
    if (selectedPage) {
      setEditTitle(selectedPage.title)
      setEditContent(selectedPage.content)
    }
  }, [selectedPage?.id, selectedChangeRequestId]) // eslint-disable-line

  // Effect 5: Debounced Auto-save. Fires updatePage API requests 800ms after user pauses typing.
  useEffect(() => {
    if (!isEditingMode || !selectedPage || !user) return
    // Skip if drafts match already committed version
    if (editTitle === selectedPage.title && editContent === selectedPage.content) return

    const timer = setTimeout(async () => {
      try {
        await updatePage(selectedPage.id, editTitle, editContent, user.id)
      } catch {
        // Silently catch auto-save errors to avoid interrupting the writer's flow
      }
    }, 800)

    // Clear timeout on draft changes to reset the debounce timer
    return () => clearTimeout(timer)
  }, [editTitle, editContent, selectedPage?.id, isEditingMode, selectedChangeRequestId, user, updatePage])

  /**
   * Action: Renders temporary status alerts in the editor canvas.
   */
  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleMergeEdits = () => setIsMergeModalOpen(true)
  const handleRequestReview = () => setIsReviewModalOpen(true)

  // Loading Boundary state
  if (isLoading && !currentSpace) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 bg-[#0c0c0e]">
        <div className="flex flex-col items-center gap-2 font-sans">
          <div className="animate-spin w-6 h-6 border-2 border-t-indigo-500 border-zinc-700 rounded-full" />
          <span className="text-xs">Loading space...</span>
        </div>
      </div>
    )
  }

  // Not Found Boundary state
  if (!currentSpace) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-[#0c0c0e] gap-4 font-sans">
        <span>Space not found</span>
        <button
          onClick={() => navigate(`/o/${orgId}/home`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161618] border border-[#222225] text-white rounded-lg text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>
    )
  }

  // Resolve headers information
  const siteName = currentSpace.site?.name || "Docs"
  const spaceName = currentSpace.name || "Space"

  return (
    <div className="flex-1 flex w-full h-full text-[#f5f5f7] bg-[#0c0c0e] font-sans overflow-hidden relative">

      {/* Change Requests Drawer Overlay: Slides in from the left to manage Git branches */}
      {isDrawerOpen && (
        <ChangeRequestsDrawer onClose={() => navigate(`/o/${orgId}/s/${spaceId}`)} />
      )}

      {/* Editor Main Core Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Sub-header Navigation Panel (Tab selectors and merge call-to-actions) */}
        <EditorHeader
          orgId={orgId}
          spaceId={spaceId!}
          siteName={siteName}
          spaceName={spaceName}
          isDrawerOpen={isDrawerOpen}
          isEditingMode={isEditingMode}
          activeCR={activeCR}
          activeCRTab={activeCRTab}
          setActiveCRTab={setActiveCRTab}
          activeSubTab={activeSubTab as "editor" | "preview"}
          setActiveSubTab={(t) => setActiveSubTab(t)}
          selectChangeRequest={selectChangeRequest}
          handleMergeEdits={handleMergeEdits}
          handleRequestReview={handleRequestReview}
          showNotification={showNotification}
        />

        {/* Editor Layout Sidebar & Main Workspace Body */}
        <div className="flex-1 flex w-full overflow-hidden">

          {/* Sidebar Component: Page Navigation Lists, Add Page Triggers */}
          <EditorSidebar
            spaceId={spaceId!}
            spaceName={spaceName}
            isEditingMode={isEditingMode}
            activeCRTitle={activeCR?.title}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            setEditTitle={setEditTitle}
            setEditContent={setEditContent}
            showNotification={showNotification}
          />

          {/* 
            Main Document Canvas:
            - If we are reviewing an open Change Request: Renders the ChangeRequestReviewPane.
            - If we are editing/viewing standard pages: Renders the EditorCanvas.
          */}
          {changeRequestId ? (
            <ChangeRequestReviewPane />
          ) : (
            <EditorCanvas
              selectedPage={selectedPage}
              activeSubTab={activeSubTab as "editor" | "preview"}
              isEditingMode={isEditingMode}
              activeCR={activeCR}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editContent={editContent}
              setEditContent={setEditContent}

            />
          )}
        </div>
      </div>

      {/* Modal overlays */}
      <MergeConfirmModal
        spaceId={spaceId!}
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        selectedPage={selectedPage}
        editTitle={editTitle}
        editContent={editContent}
      />

      <RequestReviewModal
        spaceId={spaceId!}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        showNotification={showNotification}
      />
    </div>
  )
}

