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

export default function SpaceEditorPage() {
  const { spaceId, orgId, changeRequestId } = useParams<{
    spaceId: string
    orgId: string
    changeRequestId: string
  }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Split stores
  const { currentSpace, fetchSpace, isLoading } = useSitesStore()
  const { updatePage } = useEditorStore()
  const {
    selectedChangeRequestId,
    openChangeRequests,
    selectChangeRequest,
    fetchOpenChangeRequests,
  } = useChangeRequestStore()

  // Local UI state
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<"editor" | "preview" | "changes">("editor")
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // CR sub-tab navigation
  const [activeCRTab, setActiveCRTab] = useState<"overview" | "editor" | "changes" | "preview">("editor")

  const isDrawerOpen = window.location.pathname.includes("~/change-requests")
  const activeCR = openChangeRequests.find((cr) => cr.id === selectedChangeRequestId) ?? null
  const isEditingMode = activeCR !== null

  // ─── Effects ─────────────────────────────────────────────────────────────────

  // Load open CRs on mount or when spaceId/user changes
  useEffect(() => {
    if (spaceId && user) {
      fetchOpenChangeRequests(spaceId, user.id)
    }
  }, [spaceId, user, fetchOpenChangeRequests])

  // Refetch space when workspace context switches
  useEffect(() => {
    if (spaceId && user) {
      fetchSpace(spaceId, user.id)
    }
  }, [spaceId, user, selectedChangeRequestId, fetchSpace])

  // Select first page
  useEffect(() => {
    if (currentSpace?.pages && currentSpace.pages.length > 0) {
      if (!selectedPage || !currentSpace.pages.some((p) => p.id === selectedPage.id)) {
        setSelectedPage(currentSpace.pages[0])
      } else {
        const updated = currentSpace.pages.find((p) => p.id === selectedPage.id)
        if (updated) setSelectedPage(updated)
      }
    } else {
      setSelectedPage(null)
    }
  }, [currentSpace]) // eslint-disable-line

  // Sync edit state
  useEffect(() => {
    if (selectedPage) {
      setEditTitle(selectedPage.title)
      setEditContent(selectedPage.content)
    }
  }, [selectedPage?.id, selectedChangeRequestId]) // eslint-disable-line

  // Debounced auto-save
  useEffect(() => {
    if (!isEditingMode || !selectedPage || !user) return
    if (editTitle === selectedPage.title && editContent === selectedPage.content) return

    const timer = setTimeout(async () => {
      try {
        await updatePage(selectedPage.id, editTitle, editContent, user.id)
      } catch {
        // silent
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [editTitle, editContent, selectedPage?.id, isEditingMode, selectedChangeRequestId, user, updatePage])

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleMergeEdits = () => setIsMergeModalOpen(true)
  const handleRequestReview = () => setIsReviewModalOpen(true)

  // ─── Guards ──────────────────────────────────────────────────────────────────

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

  const siteName = currentSpace.site?.name || "Docs"
  const spaceName = currentSpace.name || "Space"

  return (
    <div className="flex-1 flex w-full h-full text-[#f5f5f7] bg-[#0c0c0e] font-sans overflow-hidden relative">
      
      {/* Change Requests Drawer */}
      {isDrawerOpen && (
        <ChangeRequestsDrawer onClose={() => navigate(`/o/${orgId}/s/${spaceId}`)} />
      )}

      {/* Editor Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Sub-header Navigation */}
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

        {/* Editor Body */}
        <div className="flex-1 flex w-full overflow-hidden">
          
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

          {/* Main canvas */}
          {changeRequestId ? (
            <ChangeRequestReviewPane />
          ) : (
            <EditorCanvas
              notification={notification}
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
