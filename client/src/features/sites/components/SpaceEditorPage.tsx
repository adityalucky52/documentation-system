import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSitesStore, type Page } from "../sitesStore"
import { useAuthStore } from "../../auth/authStore"
import { 
  GitBranch, 
  GitPullRequest,
  Search, 
  Plus, 
  ChevronRight, 
  BookOpen, 
  Eye, 
  FileText, 
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Share2
} from "lucide-react"

export default function SpaceEditorPage() {
  const { spaceId, orgId } = useParams<{ spaceId: string; orgId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    currentSpace, 
    fetchSpace, 
    createPage, 
    updatePage, 
    isLoading 
  } = useSitesStore()

  // State managers
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSubTab, setActiveSubTab] = useState<"editor" | "preview">("editor")
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [notification, setNotification] = useState<string | null>(null)

  // Fetch space details on mount or spaceId change
  useEffect(() => {
    if (spaceId && user) {
      fetchSpace(spaceId, user.id)
    }
  }, [spaceId, user, fetchSpace])

  // Select the first page by default when pages load
  useEffect(() => {
    if (currentSpace?.pages && currentSpace.pages.length > 0) {
      if (!selectedPage || !currentSpace.pages.some(p => p.id === selectedPage.id)) {
        setSelectedPage(currentSpace.pages[0])
      } else {
        // Sync selected page with store data
        const updated = currentSpace.pages.find(p => p.id === selectedPage.id)
        if (updated) setSelectedPage(updated)
      }
    } else {
      setSelectedPage(null)
    }
  }, [currentSpace, selectedPage])

  // Handle entering edit mode
  const handleStartEdit = () => {
    if (!selectedPage) return
    setEditTitle(selectedPage.title)
    setEditContent(selectedPage.content)
    setIsEditingMode(true)
  }

  // Handle saving the change request / merging edits
  const handleMergeEdits = async () => {
    if (!selectedPage || !user) return
    
    const result = await updatePage(selectedPage.id, editTitle, editContent, user.id)
    if (result) {
      setIsEditingMode(false)
      showNotification("Change request merged successfully!")
    }
  }

  // Handle creating a new page
  const handleAddNewPage = async () => {
    if (!spaceId || !user) return
    const newPage = await createPage(spaceId, "Untitled Page", user.id)
    if (newPage) {
      setSelectedPage(newPage)
      setEditTitle(newPage.title)
      setEditContent(newPage.content)
      setIsEditingMode(true)
      showNotification("New page created in draft mode.")
    }
  }

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  if (isLoading && !currentSpace) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 bg-[#0c0c0e]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-t-indigo-500 border-zinc-700 rounded-full"></div>
          <span className="text-xs">Loading space...</span>
        </div>
      </div>
    )
  }

  if (!currentSpace) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-[#0c0c0e] gap-4">
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

  // Filter pages
  const filteredPages = (currentSpace.pages || []).filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col w-full h-full text-[#f5f5f7] bg-[#0c0c0e] font-sans overflow-hidden">
      
      {/* Sub-header Navigation (Breadcrumbs & Git Sync Actions) */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-[#1f1f23] bg-[#0e0e11] shrink-0">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[#8e8e93]">
          <span className="hover:text-white cursor-pointer" onClick={() => navigate(`/o/${orgId}/home`)}>Docs sites</span>
          <span>/</span>
          <span className="text-[#818cf8] bg-[#312e81]/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide">
            {siteName[0]}
          </span>
          <span className="text-white font-medium">{siteName}</span>
          <span>/</span>
          <span className="text-[#8e8e93] font-medium">{spaceName}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#161618] border border-[#222225] rounded-lg px-2 py-1 text-[11px] text-[#8e8e93]">
            <GitBranch className="h-3 w-3 text-indigo-400" />
            <span>Git Sync</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded text-[9px] font-bold">
              Set up
            </span>
          </div>

          <button className="p-1.5 bg-[#161618] border border-[#222225] hover:border-[#323236] text-[#8e8e93] hover:text-white rounded-lg transition-colors cursor-pointer" title="Share Space">
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Main Content Panels */}
      <div className="flex-1 flex w-full overflow-hidden">
        
        {/* Inner Left Sidebar: Page List & Controls (240px wide) */}
        <div className="w-[240px] border-r border-[#1f1f23] bg-[#0c0c0e] flex flex-col justify-between shrink-0">
          <div className="flex flex-col p-4 gap-4 overflow-y-auto">
            
            {/* inner tabs: Pages & Library */}
            <div className="flex items-center gap-1 border-b border-[#1f1f23] pb-2 shrink-0">
              <button className="text-xs font-semibold text-white border-b-2 border-indigo-500 pb-1.5 px-1">
                Pages
              </button>
              <button className="text-xs font-semibold text-[#8e8e93] hover:text-white pb-1.5 px-1 cursor-pointer">
                Library
              </button>
            </div>

            {/* Find pages search bar */}
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

            {/* Pages Listing */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider px-1 mb-1">
                <span>Space Pages</span>
                <button 
                  onClick={handleAddNewPage}
                  className="p-0.5 hover:bg-[#1a1a1e] text-[#8e8e93] hover:text-white rounded transition-colors cursor-pointer"
                  title="Add new page"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {filteredPages.length === 0 ? (
                <span className="text-[11px] text-[#8e8e93] px-2 py-4 text-center border border-dashed border-[#222225] rounded-lg">
                  No pages found
                </span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {filteredPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        if (isEditingMode) {
                          if (confirm("You have unsaved draft changes. Discard drafts and switch page?")) {
                            setIsEditingMode(false)
                            setSelectedPage(page)
                          }
                        } else {
                          setSelectedPage(page)
                        }
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer w-full group ${selectedPage?.id === page.id ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${selectedPage?.id === page.id ? "text-indigo-400" : "text-[#88888e]"}`} />
                        <span className="truncate">{page.title}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-[#88888e] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Status footer for sidebar */}
          <div className="p-3 border-t border-[#1f1f23] text-[10px] text-[#8e8e93] bg-[#0e0e11] shrink-0">
            Active Space: <span className="text-white font-medium">{spaceName}</span>
          </div>
        </div>

        {/* Main Workspace Canvas (Editor or Preview) */}
        <div className="flex-1 flex flex-col bg-[#121214] overflow-hidden relative">
          
          {/* Notification banner */}
          {notification && (
            <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 transition-all border border-emerald-500 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-4 h-4" />
              <span>{notification}</span>
            </div>
          )}

          {/* Inner Navigation Tabs (Editor vs Preview) */}
          <div className="flex items-center justify-between px-8 py-2 border-b border-[#1f1f23] bg-[#0c0c0e] shrink-0">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setActiveSubTab("editor")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${activeSubTab === "editor" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button 
                onClick={() => setActiveSubTab("preview")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${activeSubTab === "preview" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Edit / Draft Toggle controls on top right */}
            {selectedPage && activeSubTab === "editor" && (
              <div className="flex items-center gap-2">
                {isEditingMode ? (
                  <>
                    <button 
                      onClick={() => setIsEditingMode(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#8e8e93] hover:text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-md transition-colors cursor-pointer"
                    >
                      Discard Draft
                    </button>
                    <button 
                      onClick={handleMergeEdits}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Merge Change Request</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleStartEdit}
                    className="px-3.5 py-1.5 text-xs font-semibold text-black bg-white hover:bg-white/90 rounded-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Canvas Pane (Switch depending on mode) */}
          <div className="flex-1 overflow-y-auto p-12 flex justify-center">
            <div className="max-w-[760px] w-full flex flex-col gap-6">
              
              {!selectedPage ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#8e8e93] gap-2">
                  <FileText className="w-12 h-12 text-[#2c2c30]" />
                  <p className="text-sm font-medium">This space has no pages yet.</p>
                  <button 
                    onClick={handleAddNewPage}
                    className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create a Page</span>
                  </button>
                </div>
              ) : activeSubTab === "preview" ? (
                /* PREVIEW RENDERING MODE */
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <h1 className="text-4xl font-bold tracking-tight text-white">{selectedPage.title}</h1>
                  <div className="border-b border-[#1f1f23] pb-4 text-xs text-[#8e8e93] flex items-center gap-4">
                    <span>Reading Mode</span>
                    <span>•</span>
                    <span>Last updated: just now</span>
                  </div>
                  <article className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4 text-sm">
                    {selectedPage.content ? (
                      selectedPage.content.split("\n").map((para, i) => {
                        if (para.startsWith("# ")) {
                          return <h2 key={i} className="text-2xl font-semibold text-white mt-6 mb-2">{para.replace("# ", "")}</h2>
                        }
                        if (para.startsWith("## ")) {
                          return <h3 key={i} className="text-xl font-semibold text-white mt-4 mb-2">{para.replace("## ", "")}</h3>
                        }
                        return <p key={i} className="mb-4">{para}</p>
                      })
                    ) : (
                      <p className="italic text-[#8e8e93]">No content written yet. Click 'Editor' tab and start editing to add content.</p>
                    )}
                  </article>
                </div>
              ) : !isEditingMode ? (
                /* READ-ONLY WORKFLOW PROMPT (Git style placeholder) */
                <div className="flex flex-col items-center justify-center py-16 px-8 border border-[#222225] bg-[#161618] rounded-xl text-center gap-6 mt-10">
                  <div className="w-12 h-12 rounded-xl bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-zinc-400">
                    <GitPullRequest className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-[400px]">
                    <h2 className="text-lg font-bold text-white tracking-tight">Create your first change request</h2>
                    <p className="text-xs text-[#8e8e93] leading-relaxed">
                      Start making changes to your pages using our Git-style workflow. Drafts are safely saved in change requests until merged.
                    </p>
                  </div>
                  <button 
                    onClick={handleStartEdit}
                    className="px-4 py-2 bg-white hover:bg-white/95 text-black rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <GitBranch className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              ) : (
                /* FULL AUTHORING EDITOR MODE */
                <div className="flex flex-col gap-6 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 bg-indigo-950/20 border border-indigo-500/20 px-3.5 py-2.5 rounded-xl">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-[11px] text-indigo-300 font-medium leading-normal">
                      You are editing in **change request draft** mode. Your edits won't affect the live site until you click <strong>Merge</strong>.
                    </span>
                  </div>

                  {/* Title Frameless input */}
                  <input 
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Page Title"
                    className="w-full bg-transparent text-4xl font-bold tracking-tight text-white placeholder-zinc-700 outline-none border-b border-transparent focus:border-zinc-800 pb-3"
                  />

                  {/* Content area */}
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Write your markdown or documentation content here... Use # for headings."
                    className="w-full h-[380px] bg-transparent text-sm text-zinc-300 placeholder-zinc-700 outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
