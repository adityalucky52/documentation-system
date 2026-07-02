import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Eye, GitMerge, Sun, Moon, Share2 } from "lucide-react"

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
  spaceId,
  siteName,
  activeTab,
  setActiveTab,
  handleMergeEdits,
  isSaving,
  saveError,
}: EditorHeaderProps) {
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"))
  const [copied, setCopied] = useState(false)

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

  const handleShareClick = () => {
    const publicUrl = `${window.location.origin}/share/s/${spaceId}`
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-card shrink-0 gap-3 font-sans transition-colors">

      {/* Left Pane: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground min-w-0 flex-1 overflow-hidden">
        <span
          className="hover:text-foreground cursor-pointer whitespace-nowrap shrink-0 transition-colors"
          onClick={() => navigate(`/o/${orgId}/home`)}
        >
          Docs sites
        </span>
        <span className="shrink-0">/</span>
        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide shrink-0">
          {siteName[0]}
        </span>
        <span className="text-foreground font-medium truncate max-w-[100px] shrink">{siteName}</span>
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
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "text-foreground bg-accent/60"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
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
              <span className="text-muted-foreground font-medium">Saving...</span>
            </>
          ) : saveError ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-rose-400 font-medium">Error saving</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse duration-1000" />
              <span className="text-muted-foreground">Saved</span>
            </>
          )}
        </div>

        {/* Theme Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-lg cursor-pointer transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className={`pl-2.5 pr-2.5 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm whitespace-nowrap h-[28px] border border-border ${
              copied
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                : "bg-background text-foreground hover:bg-accent/40"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>

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
