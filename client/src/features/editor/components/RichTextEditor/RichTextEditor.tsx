import { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import BubbleMenu from "./BubbleMenu"
import SlashCommandMenu from "./SlashCommandMenu"
import { Plus, GripVertical, MessageSquare } from "lucide-react"
import "./editorStyles.css"

/**
 * RichTextEditor Props.
 * @param content - Parsed html representation of the page content. Originates in `EditorCanvas`.
 * @param onChange - State updater callback triggered when text changes. Originates in `EditorCanvas`.
 * @param readOnly - Flag indicating if editing is locked. Defaults to false. Originates in `EditorCanvas`.
 */
interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  readOnly?: boolean
}

/**
 * RichTextEditor Component.
 * 
 * Purpose:
 * Renders the WYSIWYG rich text editor using TipTap.
 * Includes interactive overlays (Bubble Menu, Slash Command Menu)
 * and floating action gutters that align with the active paragraph line.
 */
export default function RichTextEditor({ content, onChange, readOnly = false }: RichTextEditorProps) {
  // Coordinates and index reference for rendering active gutters
  const [activeBlockRect, setActiveBlockRect] = useState<{ top: number; height: number; index: number } | null>(null)

  // Initialize Tiptap hook
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing or type '/' for commands..."
      })
    ],
    content: content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      // Return updated HTML markup to parent state
      onChange(editor.getHTML())
    }
  })

  // Effect 1: Synchronize internal editor content with outer content prop
  // Uses a safety check (content !== editor.getHTML()) to prevent cursor focus jumping issues.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Effect 2: Toggle editable state when readOnly status changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

  // Effect 3: Selection Update Listener.
  // Tracks selection positions to render floating gutters (line number, add block, comments) in line with the cursor.
  useEffect(() => {
    if (!editor || readOnly) {
      setActiveBlockRect(null)
      return
    }

    const updateGutterPosition = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        setActiveBlockRect(null)
        return
      }

      const range = selection.getRangeAt(0)
      let container = range.startContainer as HTMLElement
      const editorEl = editor.view.dom as HTMLElement
      
      // Traverse up DOM hierarchy until we locate the parent block node directly inside the editor container
      while (container && container.parentElement && container.parentElement !== editorEl) {
        container = container.parentElement
      }

      if (container && container.parentElement === editorEl) {
        const nodeRect = container.getBoundingClientRect()
        const editorRect = editorEl.getBoundingClientRect()
        
        const childrenArray = Array.from(editorEl.children)
        const index = childrenArray.indexOf(container) + 1

        // Resolve absolute top offsets and index values
        setActiveBlockRect({
          top: nodeRect.top - editorRect.top,
          height: nodeRect.height,
          index: index > 0 ? index : 1
        })
      } else {
        setActiveBlockRect(null)
      }
    }

    // Subscribe to editor state updates and window resize events
    editor.on("selectionUpdate", updateGutterPosition)
    editor.on("update", updateGutterPosition)
    window.addEventListener("resize", updateGutterPosition)
    document.addEventListener("click", updateGutterPosition)

    // Detach and clean up listeners on component unmount
    return () => {
      editor.off("selectionUpdate", updateGutterPosition)
      editor.off("update", updateGutterPosition)
      window.removeEventListener("resize", updateGutterPosition)
      document.removeEventListener("click", updateGutterPosition)
    }
  }, [editor, readOnly])

  if (!editor) return null

  return (
    <div className="relative w-full min-h-[300px] group/editor font-sans">
      {/* Floating interactive menus */}
      <BubbleMenu editor={editor} />
      <SlashCommandMenu editor={editor} />

      {/* Floating Action Gutters: Aligns with active block row coordinates */}
      {!readOnly && activeBlockRect && (
        <>
          {/* Left Gutter: Plus Button, Drag Handle, Block Number */}
          <div 
            className="absolute left-[-56px] flex items-center gap-1.5 opacity-0 group-hover/editor:opacity-100 transition-all duration-200 z-25"
            style={{ 
              top: `${activeBlockRect.top + (activeBlockRect.height - 24) / 2}px`,
              height: "24px"
            }}
          >
            {/* Add block button: Inserts empty paragraph node below active block */}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().insertContent("<p></p>").run()
              }}
              className="w-5 h-5 rounded-md border border-[#2c2c30] hover:bg-[#222225] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Add Block"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Drag Handle (Grip icon) */}
            <div 
              className="w-5 h-5 rounded-md hover:bg-[#222225] flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-grab"
              title="Drag Block"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Active Block Row Number */}
            <div className="text-[10px] text-zinc-600 font-semibold w-4 text-right pr-0.5 select-none">
              {activeBlockRect.index}
            </div>
          </div>

          {/* Right Gutter: Add comment panel trigger */}
          <div 
            className="absolute right-[-44px] flex items-center opacity-0 group-hover/editor:opacity-100 transition-all duration-200 z-25"
            style={{ 
              top: `${activeBlockRect.top + (activeBlockRect.height - 24) / 2}px`,
              height: "24px"
            }}
          >
            <button
              type="button"
              className="w-6 h-6 rounded-md border border-[#2c2c30] hover:bg-[#222225] flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Add Comment"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Editor Content Area Mount Node */}
      <EditorContent editor={editor} className="outline-none" />
    </div>
  )
}

