import { useState } from "react"
import { Search, Plus, FileText, ChevronRight } from "lucide-react"
import { useEditorStore } from "../editorStore"
import { useSitesStore, type Page } from "../../sites-management/sitesStore"
import { useAuthStore } from "../../auth/authStore"

/**
 * EditorSidebar Props.
 * @param spaceId - Unique identifier of the current active workspace. Originates in `SpaceEditorPage`.
 * @param spaceName - Name of the space. Originates in `SpaceEditorPage`.
 * @param selectedPage - Current active page object. Originates in `SpaceEditorPage`.
 * @param setSelectedPage - Callback modifier to select a page. Originates in `SpaceEditorPage`.
 * @param setEditTitle - Sets title string buffer in parent. Originates in `SpaceEditorPage`.
 * @param setEditContent - Sets content markdown buffer in parent. Originates in `SpaceEditorPage`.
 */
interface EditorSidebarProps {
  spaceId: string
  spaceName: string
  selectedPage: Page | null
  setSelectedPage: (page: Page) => void
  setEditTitle: (title: string) => void
  setEditContent: (content: string) => void
}

/**
 * EditorSidebar Component.
 *
 * Purpose:
 * Renders the page list navigation sidebar inside the editor canvas.
 * Handles page searching/filtering and triggers new page creation.
 */
export default function EditorSidebar({
  spaceId,
  spaceName,
  selectedPage,
  setSelectedPage,
  setEditTitle,
  setEditContent,
}: EditorSidebarProps) {
  const { user } = useAuthStore()
  // Retrieve pages from current active space context
  const { currentSpace } = useSitesStore()
  // Retrieve create action from editor store
  const { createPage } = useEditorStore()

  // Search input state
  const [searchQuery, setSearchQuery] = useState("")

  // Filter pages lists on query matches (case-insensitive)
  const filteredPages = (currentSpace?.pages || []).filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /**
   * Action: Triggers new page creation.
   * Invokes `createPage` action, updates focus to the new page and resets draft buffers.
   */
  const handleAddNewPage = async () => {
    if (!spaceId || !user) return
    const newPage = await createPage(spaceId, "Untitled Page", user.id)
    if (newPage) {
      setSelectedPage(newPage)
      setEditTitle(newPage.title)
      setEditContent(newPage.content)
    }
  }

  return (
    <div className="w-[240px] border-r border-[#1f1f23] bg-[#0c0c0e] flex flex-col justify-between shrink-0 h-full">
      <div className="flex flex-col p-4 gap-4 overflow-y-auto">

        {/* Inner Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#1f1f23] pb-2 shrink-0">
          <button className="text-xs font-semibold text-white border-b-2 border-indigo-500 pb-1.5 px-1">
            Pages
          </button>
          <button className="text-xs font-semibold text-[#8e8e93] hover:text-white pb-1.5 px-1 cursor-pointer">
            Library
          </button>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#88888e]" />
          <input
            type="text"
            placeholder="Find pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161618] border border-[#222225] focus:border-indigo-500/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#88888e] outline-none transition-colors"
          />
        </div>

        {/* Space Pages Navigation Tree */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider px-1 mb-1">
            <span>Space Pages</span>
            {/* Add Page button — always visible */}
            <button
              onClick={handleAddNewPage}
              className="p-0.5 hover:bg-[#1a1a1e] text-[#8e8e93] hover:text-white rounded transition-colors cursor-pointer"
              title="Add new page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conditional rendering: Shows empty state alerts vs list mapped items */}
          {filteredPages.length === 0 ? (
            <span className="text-[11px] text-[#8e8e93] px-2 py-4 text-center border border-dashed border-[#222225] rounded-lg">
              No pages found
            </span>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer w-full group ${
                    selectedPage?.id === page.id
                      ? "bg-[#1c1c1e] text-white"
                      : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText
                      className={`w-3.5 h-3.5 shrink-0 ${
                        selectedPage?.id === page.id ? "text-indigo-400" : "text-[#88888e]"
                      }`}
                    />
                    <span className="truncate">{page.title}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#88888e] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer: Space name */}
      <div className="p-3 border-t border-[#1f1f23] text-[10px] text-[#8e8e93] bg-[#0e0e11] shrink-0">
        <span>
          Space: <span className="text-white font-medium">{spaceName}</span>
        </span>
      </div>
    </div>
  )
}
