import { Sparkles, Globe } from "lucide-react"
import RichTextEditor from "./RichTextEditor/RichTextEditor"
import { parseMarkdownToHtml } from "../../../utils/markdownParser"
import { type Page } from "../../sites-management/sitesStore"

/**
 * EditorCanvas Props.
 * @param selectedPage - Current active page model. Originates in `SpaceEditorPage`.
 * @param activeTab - Controls whether the canvas shows the editor or read-only preview. Originates in `SpaceEditorPage`.
 * @param editTitle - Local title draft string. Originates in `SpaceEditorPage`.
 * @param setEditTitle - Callback to update title state. Originates in `SpaceEditorPage`.
 * @param editContent - Local markdown content draft. Originates in `SpaceEditorPage`.
 * @param setEditContent - Callback to update content state. Originates in `SpaceEditorPage`.
 */
interface EditorCanvasProps {
  selectedPage: Page | null
  activeTab: "editor" | "preview"
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
 * - Editor tab: Editable title input + RichTextEditor (auto-saves to backend).
 * - Preview tab: Read-only rendered markdown view of the current page content.
 */
export default function EditorCanvas({
  selectedPage,
  activeTab,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent
}: EditorCanvasProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#121214] overflow-hidden relative font-sans">
      <div className="flex-1 overflow-y-auto p-12 flex justify-center">
        <div className="max-w-[760px] w-full flex flex-col gap-6">

          {/* No page selected state */}
          {!selectedPage ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#8e8e93] gap-2">
              <Sparkles className="w-12 h-12 text-[#2c2c30]" />
              <p className="text-sm font-medium">This space has no pages yet.</p>
            </div>
          ) : activeTab === "preview" ? (
            /* Preview Mode: Read-only rendered markdown */
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <h1 className="text-4xl font-bold tracking-tight text-white">{editTitle || selectedPage.title}</h1>
              <div className="border-b border-[#1f1f23] pb-4 text-xs text-[#8e8e93] flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Globe className="w-3 h-3" />
                  Preview
                </span>
                <span>•</span>
                <span>Read-only</span>
              </div>
              {editContent ? (
                <article
                  className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdownToHtml(editContent),
                  }}
                />
              ) : (
                <p className="italic text-[#8e8e93] text-sm">No content yet.</p>
              )}
            </div>
          ) : (
            /* Editor Mode: Editable title + RichTextEditor */
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
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
