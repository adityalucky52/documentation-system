import { PenTool, GitBranch, UserPlus, Palette, Compass, Globe, Plus } from "lucide-react"

/**
 * SiteGetStartedChecklist Props.
 * @param onStartFirstChangeRequest - Callback trigger to route to the text editor space, originating in `SiteSetupPage`.
 */
interface SiteGetStartedChecklistProps {
  onStartFirstChangeRequest: () => void
}

/**
 * SiteGetStartedChecklist Component.
 * 
 * Purpose:
 * Renders an onboarding task checklist for newly initialized documentation sites.
 * Helps direct users on subsequent configuration tasks (content editing, team invites, style settings, custom domains).
 */
export default function SiteGetStartedChecklist({
  onStartFirstChangeRequest
}: SiteGetStartedChecklistProps) {
  return (
    <div className="lg:col-span-8 flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold tracking-wider text-[#8e8e93] uppercase">Get started</h2>
        <span className="text-xs font-semibold text-[#8e8e93] bg-[#161618] px-2 py-0.5 rounded border border-[#222225]">
          0/7 tasks completed
        </span>
      </div>

      <div className="flex flex-col gap-3">
        
        {/* Task 1: Edit your content (Expanded active task card layout) */}
        <div className="bg-[#161618] border border-[#222225] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-white shrink-0">
                <PenTool className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col gap-1 mt-0.5">
                <h3 className="text-sm font-semibold text-white">Edit your content</h3>
                <p className="text-xs text-[#8e8e93] leading-relaxed max-w-[500px]">
                  Create a change request to edit your site's content safely, then merge it to update your site when ready.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons triggers */}
          <div className="flex items-center gap-3 pl-[50px] mt-1">
            <button 
              onClick={onStartFirstChangeRequest}
              className="px-3.5 py-1.5 text-xs font-semibold text-black bg-white hover:bg-white/95 rounded-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Edit in your first change request</span>
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-md transition-colors cursor-pointer">
              Skip for now
            </button>
          </div>
        </div>

        {/* Task 2: Invite teammates (Collapsed) */}
        <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
              <UserPlus className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
              Invite teammates
            </span>
          </div>
          <Plus className="h-4 w-4 text-[#8e8e93]" />
        </div>

        {/* Task 3: Customize look and feel (Collapsed) */}
        <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
              <Palette className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
              Customize the look and feel
            </span>
          </div>
          <Plus className="h-4 w-4 text-[#8e8e93]" />
        </div>

        {/* Task 4: Add structure to site (Collapsed) */}
        <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
              <Compass className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
              Add structure to your site
            </span>
          </div>
          <Plus className="h-4 w-4 text-[#8e8e93]" />
        </div>

        {/* Task 5: Add custom domain (Collapsed) */}
        <div className="bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93] group-hover:text-white shrink-0 transition-colors">
              <Globe className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-white transition-colors">
              Add a custom domain
            </span>
          </div>
          <Plus className="h-4 w-4 text-[#8e8e93]" />
        </div>

      </div>
    </div>
  )
}

