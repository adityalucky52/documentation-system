import React, { useState } from "react"
import { Upload, X } from "lucide-react"
import { parseMarkdownToHtml } from "../../../utils/markdownParser"

interface ImportFilesModalProps {
  isOpen: boolean
  onClose: () => void
  onSetupWithFile: (title: string, content: string) => Promise<void>
}

export default function ImportFilesModal({
  isOpen,
  onClose,
  onSetupWithFile
}: ImportFilesModalProps) {
  const [aiEnhanceEnabled, setAiEnhanceEnabled] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.name.endsWith('.md')) {
        setSelectedFile(file)
      } else {
        alert("Please upload a Markdown (.md) file.")
      }
    }
  }

  const handleStartImport = async () => {
    if (!selectedFile) return
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string
        const content = parseMarkdownToHtml(rawContent)
        const title = selectedFile.name.replace(/\.md$/, "")
        await onSetupWithFile(title, content)
        onClose()
        setSelectedFile(null)
      } catch (err) {
        alert("Failed to setup site with imported file.")
      } finally {
        setIsImporting(false)
      }
    }
    reader.onerror = () => {
      alert("Failed to read file content.")
      setIsImporting(false)
    }
    reader.readAsText(selectedFile)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161618] border border-[#222225] rounded-xl w-full max-w-[500px] p-6 shadow-2xl flex flex-col gap-6 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button 
          onClick={() => {
            onClose()
            setSelectedFile(null)
          }}
          className="absolute top-4 right-4 text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1.5 pr-8">
          <h2 className="text-xl font-semibold text-white">Import Files</h2>
          <p className="text-xs text-[#8e8e93]">
            Drop Markdown, HTML or ZIP files, to import them into GitBook.
          </p>
        </div>

        {/* AI Enhance Row */}
        <div className="flex items-center justify-between bg-[#1c1c1e] p-4 rounded-xl border border-[#222225]">
          <div className="flex flex-col gap-0.5 max-w-[80%] font-sans">
            <h3 className="text-xs font-semibold text-white">Enhance import with AI</h3>
            <p className="text-[11px] text-[#8e8e93] leading-normal">
              Automatically refine and clean up imported content using AI.
            </p>
          </div>
          <button 
            onClick={() => setAiEnhanceEnabled(!aiEnhanceEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${aiEnhanceEnabled ? 'bg-[#ff5722]' : 'bg-[#2c2c30]'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${aiEnhanceEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Dropzone Area */}
        <input 
          id="file-picker"
          type="file"
          accept=".md"
          onChange={handleFileChange}
          className="hidden"
        />
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-picker')?.click()}
          className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            isDragging ? 'border-[#ff5722] bg-[#ff5722]/5' : 'border-[#2c2c30] hover:border-[#3a3a3f] bg-[#0c0c0e]/30'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] mb-1">
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-xs text-[#8e8e93] text-center max-w-[320px] font-sans">
            {selectedFile ? (
              <span className="text-white font-medium break-all">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            ) : (
              "Drop your Markdown, HTML, DOCX, or ZIP files or browse"
            )}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222225] mt-2">
          <button 
            onClick={() => {
              onClose()
              setSelectedFile(null)
            }}
            className="px-4 py-2 bg-[#161618] hover:bg-[#1c1c1e] border border-[#2c2c30] text-xs font-bold text-[#f5f5f7] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleStartImport}
            disabled={!selectedFile || isImporting}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedFile && !isImporting 
                ? 'bg-white hover:bg-white/90 text-black shadow-md' 
                : 'bg-[#1c1c1e] text-[#55555a] border border-[#2c2c30] cursor-not-allowed'
            }`}
          >
            {isImporting ? "Importing..." : "Start Import"}
          </button>
        </div>
      </div>
    </div>
  )
}
