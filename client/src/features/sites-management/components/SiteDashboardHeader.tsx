import React from "react"
import { useNavigate } from "react-router-dom"
import { Send } from "lucide-react"

interface SiteDashboardHeaderProps {
  siteName: string
  activeTab: "overview" | "editor" | "preview" | "settings" | "publish"
  setActiveTab: (tab: "overview" | "editor" | "preview" | "settings" | "publish") => void
  orgId: string | undefined
  siteSpaces: Array<{ id: string; name: string }> | undefined
}

export default function SiteDashboardHeader({
  siteName,
  activeTab,
  setActiveTab,
  orgId,
  siteSpaces
}: SiteDashboardHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-8 py-3 border-b border-[#1f1f23] bg-[#0e0e11] sticky top-0 z-10 font-sans">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8e8e93]">
        <span>Docs sites</span>
        <span>/</span>
        <span className="text-white bg-[#1c1c1e] px-2 py-0.5 rounded text-[11px] font-bold">L</span>
        <span className="text-white font-medium">{siteName}</span>
      </div>

      {/* Tab Selection */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "overview" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
        >
          Overview
        </button>
        <button 
          onClick={() => {
            if (siteSpaces && siteSpaces.length > 0) {
              navigate(`/o/${orgId}/s/${siteSpaces[0].id}`)
            } else {
              setActiveTab("editor")
            }
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "editor" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
        >
          Editor
        </button>
        <button 
          onClick={() => setActiveTab("preview")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "preview" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
        >
          Preview
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === "settings" ? "bg-[#1c1c1e] text-white" : "text-[#8e8e93] hover:text-white hover:bg-[#161618]"}`}
        >
          Settings
        </button>
        <button 
          onClick={() => setActiveTab("publish")}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0070f3] text-white hover:bg-[#0060d3] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Send className="h-3 w-3" />
          <span>Publish</span>
        </button>
      </div>
    </div>
  )
}
