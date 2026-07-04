import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FileText, BookOpen, Sun, Moon, Search, Plus, Edit, Eye, Check, Loader2 } from "lucide-react"
import { parseMarkdownToHtml, parseHtmlToMarkdown, stripHeader, prependHeader } from "../../utils/markdownParser"
import { useAuthStore } from "../auth/authStore"
import { useSitesStore, type Page } from "../sites-management/sitesStore"
import { useEditorStore } from "../editor/editorStore"
import RichTextEditor from "../editor/components/RichTextEditor/RichTextEditor"
import "../public/public-reader.css"

/**
 * EditableSpaceReaderPage Component.
 * 
 * Purpose:
 * Renders the premium 3-column public reader layout, but with full inline-editing capabilities.
 * Allows authors to edit pages directly in the public layout context.
 */
export default function EditableSpaceReaderPage() {
  const { spaceId, orgId } = useParams<{ spaceId: string; orgId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Sites Store integration for space details
  const { currentSpace, fetchSpace, isLoading: isSpaceLoading } = useSitesStore()
  // Editor Store integration for page updating callbacks
  const { updatePage, createPage, isLoading: isSaving, error: saveError } = useEditorStore()

  // Local UI States
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [inPageHeadings, setInPageHeadings] = useState<Array<{ id: string; text: string; level: string }>>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string>("")
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"))

  // Draft buffers for inputs
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState<string | null>(null)

  // Sync space on mount / changes
  useEffect(() => {
    if (spaceId && user) {
      // Load the draft version of the pages for editing
      fetchSpace(spaceId, user.id, `${spaceId}-draft`)
    }
  }, [spaceId, user, fetchSpace])

  // Select first page by default
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
  }, [currentSpace]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset buffers on page switch
  useEffect(() => {
    if (selectedPage) {
      setEditTitle(selectedPage.title)
      const stripped = stripHeader(selectedPage.content ?? "", selectedPage.title)
      setEditContent(parseMarkdownToHtml(stripped))
    }
  }, [selectedPage])

  // Refs for tracking unmount saving
  const stateRef = useRef({ selectedPage, editTitle, editContent, user })
  useEffect(() => {
    stateRef.current = { selectedPage, editTitle, editContent, user }
  }, [selectedPage, editTitle, editContent, user])

  // Save edits before switching pages
  const handleSelectPage = async (page: Page) => {
    const { selectedPage: activePage, editTitle: title, editContent: content, user: u } = stateRef.current
    if (activePage && content !== null && u && (title !== activePage.title || content !== parseMarkdownToHtml(stripHeader(activePage.content ?? "", activePage.title)))) {
      try {
        const markdown = prependHeader(parseHtmlToMarkdown(content), title)
        await updatePage(activePage.id, title, markdown, u.id)
      } catch (err) {
        console.error("Failed to save changes before page switch", err)
      }
    }
    setSelectedPage(page)
  }

  // Debounced Auto-save hook
  useEffect(() => {
    if (!selectedPage || !user || editContent === null || !isEditing) return

    const htmlContent = editContent
    const isTitleChanged = editTitle !== selectedPage.title
    const isContentChanged = htmlContent !== parseMarkdownToHtml(stripHeader(selectedPage.content ?? "", selectedPage.title))
    if (!isTitleChanged && !isContentChanged) return

    const timer = setTimeout(async () => {
      try {
        const markdown = prependHeader(parseHtmlToMarkdown(htmlContent), editTitle)
        await updatePage(selectedPage.id, editTitle, markdown, user.id)
      } catch (err) {
        console.error("Auto-save failed", err)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [editTitle, editContent, selectedPage?.id, user, updatePage, isEditing])

  // Extract outline headings for the right sidebar (only in preview/read-only mode)
  useEffect(() => {
    if (!selectedPage || isSpaceLoading || isEditing) {
      setInPageHeadings([])
      return
    }

    const timer = setTimeout(() => {
      const articleEl = document.getElementById("docs-content-body")
      if (!articleEl) return

      const headingElements = articleEl.querySelectorAll("h2, h3")
      const parsedHeadings = Array.from(headingElements).map((el, index) => {
        const text = el.textContent || ""
        const id = el.id || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `heading-${index}`
        el.id = id
        return { id, text, level: el.tagName.toLowerCase() }
      })

      setInPageHeadings(parsedHeadings)
      if (parsedHeadings.length > 0) {
        setActiveHeadingId(parsedHeadings[0].id)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [selectedPage, isSpaceLoading, isEditing])

  // IntersectionObserver for tracking active scroll outline headings
  useEffect(() => {
    if (inPageHeadings.length === 0) return

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -60% 0px",
      threshold: 0
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHeadingId(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    inPageHeadings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [inPageHeadings])

  // Theme support toggle listener
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
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

  // Action: Add new blank page inside active space
  const handleAddNewPage = async () => {
    if (!spaceId || !user) return
    const newPage = await createPage(spaceId, "Untitled Page", user.id)
    if (newPage) {
      setSelectedPage(newPage)
      setEditTitle(newPage.title)
      setEditContent(newPage.content)
      setIsEditing(true) // Open immediately in edit mode
    }
  }

  if (isSpaceLoading && !currentSpace) {
    return (
      <div className="flex items-center justify-center h-screen w-screen text-muted-foreground bg-background transition-colors">
        <div className="flex flex-col items-center gap-2 font-sans">
          <div className="animate-spin w-6 h-6 border-2 border-t-emerald-500 border-zinc-700 rounded-full" />
          <span className="text-xs">Loading space...</span>
        </div>
      </div>
    )
  }

  const siteName = currentSpace?.site?.name || "Docs"
  const spaceName = currentSpace?.name || "Space"
  const pages = currentSpace?.pages || []

  return (
    <div className="docs-container font-sans text-[#f5f5f7] bg-[#0c0c0e]">
      {/* Header bar */}
      <header className="docs-header select-none">
        <div className="flex items-center gap-2 text-xs font-bold min-w-0">
          <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[var(--docs-text-heading)] truncate max-w-[120px]">{siteName}</span>
          <span className="text-[var(--docs-text-muted)] font-normal">/</span>
          <span className="text-[var(--docs-text-muted)] font-normal truncate">{spaceName}</span>
          <span className="ml-2 text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Edit Mode
          </span>
        </div>

        {/* Sync / Saving indicators */}
        <div className="flex items-center gap-2 text-xs text-[#8e8e93]">
          {isSaving ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>All changes saved</span>
            </div>
          )}
        </div>

        {/* Action icons & theme */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161618] border border-[#222225] text-white rounded-lg text-xs cursor-pointer hover:border-[#323236] transition-colors"
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                <span>View Preview</span>
              </>
            ) : (
              <>
                <Edit className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Document</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-[var(--docs-border)]"></div>

          <button
            onClick={toggleTheme}
            className="p-1.5 text-[var(--docs-text-muted)] hover:text-[var(--docs-text-heading)] rounded-lg cursor-pointer transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="docs-main-layout">
        {/* Left Column Sidebar */}
        <aside className="docs-left-sidebar py-6 px-4 shrink-0 flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4">
            <div className="toc-heading flex items-center justify-between">
              <span>Table of Contents</span>
              {/* Add page trigger inside sidebar */}
              {isEditing && (
                <button
                  onClick={handleAddNewPage}
                  className="p-1 text-[#8e8e93] hover:text-emerald-500 rounded-md hover:bg-[#222225] transition-colors"
                  title="Add new page"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  className={`toc-link ${selectedPage?.id === page.id ? "active" : ""}`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{page.title}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto pt-4 border-t border-[var(--docs-border)] px-2 flex items-center gap-2 select-none">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-[var(--docs-text-muted)] uppercase tracking-wider">All Systems Operational</span>
          </div>
        </aside>

        {/* Center reading article area */}
        <main className={`flex-1 overflow-y-auto px-6 md:px-12 py-10 flex justify-center transition-colors duration-200 ${
          isDark ? "bg-[#0c0c0e] text-[#f5f5f7]" : "bg-[#f9f9fb] text-[#1f2329]"
        }`}>
          <div className="max-w-[760px] w-full">
            {selectedPage ? (
              <div className="flex flex-col animate-in fade-in duration-200">
                {isEditing ? (
                  // Edit Mode: Same layout structure but with input fields active
                  <div className={`p-8 md:p-12 border rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${
                    isDark ? "bg-[#161618] border-[#222225]" : "bg-white border-[#e1e4e8]"
                  }`}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Page Title"
                      className={`w-full bg-transparent text-4xl font-bold tracking-tight outline-none border-b border-transparent focus:border-zinc-800 pb-3 mb-6 ${
                        isDark ? "text-white placeholder-zinc-700" : "text-zinc-900 placeholder-zinc-400"
                      }`}
                    />

                    {editContent !== null && (
                      <RichTextEditor
                        content={editContent}
                        onChange={setEditContent}
                        readOnly={false}
                      />
                    )}
                  </div>
                ) : (
                  // Preview Mode: High-fidelity GitBook browser mockup frame
                  <div className={`w-full border rounded-xl overflow-hidden shadow-xs transition-all duration-200 ${
                    isDark ? "bg-[#161618] border-[#222225]" : "bg-white border-[#e1e4e8]"
                  }`}>
                    {/* Simulated browser header */}
                    <div className={`px-6 py-3 border-b flex items-center justify-between text-xs select-none ${
                      isDark ? "bg-[#0c0c0e] border-[#222225]" : "bg-[#f6f8fa] border-[#e1e4e8]"
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-white text-[10px]">H</div>
                        <span className={isDark ? "text-white" : "text-zinc-800"}>{siteName}</span>
                      </div>
                      
                      {/* Search box placeholder */}
                      <div className={`hidden sm:flex items-center gap-2 border px-2.5 py-1.5 rounded-md text-[10px] w-48 ${
                        isDark ? "bg-[#161618] border-[#222225] text-zinc-500" : "bg-white border-[#e1e4e8] text-zinc-400"
                      }`}>
                        <span>Search...</span>
                      </div>
                      
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                        isDark ? "bg-[#222225] text-white hover:bg-[#2c2c30]" : "bg-white border border-[#e1e4e8] text-zinc-700 hover:bg-[#f6f8fa]"
                      }`}>
                        Ask
                      </div>
                    </div>
                    
                    {/* Simulated sub navbar */}
                    <div className={`px-6 py-2.5 border-b flex items-center gap-6 text-[11px] font-semibold select-none ${
                      isDark ? "bg-[#161618] border-[#222225] text-zinc-500" : "bg-white border-[#e1e4e8] text-zinc-600"
                    }`}>
                      <span className="text-emerald-500 border-b-2 border-emerald-500 pb-1 cursor-pointer">Home</span>
                      <span className="hover:text-emerald-500 cursor-pointer">Documentation</span>
                      <span className="hover:text-emerald-500 cursor-pointer">API Reference</span>
                      <span className="hover:text-emerald-500 cursor-pointer">Changelog</span>
                    </div>
                    
                    {/* Page mockup sheet */}
                    <div className={`p-8 md:p-12 transition-all ${
                      isDark ? "bg-[#161618]" : "bg-white"
                    }`}>
                      {/* Standard page title heading */}
                      <h1 className={`text-4xl font-bold tracking-tight mb-6 ${
                        isDark ? "text-white" : "text-zinc-900"
                      }`}>
                        {editTitle || selectedPage.title}
                      </h1>
                      
                      {/* If home page, render GitBook home layouts */}
                      {selectedPage.title.toLowerCase().includes("intro") || selectedPage.title.toLowerCase().includes("home") ? (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                          <p className={isDark ? "text-zinc-300 text-sm leading-relaxed" : "text-zinc-600 text-sm leading-relaxed"}>
                            Welcome to your team's developer platform
                          </p>
                          
                          {/* Mock Ask box */}
                          <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-xs w-full mb-4 ${
                            isDark ? "bg-[#0c0c0e] border-[#222225] text-zinc-500" : "bg-[#f6f8fa] border-[#e1e4e8] text-zinc-500"
                          }`}>
                            <span>Ask a question...</span>
                          </div>
                          
                          {/* Quick links grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                            {["Get started", "Authenticate", "Integrate", "Contribute"].map((text) => (
                              <div key={text} className={`p-3 border rounded-lg text-xs font-semibold text-center select-none cursor-pointer hover:scale-[1.01] transition-transform ${
                                isDark ? "bg-[#222225]/40 border-[#222225] text-zinc-300 hover:bg-[#222225]" : "bg-[#f6f8fa] border-[#e1e4e8] text-zinc-700 hover:bg-[#eef1f4]"
                              }`}>
                                {text}
                              </div>
                            ))}
                          </div>
                          
                          {/* Page content in read-only TipTap */}
                          {editContent !== null && (
                            <RichTextEditor
                              content={editContent}
                              onChange={() => {}}
                              readOnly={true}
                            />
                          )}
                        </div>
                      ) : (
                        // Standard template pages render TipTap read-only Directly
                        editContent !== null && (
                          <RichTextEditor
                            content={editContent}
                            onChange={() => {}}
                            readOnly={true}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--docs-text-muted)] gap-2">
                <BookOpen className="w-12 h-12 text-muted/30" />
                <p className="text-sm font-medium">No page selected.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right column outline table of contents */}
        <aside className="docs-right-sidebar shrink-0">
          {!isEditing && inPageHeadings.length > 0 && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="toc-heading">On this page</div>
              <nav className="flex flex-col gap-1.5 border-l border-[var(--docs-border)] py-1">
                {inPageHeadings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })
                      setActiveHeadingId(heading.id)
                    }}
                    className={`outline-link ${heading.level === "h3" ? "outline-h3" : ""} ${activeHeadingId === heading.id ? "active" : ""}`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
