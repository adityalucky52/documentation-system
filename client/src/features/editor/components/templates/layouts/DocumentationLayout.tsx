import React, { useState, useEffect } from "react"
import { BookOpen, FileText, Sun, Moon, Search } from "lucide-react"
import { parseMarkdownToHtml } from "@shared/utils/markdownParser"
import "@shared/styles/public-reader.css"
import type { Page } from "@entities/page/types"

interface DocumentationLayoutProps {
  content: string
  title: string
  siteName: string
  spaceName: string
  pages: Page[]
  selectedPageId: string
  inPageHeadings: Array<{ id: string; text: string; level: string }>
  activeHeadingId: string
  onPageClick: (page: Page) => void
  onHeadingClick: (id: string) => void
}

export default function DocumentationLayout({
  content,
  title,
  siteName,
  spaceName,
  pages,
  selectedPageId,
  inPageHeadings,
  activeHeadingId,
  onPageClick,
  onHeadingClick
}: DocumentationLayoutProps) {
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

  // Prepend visual copy action buttons inside raw code containers
  useEffect(() => {
    if (!content) return

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
  }, [content])

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

  return (
    <div className="docs-container font-sans h-full flex flex-col">
      {/* 1. Header Navbar */}
      <header className="docs-header select-none shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold min-w-0">
          <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[var(--docs-text-heading)] truncate max-w-[120px]">{siteName}</span>
          <span className="text-[var(--docs-text-muted)] font-normal">/</span>
          <span className="text-[var(--docs-text-muted)] font-normal truncate">{spaceName}</span>
          <span className="ml-2 text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Live Preview
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
      <div className="docs-main-layout flex-1 overflow-hidden">
        {/* Left column sidebar navigation */}
        <aside className="docs-left-sidebar py-6 px-4 shrink-0">
          <div className="toc-heading">Table of Contents</div>
          <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageClick(page)}
                className={`toc-link ${selectedPageId === page.id ? "active" : ""}`}
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
            {content ? (
              <div className="flex flex-col animate-in fade-in duration-200">
                <article
                  id="docs-content-body"
                  className="docs-article"
                  onClick={handleArticleClick}
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdownToHtml(content),
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--docs-text-muted)] gap-2">
                <BookOpen className="w-12 h-12 text-muted/30" />
                <p className="text-sm font-medium">No content yet.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right column outline table of contents */}
        <aside className="docs-right-sidebar shrink-0 overflow-y-auto">
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
                      onHeadingClick(heading.id)
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
