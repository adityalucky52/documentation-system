import { Sparkles, Globe } from "lucide-react"
import RichTextEditor from "./RichTextEditor/RichTextEditor"
import { parseMarkdownToHtml } from "../../../utils/markdownParser"
import { type Page } from "../../sites-management/sitesStore"

/**
 * EditorCanvas Props.
 * @param selectedPage - Current active page model. Originates in `SpaceEditorPage`.
 * @param activeSubTab - Toggle between input editor vs read-only preview. Originates in `SpaceEditorPage`.
 * @param isEditingMode - True if an active branch is selected. Originates in `SpaceEditorPage`.
 * @param activeCR - Current active change request metadata. Originates in `SpaceEditorPage`.
 * @param editTitle - Local title draft string. Originates in `SpaceEditorPage`.
 * @param setEditTitle - Callback to update title state. Originates in `SpaceEditorPage`.
 * @param editContent - Local markdown content draft. Originates in `SpaceEditorPage`.
 * @param setEditContent - Callback to update content state. Originates in `SpaceEditorPage`.
 */
interface EditorCanvasProps {
  selectedPage: Page | null
  activeSubTab: "editor" | "preview"
  isEditingMode: boolean
  activeCR: any
  editTitle: string
  setEditTitle: (title: string) => void
  editContent: string
  setEditContent: (content: string) => void
}

/**
 * EditorCanvas Component.
 * 
 * Purpose:
 * Renders the central document editing body.
 * Evaluates active tabs and editing states to render appropriate interfaces.
 */
export default function EditorCanvas({
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
      

      <div className="flex-1 overflow-y-auto p-12 flex justify-center">
        <div className="max-w-[760px] w-full flex flex-col gap-6">
          
          {/* Conditional Path 1: No page selected */}
          {!selectedPage ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#8e8e93] gap-2">
              <Sparkles className="w-12 h-12 text-[#2c2c30]" />
              <p className="text-sm font-medium">This space has no pages yet.</p>
            </div>
          ) : /* Conditional Path 2: Preview Mode tab active */
          activeSubTab === "preview" ? (
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
          ) : /* Conditional Path 3: Read-only Mode (Main branch, not in editing branch) */
          !isEditingMode ? (
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
            /* Conditional Path 4: Editing Mode (Active Git Change Request branch) */
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              {/* Informative editing banner */}
              <div className="flex items-center gap-2 bg-indigo-950/20 border border-indigo-500/20 px-3.5 py-2.5 rounded-xl">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-indigo-300 font-medium leading-normal">
                  Editing in <strong>{activeCR?.title}</strong>. Your changes won't affect the live site until you click <strong>Merge</strong>.
                </span>
              </div>

              {/* Title input field */}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Page Title"
                className="w-full bg-transparent text-4xl font-bold tracking-tight text-white placeholder-zinc-700 outline-none border-b border-transparent focus:border-zinc-800 pb-3"
              />

              {/* WYSIWYG text editor component */}
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

