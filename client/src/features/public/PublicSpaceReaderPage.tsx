import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FileText, BookOpen, Sun, Moon, Search } from "lucide-react"
import { parseMarkdownToHtml } from "../../utils/markdownParser"
import { type Page } from "../sites-management/sitesStore"
import { mockSpaceData } from "./mockDocsData"
import "./public-reader.css"

/**
 * PublicSpaceReaderPage Component.
 *
 * Purpose:
 * Renders a clean, read-only, premium documentation viewer for external users.
 * Mimics high-end platforms like Prisma Docs using forest green styles and a 3-column layout.
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

  // In-page outline list state
  const [inPageHeadings, setInPageHeadings] = useState<Array<{ id: string; text: string; level: string }>>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string>("")

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

  // Fetch published documentation with a fallback to local mock data
  useEffect(() => {
    if (!spaceId) return

    const fetchPublishedDocs = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:5001/api/public/spaces/${spaceId}`)
        if (!response.ok) {
          throw new Error("Unable to fetch live documentation")
        }
        const data = await response.json()
        setSpaceName(data.name || "Space")
        setSiteName(data.site?.name || "Docs")
        
        const spacePages = data.pages || []
        setPages(spacePages)
        
        // Default to select first page if available
        if (spacePages.length > 0) {
          setSelectedPage(spacePages[0])
        }
      } catch (err: any) {
        console.warn("Live API fetch failed or site is unpublished. Loading static mock docs...", err.message)
        // Fallback to static Prisma docs mock data
        setSpaceName(mockSpaceData.name)
        setSiteName(mockSpaceData.site.name)
        setPages(mockSpaceData.pages)
        if (mockSpaceData.pages.length > 0) {
          setSelectedPage(mockSpaceData.pages[0])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublishedDocs()
  }, [spaceId])

  // Extract H2 and H3 elements to render the in-page outline outline sidebar
  useEffect(() => {
    if (!selectedPage || isLoading) return

    const timer = setTimeout(() => {
      const articleEl = document.getElementById("docs-content-body")
      if (!articleEl) return

      const headingElements = articleEl.querySelectorAll("h2, h3")
      const parsedHeadings = Array.from(headingElements).map((el, index) => {
        const text = el.textContent || ""
        // Generate stable slug ID if missing
        const id = el.id || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `heading-${index}`
        el.id = id
        return {
          id,
          text,
          level: el.tagName.toLowerCase()
        }
      })
      
      setInPageHeadings(parsedHeadings)
      if (parsedHeadings.length > 0) {
        setActiveHeadingId(parsedHeadings[0].id)
      } else {
        setActiveHeadingId("")
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [selectedPage, isLoading])

  // Scrollspy observer tracking scrolling focus shifts
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

    return () => {
      observer.disconnect()
    }
  }, [inPageHeadings])

  // Prepend visual copy action buttons inside raw code containers
  useEffect(() => {
    if (!selectedPage || isLoading) return

    const timer = setTimeout(() => {
      const articleEl = document.getElementById("docs-content-body")
      if (!articleEl) return

      const preElements = articleEl.querySelectorAll("pre")
      preElements.forEach((pre) => {
        if (pre.querySelector(".copy-code-btn")) return

        const copyBtn = document.createElement("button")
        copyBtn.className = "copy-code-btn"
        copyBtn.setAttribute("type", "button")
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Copy</span>
        `
        pre.appendChild(copyBtn)
      })
    }, 150)

    return () => clearTimeout(timer)
  }, [selectedPage, isLoading])

  // Handles copying pre-block text strings on click via event delegation
  const handleArticleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const btn = target.closest(".copy-code-btn") as HTMLButtonElement | null
    if (!btn) return

    const pre = btn.closest("pre")
    const code = pre?.querySelector("code")
    if (code) {
      const textToCopy = code.innerText || ""
      navigator.clipboard.writeText(textToCopy)

      const textSpan = btn.querySelector("span")
      const svgIcon = btn.querySelector("svg")
      
      if (textSpan) textSpan.innerText = "Copied!"
      if (svgIcon) {
        svgIcon.outerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        `
      }

      setTimeout(() => {
        if (textSpan) textSpan.innerText = "Copy"
        const checkIcon = btn.querySelector("svg")
        if (checkIcon) {
          checkIcon.outerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          `
        }
      }, 2000)
    }
  }

  // Loading view
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen text-muted-foreground bg-background transition-colors">
        <div className="flex flex-col items-center gap-2 font-sans">
          <div className="animate-spin w-6 h-6 border-2 border-t-emerald-500 border-zinc-700 rounded-full" />
          <span className="text-xs">Loading documentation...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="docs-container font-sans">
      {/* 1. Header Navbar */}
      <header className="docs-header select-none">
        <div className="flex items-center gap-2 text-xs font-bold min-w-0">
          <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[var(--docs-text-heading)] truncate max-w-[120px]">{siteName}</span>
          <span className="text-[var(--docs-text-muted)] font-normal">/</span>
          <span className="text-[var(--docs-text-muted)] font-normal truncate">{spaceName}</span>
          <span className="ml-2 text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Live
          </span>
        </div>

        {/* Mock Search input */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--docs-code-bg)] border border-[var(--docs-border)] rounded-lg px-3 py-1.5 w-[280px] text-xs text-[var(--docs-text-muted)] cursor-text select-none hover:border-emerald-500/50 transition-colors">
          <Search className="w-3.5 h-3.5 text-[var(--docs-text-muted)]" />
          <span>Search...</span>
          <kbd className="ml-auto bg-[var(--docs-bg)] border border-[var(--docs-border)] px-1 rounded text-[10px]">Ctrl K</kbd>
        </div>

        {/* Action icons & theme */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-[var(--docs-text-muted)]">
            <span className="hover:text-[var(--docs-text-heading)] cursor-pointer transition-colors">Guides</span>
            <span className="hover:text-[var(--docs-text-heading)] cursor-pointer transition-colors">API</span>
          </div>

          <div className="h-4 w-px bg-[var(--docs-border)] hidden sm:block"></div>

          {/* Social Icons */}
          <div className="flex items-center gap-1.5">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-1.5 text-[var(--docs-text-muted)] hover:text-[var(--docs-text-heading)] transition-colors">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
          </div>

          <div className="h-4 w-px bg-[var(--docs-border)]"></div>

          <button
            onClick={toggleTheme}
            className="p-1.5 text-[var(--docs-text-muted)] hover:text-[var(--docs-text-heading)] rounded-lg cursor-pointer transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* 2. Main content area layout */}
      <div className="docs-main-layout">
        {/* Left column sidebar navigation */}
        <aside className="docs-left-sidebar py-6 px-4 shrink-0">
          <div className="toc-heading">Table of Contents</div>
          <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`toc-link ${selectedPage?.id === page.id ? "active" : ""}`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{page.title}</span>
              </button>
            ))}
          </nav>

          {/* Operational check status at bottom */}
          <div className="mt-auto pt-4 border-t border-[var(--docs-border)] px-2 flex items-center gap-2 select-none">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-[var(--docs-text-muted)] uppercase tracking-wider">All Systems Operational</span>
          </div>
        </aside>

        {/* Center reading article area */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 flex justify-center">
          <div className="max-w-[760px] w-full">
            {selectedPage ? (
              <div className="flex flex-col animate-in fade-in duration-200">
                <article
                  id="docs-content-body"
                  className="docs-article"
                  onClick={handleArticleClick}
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdownToHtml(selectedPage.content),
                  }}
                />
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
          {inPageHeadings.length > 0 && (
            <div className="flex flex-col gap-3">
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
