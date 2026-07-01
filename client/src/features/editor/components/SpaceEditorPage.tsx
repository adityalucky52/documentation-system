import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../auth/authStore"
import { useSitesStore, type Page } from "../../sites-management/sitesStore"
import { useEditorStore } from "../editorStore"

// Subcomponents
import EditorSidebar from "./EditorSidebar"
import EditorHeader from "./EditorHeader"
import EditorCanvas from "./EditorCanvas"
import MergeConfirmModal from "./MergeConfirmModal"
import { ArrowLeft } from "lucide-react"

/**
 * SpaceEditorPage Component.
 *
 * Purpose:
 * The central workspace orchestrator for document editing. Binds sidebar,
 * header, and editor canvas. Always in editing mode — changes auto-save and
 * are published via the Merge action.
 *
 * State & Store Integrations:
 * - `useParams`: Extracts `:spaceId` and `:orgId` from the URL.
 * - `useAuthStore`: Retrieves the currently logged-in user profile.
 * - `useSitesStore`: Manages the currently selected `currentSpace` document structure.
 * - `useEditorStore`: Triggers the page content `updatePage` API action.
 *
 * React Lifecycle Hooks (Effects):
 * 1. Space Sync: Fetches space page tree on mount.
 * 2. Page Selection: Ensures a document is always active by default.
 * 3. State Sync: Populates draft buffers when switching pages.
 * 4. Debounced Auto-save: Triggers `updatePage` API call 800ms after typing stops.
 */
export default function SpaceEditorPage() {
  // Extract route parameters
  const { spaceId, orgId } = useParams<{
    spaceId: string
    orgId: string
  }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Sites Store integration for space details
  const { currentSpace, fetchSpace, isLoading } = useSitesStore()
  // Editor Store integration for page updating callbacks
  const { updatePage, isLoading: isSaving, error: saveError } = useEditorStore()

  // Local UI States
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  // Active view tab: editor (editable) or preview (read-only rendered)
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  // Buffered text drafts for input forms (updates local state immediately, auto-saves to backend after debounce)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState<string | null>(null)

  // Modal Dialog states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)

  // Effect 1: Fetch space page tree on mount, spaceId/user change, or activeTab switch
  useEffect(() => {
    if (spaceId && user) {
      const branchId = activeTab === "preview" ? `${spaceId}-main` : `${spaceId}-draft`
      fetchSpace(spaceId, user.id, branchId)
    }
  }, [spaceId, user, activeTab, fetchSpace])

  // Effect 2: Automatically select the first page of a space when space data first loads
  useEffect(() => {
    if (currentSpace?.pages && currentSpace.pages.length > 0) {
      if (!selectedPage || !currentSpace.pages.some((p) => p.id === selectedPage.id)) {
        setEditContent(null) // Unmount editor while loading initial page
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

  // Keep refs of latest values for use in fire-and-forget unmount cleanup and window event listeners
  const stateRef = useRef({ selectedPage, editTitle, editContent, user })
  useEffect(() => {
    stateRef.current = { selectedPage, editTitle, editContent, user }
  }, [selectedPage, editTitle, editContent, user])

  // Wrap setActiveTab to clean up content state and prevent stale content flashes
  const handleTabChange = (tab: "editor" | "preview") => {
    setEditContent(null)
    setActiveTab(tab)
  }

  // Custom page selection wrapper to immediately save pending draft edits before switching
  const handleSelectPage = async (page: Page) => {
    if (selectedPage && editContent !== null && (editTitle !== selectedPage.title || editContent !== selectedPage.content)) {
      try {
        await updatePage(selectedPage.id, editTitle, editContent, user?.id || "")
      } catch (err) {
        console.error("Failed to save changes before page switch", err)
      }
    }
    // Only reset content buffer if switching to a DIFFERENT page!
    if (!selectedPage || selectedPage.id !== page.id) {
      setEditContent(null)
    }
    setSelectedPage(page)
  }

  // SPA navigation unmount handler to flush pending edits in background
  useEffect(() => {
    return () => {
      const { selectedPage: page, editTitle: title, editContent: content, user: u } = stateRef.current
      if (page && u && content !== null && (title !== page.title || content !== page.content)) {
        updatePage(page.id, title, content, u.id).catch((err) => {
          console.error("Unmount auto-save failed:", err)
        })
      }
    }
  }, [updatePage])

  // Window unload / tab reload event handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { selectedPage: page, editTitle: title, editContent: content } = stateRef.current
      if (page && content !== null && (title !== page.title || content !== page.content)) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // Effect 3: Reset draft values in form controls when active page changes,
  // but prevent overwriting user input during active editing sessions.
  useEffect(() => {
    if (selectedPage) {
      if (activeTab === "preview" || editContent === null) {
        setEditTitle(selectedPage.title)
        setEditContent(selectedPage.content ?? "")
      }
    }
  }, [selectedPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 4: Debounced Auto-save. Fires updatePage API requests 800ms after user pauses typing.
  useEffect(() => {
    if (!selectedPage || !user || editContent === null) return
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
  }, [editTitle, editContent, selectedPage?.id, user, updatePage])

  const handleMergeEdits = () => setIsMergeModalOpen(true)

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

  // Resolve header information
  const siteName = currentSpace.site?.name || "Docs"
  const spaceName = currentSpace.name || "Space"

  return (
    <div className="flex-1 flex w-full h-full text-[#f5f5f7] bg-[#0c0c0e] font-sans overflow-hidden relative">

      {/* Editor Main Core Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Sub-header Navigation Panel */}
        <EditorHeader
          orgId={orgId}
          spaceId={spaceId!}
          siteName={siteName}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          handleMergeEdits={handleMergeEdits}
          isSaving={isSaving}
          saveError={saveError}
        />

        {/* Editor Layout: Sidebar & Main Workspace Body */}
        <div className="flex-1 flex w-full overflow-hidden">

          {/* Sidebar Component: Page Navigation Lists, Add Page Triggers */}
          <EditorSidebar
            spaceId={spaceId!}
            spaceName={spaceName}
            selectedPage={selectedPage}
            setSelectedPage={handleSelectPage}
            setEditTitle={setEditTitle}
            setEditContent={setEditContent}
          />

          {/* Main Document Canvas */}
          <EditorCanvas
            selectedPage={selectedPage}
            activeTab={activeTab}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editContent={editContent}
            setEditContent={setEditContent}
          />
        </div>
      </div>

      {/* Merge Modal overlay */}
      <MergeConfirmModal
        spaceId={spaceId!}
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        selectedPage={selectedPage}
        editTitle={editTitle}
        editContent={editContent ?? ""}
        activeTab={activeTab}
      />
    </div>
  )
}
