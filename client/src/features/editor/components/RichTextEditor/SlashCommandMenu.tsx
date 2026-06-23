import { useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"
import { Heading1, Heading2, List, ListOrdered, Terminal, Quote } from "lucide-react"

interface SlashCommandMenuProps {
  editor: Editor | null
}

export default function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands = [
    {
      title: "Heading 1",
      description: "Big section heading",
      icon: Heading1,
      action: () => {
        if (!editor) return
        const { pos } = editor.state.selection.$from
        editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).toggleHeading({ level: 1 }).run()
      }
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      action: () => {
        if (!editor) return
        const { pos } = editor.state.selection.$from
        editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).toggleHeading({ level: 2 }).run()
      }
    },
    {
      title: "Bullet List",
      description: "Create a simple bulleted list",
      icon: List,
      action: () => {
        if (!editor) return
        const { pos } = editor.state.selection.$from
        editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).toggleBulletList().run()
      }
    },
    {
      title: "Numbered List",
      description: "Create a list with numbering",
      icon: ListOrdered,
      action: () => {
        if (!editor) return
        const { pos } = editor.state.selection.$from
        editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).toggleOrderedList().run()
      }
    },
    {
      title: "Code Block",
      description: "Insert a code block",
      icon: Terminal,
      action: () => {
        if (!editor) return
        const { pos } = editor.state.selection.$from
        editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).toggleCodeBlock().run()
      }
    },
    {
      title: "Blockquote",
      description: "Insert a blockquote",
      icon: Quote,
      action: () => {
        if (!editor) return
        const { pos } = editor.state.selection.$from
        editor.chain().focus().deleteRange({ from: pos - 1, to: pos }).toggleBlockquote().run()
      }
    }
  ]

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const { selection } = editor.state
      const { $from } = selection
      const textBefore = $from.nodeBefore?.text || ""

      if (textBefore.endsWith("/")) {
        const view = editor.view
        const selectionCoords = view.coordsAtPos($from.pos)
        
        setCoords({
          top: selectionCoords.bottom + window.scrollY + 8,
          left: selectionCoords.left + window.scrollX
        })
        setIsOpen(true)
        setSelectedIndex(0)
      } else {
        setIsOpen(false)
      }
    }

    editor.on("selectionUpdate", handleUpdate)
    editor.on("update", handleUpdate)

    return () => {
      editor.off("selectionUpdate", handleUpdate)
      editor.off("update", handleUpdate)
    }
  }, [editor])

  useEffect(() => {
    if (!isOpen || !editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % commands.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        commands[selectedIndex].action()
        setIsOpen(false)
      } else if (e.key === "Escape") {
        e.preventDefault()
        setIsOpen(false)
        editor.commands.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [isOpen, selectedIndex, editor, commands])

  if (!isOpen) return null

  return (
    <div 
      className="fixed z-50 bg-[#161618] border border-[#2c2c30] w-[260px] rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5"
      style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
    >
      <div className="px-2 py-1 text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">
        Basic Blocks
      </div>
      {commands.map((cmd, idx) => {
        const Icon = cmd.icon
        const isSelected = idx === selectedIndex
        return (
          <button
            key={cmd.title}
            type="button"
            onClick={() => {
              cmd.action()
              setIsOpen(false)
            }}
            className={`flex items-center gap-3 px-2 py-1.5 rounded-lg text-left transition-colors w-full ${
              isSelected ? "bg-[#222225] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#1c1c1e]"
            }`}
          >
            <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${
              isSelected ? "bg-[#ff5722]/10 border-[#ff5722]/30 text-[#ff5722]" : "bg-[#222225] border-[#2c2c30] text-[#8e8e93]"
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold">{cmd.title}</span>
              <span className="text-[10px] opacity-70 leading-none">{cmd.description}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
