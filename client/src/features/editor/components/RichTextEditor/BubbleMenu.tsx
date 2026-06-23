import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus"
import { type Editor } from "@tiptap/react"
import { Bold, Italic, Strikethrough, Code } from "lucide-react"

interface BubbleMenuProps {
  editor: Editor | null
}

export default function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) return null

  return (
    <TiptapBubbleMenu
      editor={editor}
      className="flex items-center gap-1 bg-[#161618] border border-[#2c2c30] p-1 rounded-lg shadow-xl z-40"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-[#222225] transition-colors text-zinc-400 hover:text-white ${
          editor.isActive("bold") ? "text-white bg-[#222225]" : ""
        }`}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-[#222225] transition-colors text-zinc-400 hover:text-white ${
          editor.isActive("italic") ? "text-white bg-[#222225]" : ""
        }`}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-[#222225] transition-colors text-zinc-400 hover:text-white ${
          editor.isActive("strike") ? "text-white bg-[#222225]" : ""
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded hover:bg-[#222225] transition-colors text-zinc-400 hover:text-white ${
          editor.isActive("code") ? "text-white bg-[#222225]" : ""
        }`}
        title="Code"
      >
        <Code className="w-3.5 h-3.5" />
      </button>
    </TiptapBubbleMenu>
  )
}
