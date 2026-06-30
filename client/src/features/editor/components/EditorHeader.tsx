import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  GitPullRequest,
  BookOpen,
  Eye,
  ChevronDown,
  Check,
  GitMerge,
  Settings2,
  LayoutList,
  Share2,
} from "lucide-react"
import ChangeRequestSwitcherComponent from "../../change-requests/components/ChangeRequestSwitcher"

/**
 * EditorHeader Props.
 * @param orgId - Active organization ID from route. Originates in `SpaceEditorPage`.
 * @param spaceId - Active space ID from route. Originates in `SpaceEditorPage`.
 * @param siteName - Name of parent site. Originates in `SpaceEditorPage`.
 * @param spaceName - Name of current space. Originates in `SpaceEditorPage`.
 * @param isDrawerOpen - Drawer status boolean. Originates in `SpaceEditorPage`.
 * @param isEditingMode - True if edit branch is active. Originates in `SpaceEditorPage`.
 * @param activeCR - Active change request object metadata. Originates in `SpaceEditorPage`.
 * @param activeCRTab - Active workspace sub-tab. Originates in `SpaceEditorPage`.
 * @param setActiveCRTab - Workspace tab setter callback. Originates in `SpaceEditorPage`.
 * @param activeSubTab - Main editor canvas active tab. Originates in `SpaceEditorPage`.
 * @param setActiveSubTab - Canvas editor tab setter callback. Originates in `SpaceEditorPage`.
 * @param selectChangeRequest - Setter callback to toggle branches. Originates in `SpaceEditorPage`.
 * @param handleMergeEdits - Callback launching Merge confirm modal. Originates in `SpaceEditorPage`.
 * @param handleRequestReview - Callback launching Review request modal. Originates in `SpaceEditorPage`.
 */
interface EditorHeaderProps {
  orgId: string | undefined
  spaceId: string
  siteName: string
  spaceName: string
  isDrawerOpen: boolean
  isEditingMode: boolean
  activeCR: any
  activeCRTab: "overview" | "editor" | "changes" | "preview"
  setActiveCRTab: (tab: "overview" | "editor" | "changes" | "preview") => void
  activeSubTab: "editor" | "preview"
  setActiveSubTab: (tab: "editor" | "preview") => void
  selectChangeRequest: (crId: string | null) => void
  handleMergeEdits: () => void
  handleRequestReview: () => void
  showNotification: (msg: string) => void
}

/**
 * EditorHeader Component.
 * 
 * Purpose:
 * Renders the top options bar inside the editor space.
 * 
 * Sub-features:
 * 1. Breadcrumbs: Navigates back to organization home, displays site & space details,
 *    and embeds the ChangeRequestSwitcher drop-down.
 * 2. Workspace Tabs: Controls sub-views (Overview description, Rich Text Editor, Changes lists, Preview outputs).
 * 3. Action Split Button: Dynamically toggles action defaults ("Merge" vs "Request review") depending on the change request's status.
 */
export default function EditorHeader({
  orgId,
  spaceId,
  siteName,
  spaceName,
  activeCR,
  activeCRTab,
  setActiveCRTab,
  setActiveSubTab,
  selectChangeRequest,
  handleMergeEdits,
  handleRequestReview,
  showNotification,
}: EditorHeaderProps) {
  const navigate = useNavigate()
  // Local toggle for Git action split dropdown menu
  const [isMergeDropdownOpen, setIsMergeDropdownOpen] = useState(false)
  // Tracks primary action displayed on split button
  const [selectedAction, setSelectedAction] = useState<"merge" | "review">("merge")
  // Ref link targeting action dropdown container (used to capture outside click releases)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Effect 1: Initialize and synchronize Git action default values depending on active Change Request status (Draft -> Review, Else -> Merge)
  useEffect(() => {
    if (activeCR) {
      setSelectedAction(activeCR.status === "DRAFT" ? "review" : "merge")
    }
  }, [activeCR?.id, activeCR?.status])

  // Effect 2: Setup event listener to dismiss dropdown menus when user clicks outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMergeDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    // Clean up event listener subscriptions on component unmount
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#1f1f23] bg-[#0e0e11] shrink-0 gap-3 font-sans">

      {/* Left Pane: Breadcrumbs path & Change request switcher */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8e8e93] min-w-0 flex-1 overflow-hidden">
        <span
          className="hover:text-white cursor-pointer whitespace-nowrap shrink-0"
          onClick={() => navigate(`/o/${orgId}/home`)}
        >
          Docs sites
        </span>
        <span className="shrink-0">/</span>
        <span className="text-[#818cf8] bg-[#312e81]/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide shrink-0">
          {siteName[0]}
        </span>
        <span className="text-white font-medium truncate max-w-[100px] shrink">{siteName}</span>
        <span className="shrink-0">/</span>

        {/* Interactive Git change request branch switcher dropdown component */}
        <ChangeRequestSwitcherComponent spaceId={spaceId} showNotification={showNotification} />
      </div>

      {/* Center Pane: Workspace sub-tabs controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        {([
          { id: "overview", label: "Overview", icon: <LayoutList className="w-3 h-3" /> },
          { id: "editor", label: "Editor", icon: <BookOpen className="w-3 h-3" /> },
          { id: "changes", label: "Changes", icon: <GitMerge className="w-3 h-3" /> },
          { id: "preview", label: "Preview", icon: <Eye className="w-3 h-3" /> },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCRTab(tab.id)
              // Synchronize main editor sub-tabs when selecting header tabs
              if (tab.id === "editor" || tab.id === "overview") setActiveSubTab("editor")
              if (tab.id === "preview") setActiveSubTab("preview")
            }}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${activeCRTab === tab.id
                ? "text-white bg-[#1c1c1e]"
                : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right Pane: Secondary Actions panel (Exit branch, activity tools, merge triggers) */}
      <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          {/* Git split button logic */}
          <div className="relative flex items-center" ref={dropdownRef}>
            {selectedAction === "review" ? (
              <>
                <button
                  onClick={handleRequestReview}
                  className="pl-3 pr-2 py-1.5 text-[11px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-l-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border-r border-[#7c3aed] whitespace-nowrap h-[28px]"
                >
                  <GitPullRequest className="w-3.5 h-3.5 shrink-0" />
                  <span>Request a review</span>
                </button>
                <button
                  onClick={() => setIsMergeDropdownOpen(!isMergeDropdownOpen)}
                  className="px-2 py-1.5 text-[11px] font-bold rounded-r-lg flex items-center transition-all cursor-pointer shadow-sm h-[28px] bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-l border-[#7c3aed]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleMergeEdits}
                  className="pl-3 pr-2 py-1.5 text-[11px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-l-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border-r border-[#7c3aed] whitespace-nowrap h-[28px]"
                >
                  <GitMerge className="w-3.5 h-3.5 shrink-0" />
                  <span>Merge</span>
                </button>
                <button
                  onClick={() => setIsMergeDropdownOpen(!isMergeDropdownOpen)}
                  className="px-2 py-1.5 text-[11px] font-bold rounded-r-lg flex items-center transition-all cursor-pointer shadow-sm h-[28px] bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-l border-[#7c3aed]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Split Dropdown overlay */}
            {isMergeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#1c1c1e] border border-[#2c2c30] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { setIsMergeDropdownOpen(false); setSelectedAction("merge") }}
                  className="w-full px-4 py-3 hover:bg-[#272729] text-left flex items-start gap-3 cursor-pointer transition-colors group"
                >
                  <GitMerge className="w-4 h-4 text-[#8e8e93] group-hover:text-white mt-0.5 shrink-0 transition-colors" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white leading-snug">Merge</span>
                    <span className="text-[11px] text-[#8e8e93] font-normal leading-relaxed mt-0.5">
                      Instantly merge your changes.
                    </span>
                  </div>
                  {selectedAction === "merge" && (
                    <Check className="w-4 h-4 text-[#8b5cf6] mt-0.5 shrink-0" />
                  )}
                </button>

                <div className="h-px bg-[#2c2c30] mx-2" />

                <button
                  onClick={() => { setIsMergeDropdownOpen(false); setSelectedAction("review") }}
                  className="w-full px-4 py-3 hover:bg-[#272729] text-left flex items-start gap-3 cursor-pointer transition-colors group"
                >
                  <GitPullRequest className="w-4 h-4 text-[#8e8e93] group-hover:text-white mt-0.5 shrink-0 transition-colors" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white leading-snug">Request a review</span>
                    <span className="text-[11px] text-[#8e8e93] font-normal leading-relaxed mt-0.5">
                      Notify and allow others to review before merging
                    </span>
                  </div>
                  {selectedAction === "review" && (
                    <Check className="w-4 h-4 text-[#8b5cf6] mt-0.5 shrink-0" />
                  )}
                </button>

                <div className="h-px bg-[#2c2c30] mx-2" />

                <button
                  onClick={() => { setIsMergeDropdownOpen(false); showNotification("Configure merge rules coming soon!") }}
                  className="w-full px-4 py-3 hover:bg-[#272729] text-left flex items-start gap-3 cursor-pointer transition-colors group"
                >
                  <Settings2 className="w-4 h-4 text-[#8e8e93] group-hover:text-white mt-0.5 shrink-0 transition-colors" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white leading-snug">Configure merge rules</span>
                    <span className="text-[11px] text-[#8e8e93] font-normal leading-relaxed mt-0.5">
                      Define the rules for merging change requests
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            className="p-1.5 bg-[#161618] border border-[#222225] hover:border-[#323236] text-[#8e8e93] hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Share Space"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
