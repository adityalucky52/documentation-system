import React from "react"
import { Globe, ChevronRight } from "lucide-react"

interface SiteOverviewCardProps {
  siteName: string
  spaces: Array<{ id: string; name: string }> | undefined
}

export default function SiteOverviewCard({ siteName, spaces }: SiteOverviewCardProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6 font-sans">
      <div className="bg-[#161618] border border-[#222225] rounded-xl overflow-hidden p-5 flex flex-col gap-6">
        
        {/* Visual Preview Box */}
        <div className="aspect-[4/3] w-full bg-[#0c0c0e] border border-[#222225] rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden">
          <div className="h-1.5 w-16 bg-[#3a3a3f] rounded"></div>
          <div className="h-1 w-24 bg-[#2c2c30] rounded"></div>
          <div className="h-1 w-20 bg-[#2c2c30] rounded"></div>
          <div className="w-[80px] h-[50px] bg-[#161618] border border-[#222225] rounded absolute bottom-2 right-2 p-1.5 flex flex-col gap-1">
            <div className="h-1 w-10 bg-[#3a3a3f] rounded"></div>
            <div className="h-0.5 w-8 bg-[#2c2c30] rounded"></div>
          </div>
        </div>

        {/* Site Name and Status */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white tracking-tight">{siteName}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#e0a800]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0a800]"></span>
              <span>Unpublished</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#8e8e93]">
              <Globe className="h-3.5 w-3.5" />
              <span>Public</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1f1f23]"></div>

        {/* Site structure spaces list */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">
            Site structure
          </h4>
          <div className="flex flex-col gap-1">
            {spaces?.map((space) => (
              <div 
                key={space.id} 
                className="flex items-center justify-between px-2.5 py-1.5 bg-[#0c0c0e]/60 border border-[#222225] rounded-md text-xs font-medium text-white"
              >
                <div className="flex items-center gap-2">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-4 w-4 text-[#88888e]"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                    <path d="M6 6h10"/>
                    <path d="M6 10h10"/>
                  </svg>
                  <span>{space.name}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#88888e]" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
