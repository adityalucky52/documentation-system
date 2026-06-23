import React from "react"
import { Sparkles, Globe, CheckCircle } from "lucide-react"
import RichTextEditor from "./RichTextEditor/RichTextEditor"
import { parseMarkdownToHtml } from "../../../utils/markdownParser"
import { type Page } from "../../sites-management/sitesStore"

interface EditorCanvasProps {
  notification: string | null
  selectedPage: Page | null
  activeSubTab: "editor" | "preview"
  isEditingMode: boolean
  activeCR: any
  editTitle: string
  setEditTitle: (title: string) => void
  editContent: string
  setEditContent: (content: string) => void
}

export default function EditorCanvas({
  notification,
  selectedPage,
  activeSubTab,
  isEditingMode,
  activeCR,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent
}: EditorCanvasProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#121214] overflow-hidden relative font-sans">
      
      {notification && (
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 border border-emerald-500 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-12 flex justify-center">
        <div className="max-w-[760px] w-full flex flex-col gap-6">
          
          {!selectedPage ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#8e8e93] gap-2">
              <Sparkles className="w-12 h-12 text-[#2c2c30]" />
              <p className="text-sm font-medium">This space has no pages yet.</p>
            </div>
          ) : activeSubTab === "preview" ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <h1 className="text-4xl font-bold tracking-tight text-white">{selectedPage.title}</h1>
              <div className="border-b border-[#1f1f23] pb-4 text-xs text-[#8e8e93] flex items-center gap-4">
                <span>Reading Mode</span>
                <span>•</span>
                <span>Last updated: just now</span>
              </div>
              {selectedPage.content ? (
                <article
                  className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdownToHtml(selectedPage.content),
                  }}
                />
              ) : (
                <p className="italic text-[#8e8e93] text-sm">No content yet.</p>
              )}
            </div>
          ) : !isEditingMode ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <h1 className="text-4xl font-bold tracking-tight text-white">{selectedPage.title}</h1>
              <div className="border-b border-[#1f1f23] pb-4 text-xs text-[#8e8e93] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Globe className="w-3 h-3" />
                    Live
                  </span>
                  <span>•</span>
                  <span>Last updated: just now</span>
                </div>
              </div>
              {selectedPage.content ? (
                <article
                  className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdownToHtml(selectedPage.content),
                  }}
                />
              ) : (
                <p className="italic text-[#8e8e93] text-sm">
                  No content yet. Use the switcher above to open a change request and start editing.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 bg-indigo-950/20 border border-indigo-500/20 px-3.5 py-2.5 rounded-xl">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-indigo-300 font-medium leading-normal">
                  Editing in <strong>{activeCR?.title}</strong>. Your changes won't affect the live site until you click <strong>Merge</strong>.
                </span>
              </div>

              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Page Title"
                className="w-full bg-transparent text-4xl font-bold tracking-tight text-white placeholder-zinc-700 outline-none border-b border-transparent focus:border-zinc-800 pb-3"
              />

              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                readOnly={false}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
