import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FileText, ChevronRight, BookOpen, Sun, Moon } from "lucide-react"
import { parseMarkdownToHtml } from "../../utils/markdownParser"
import { type Page } from "../sites-management/sitesStore"

/**
 * PublicSpaceReaderPage Component.
 *
 * Purpose:
 * Renders a clean, read-only, premium documentation viewer for external users.
 * Fetches only published pages from the unauthenticated public API endpoint.
 */
export default function PublicSpaceReaderPage() {
  const { spaceId } = useParams<{ spaceId: string }>()
  const navigate = useNavigate()

  // State buffers
  const [spaceName, setSpaceName] = useState<string>("")
  const [siteName, setSiteName] = useState<string>("")
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Theme support
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"))

  useEffect(() => {
    // Keep local theme state in sync with DOM changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    
    // Initial theme check
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDark(false)
    }

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  // Fetch published documentation
  useEffect(() => {
    if (!spaceId) return

    const fetchPublishedDocs = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:5001/api/public/spaces/${spaceId}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch published documentation")
        }

        setSpaceName(data.name || "Space")
        setSiteName(data.site?.name || "Docs")
        
        const spacePages = data.pages || []
        setPages(spacePages)
        
        // Default to select first page if available
        if (spacePages.length > 0) {
          setSelectedPage(spacePages[0])
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while loading pages.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublishedDocs()
  }, [spaceId])

  // Loading view
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen text-muted-foreground bg-background transition-colors">
        <div className="flex flex-col items-center gap-2 font-sans">
          <div className="animate-spin w-6 h-6 border-2 border-t-indigo-500 border-zinc-700 rounded-full" />
          <span className="text-xs">Loading documentation...</span>
        </div>
      </div>
    )
  }

  // Error boundary view
  if (error || !spaceId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-muted-foreground bg-background gap-4 font-sans transition-colors">
        <span className="text-sm font-semibold">{error || "Invalid space ID"}</span>
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1.5 bg-card border border-border text-foreground rounded-lg text-xs hover:bg-accent/40 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen text-foreground bg-background font-sans overflow-hidden transition-colors">
      
      {/* Premium Header */}
      <header className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-card shrink-0 gap-3 transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold min-w-0 flex-1 overflow-hidden select-none">
          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[120px]">{siteName}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground font-normal truncate">{spaceName}</span>
          <span className="ml-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Live
          </span>
        </div>

        {/* Right side options: Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-lg cursor-pointer transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </header>

      {/* Main Core layout */}
      <div className="flex-1 flex w-full overflow-hidden">
        
        {/* Left Sidebar: Pages List */}
        <div className="w-[240px] border-r border-sidebar-border bg-sidebar flex flex-col justify-between shrink-0 h-full transition-colors">
          <div className="flex flex-col p-4 gap-4 overflow-y-auto">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider px-1 mb-1 select-none">
                Table of Contents
              </div>

              {pages.length === 0 ? (
                <span className="text-[11px] text-sidebar-foreground/50 px-2 py-4 text-center border border-dashed border-sidebar-border rounded-lg">
                  No pages published
                </span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer w-full group ${
                        selectedPage?.id === page.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            selectedPage?.id === page.id ? "text-indigo-400" : "text-sidebar-foreground/40"
                          }`}
                        />
                        <span className="truncate">{page.title}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-sidebar-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer branding */}
          <div className="p-3 border-t border-sidebar-border text-[9px] text-sidebar-foreground/40 bg-sidebar shrink-0 transition-colors flex items-center justify-between select-none">
            <span>Powered by DocuSphere</span>
          </div>
        </div>

        {/* Center Canvas: Article Reader */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden relative transition-colors">
          <div className="flex-1 overflow-y-auto p-12 flex justify-center">
            <div className="max-w-[760px] w-full flex flex-col gap-6">
              
              {!selectedPage ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <BookOpen className="w-12 h-12 text-muted/30" />
                  <p className="text-sm font-medium">This space has no published content.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">{selectedPage.title}</h1>
                  <div className="border-b border-border pb-4" />
                  
                  {selectedPage.content ? (
                    <article
                      className="prose max-w-none leading-relaxed space-y-4 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdownToHtml(selectedPage.content),
                      }}
                    />
                  ) : (
                    <p className="italic text-muted-foreground text-sm">No content published on this page.</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
