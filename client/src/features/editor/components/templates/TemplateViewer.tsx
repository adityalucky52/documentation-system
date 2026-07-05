import React, { useState, useEffect } from "react"
import DocumentationLayout from "./layouts/DocumentationLayout"
import { mockSpaceData } from "./mockData/mockDocsData"

interface TemplateViewerProps {
  content: string
  title: string
  siteName: string
  spaceName: string
}

export default function TemplateViewer({ content, title, siteName, spaceName }: TemplateViewerProps) {
  const [inPageHeadings, setInPageHeadings] = useState<Array<{ id: string; text: string; level: string }>>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string>("")
  const [selectedPageId, setSelectedPageId] = useState<string>("intro")

  // Use mock pages for the left sidebar to provide a realistic preview
  const pages = mockSpaceData.pages

  // Extract headings whenever content changes to populate the right sidebar
  useEffect(() => {
    if (!content) {
      setInPageHeadings([])
      setActiveHeadingId("")
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
  }, [content])

  // Scrollspy logic to highlight the active heading
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

  const handleHeadingClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setActiveHeadingId(id)
  }

  const handlePageClick = (page: any) => {
    setSelectedPageId(page.id)
  }

  return (
    <div className="h-full w-full bg-white dark:bg-[#0c0c0e]">
      <DocumentationLayout
        content={content}
        title={title}
        siteName={siteName}
        spaceName={spaceName}
        pages={pages}
        selectedPageId={selectedPageId}
        inPageHeadings={inPageHeadings}
        activeHeadingId={activeHeadingId}
        onPageClick={handlePageClick}
        onHeadingClick={handleHeadingClick}
      />
    </div>
  )
}
