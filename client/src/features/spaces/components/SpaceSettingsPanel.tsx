import { Trash2 } from "lucide-react"

/**
 * SpaceSettingsPanel Props.
 * @param onDeleteSite - Callback trigger to initiate site deletion. Originates in `SpaceSetupPage`.
 */
interface SpaceSettingsPanelProps {
  onDeleteSite: () => void
}

/**
 * SpaceSettingsPanel Component.
 *
 * Purpose:
 * Renders settings controls for the active documentation site.
 * Currently supports the Danger Zone options enabling users to delete the site.
 *
 * Renamed from SiteSettingsPanel — moved from sites-management into spaces feature.
 */
export default function SpaceSettingsPanel({ onDeleteSite }: SpaceSettingsPanelProps) {
  return (
    <div className="lg:col-span-8 flex flex-col gap-6 animate-in fade-in duration-200 font-sans">
      <div className="flex flex-col gap-1.5 shrink-0">
        <h2 className="text-sm font-semibold tracking-wider text-[#8e8e93] uppercase">Site Settings</h2>
        <p className="text-xs text-[#8e8e93]">Manage configurations and control access for this documentation site.</p>
      </div>

      {/* Danger Zone: Houses deletion options with red alert border highlighting */}
      <div className="bg-[#161618] border border-[#e11d48]/20 rounded-xl p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5 border-b border-[#222225] pb-4">
          <h3 className="text-sm font-semibold text-white">Danger Zone</h3>
          <p className="text-xs text-[#8e8e93]">Irreversible actions regarding this documentation site.</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h4 className="text-xs font-semibold text-white">Delete this site</h4>
            <p className="text-[11px] text-[#8e8e93]">Once deleted, all pages, spaces, and content will be permanently lost.</p>
          </div>
          <button
            onClick={onDeleteSite}
            className="px-4 py-2 bg-[#e11d48]/10 hover:bg-[#e11d48] border border-[#e11d48]/30 hover:border-transparent text-[#f43f5e] hover:text-white rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Site</span>
          </button>
        </div>
      </div>
    </div>
  )
}
