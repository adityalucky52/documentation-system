import { useNavigate } from "react-router-dom"
import { BookOpen, Eye, GitMerge, } from "lucide-react"

/**
 * EditorHeader Props.
 * @param orgId - Active organization ID from route. Originates in `SpaceEditorPage`.
 * @param spaceId - Active space ID from route. Originates in `SpaceEditorPage`.
 * @param siteName - Name of parent site. Originates in `SpaceEditorPage`.
 * @param activeTab - Currently active view tab (editor or preview). Originates in `SpaceEditorPage`.
 * @param setActiveTab - Callback to switch tabs. Originates in `SpaceEditorPage`.
 * @param handleMergeEdits - Callback launching Merge confirm modal. Originates in `SpaceEditorPage`.
 */
interface EditorHeaderProps {
  orgId: string | undefined
  spaceId: string
  siteName: string
  activeTab: "editor" | "preview"
  setActiveTab: (tab: "editor" | "preview") => void
  handleMergeEdits: () => void
  isSaving: boolean
  saveError: string | null
}

/**
 * EditorHeader Component.
 *
 * Purpose:
 * Renders the top options bar inside the editor space.
 *
 * Sub-features:
 * 1. Breadcrumbs: Navigates back to organization home and displays site details.
 * 2. Editor / Preview tabs: Switches between edit and read-only preview mode.
 * 3. Merge Button: Triggers the MergeConfirmModal to publish edits to the live site.
 */
export default function EditorHeader({
  orgId,
  siteName,
  activeTab,
  setActiveTab,
  handleMergeEdits,
  isSaving,
  saveError,
}: EditorHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#1f1f23] bg-[#0e0e11] shrink-0 gap-3 font-sans">

      {/* Left Pane: Breadcrumbs */}
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
      </div>

      {/* Center Pane: Editor / Preview tabs */}
      <div className="flex items-center gap-0.5 shrink-0">
        {([
          { id: "editor", label: "Editor", icon: <BookOpen className="w-3 h-3" /> },
          { id: "preview", label: "Preview", icon: <Eye className="w-3 h-3" /> },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${activeTab === tab.id
              ? "text-white bg-[#1c1c1e]"
              : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right Pane: Actions */}
      <div className="flex items-center gap-4 justify-end flex-1 min-w-0">
        {/* Autosave Status Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-sans select-none shrink-0">
          {isSaving ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-zinc-500 font-medium">Saving...</span>
            </>
          ) : saveError ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-rose-400 font-medium">Error saving</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse duration-1000" />
              <span className="text-zinc-500">Saved</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Merge Button */}
          <button
            onClick={handleMergeEdits}
            className="pl-3 pr-3 py-1.5 text-[11px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm whitespace-nowrap h-[28px]"
          >
            <GitMerge className="w-3.5 h-3.5 shrink-0" />
            <span>Merge</span>
          </button>
        </div>
      </div>
    </div>
  )
}
