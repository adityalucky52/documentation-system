import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { X, BookOpen, FileText, LayoutGrid } from "lucide-react"
import { useSpacesStore } from "@features/spaces/spacesStore"
import { useAuthStore } from "@features/auth/authStore"

/**
 * CreateSpaceModal Props.
 * @param isOpen - Control toggle mapping visibility. Originates in `DashboardLayout`.
 * @param onClose - Handler to trigger modal close. Originates in `DashboardLayout`.
 */
interface CreateSpaceModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * CreateSpaceModal Component.
 *
 * Purpose:
 * Renders the new site creator dialog pop-up.
 * Renamed from CreateSiteModal — moved from sites-management into space-creation.
 *
 * Flow:
 * - Submit forms trigger `addSite` action from the spaces store.
 * - On API success, redirects users to setup workspace `/o/:orgId/sites/:siteId`.
 */
export default function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const [siteName, setSiteName] = useState("")
  const addSite = useSpacesStore((state) => state.addSite)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { orgId } = useParams<{ orgId: string }>()

  if (!isOpen) return null

  /**
   * Action: Submits site name inputs to backend.
   * On validation success, triggers site creator, resets state, and pushes route navigation.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!siteName.trim() || !user || !orgId) return
    const newSiteId = await addSite(siteName.trim(), user.id)
    if (newSiteId) {
      setSiteName("")
      onClose()
      navigate(`/o/${orgId}/sites/${newSiteId}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300">

      {/* Modal Card Layout Container */}
      <div className="relative flex w-[720px] h-[400px] bg-[#161618] border border-[#222225] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8e8e93] hover:text-white transition-colors z-10 p-1 hover:bg-[#222225] rounded-full"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: Graphic collage (Simulates GitBook space aesthetics) */}
        <div className="hidden md:flex w-[260px] bg-[#0c0c0e] border-r border-[#222225] relative p-6 overflow-hidden items-center justify-center shrink-0">
          <div className="absolute inset-0 opacity-80 flex flex-col gap-3 rotate-[-15deg] scale-110 translate-x-[-15px] translate-y-[-15px]">
            {/* Collage Row 1 */}
            <div className="flex gap-3">
              <div className="w-[130px] h-[80px] bg-[#1c1c1e] border border-[#2c2c30] rounded-lg p-2.5 flex flex-col gap-1.5 shrink-0 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#312e81]/30 border border-[#4338ca]/30 flex items-center justify-center text-[#818cf8]">
                    <BookOpen className="h-2 w-2" />
                  </div>
                  <div className="h-1 w-10 bg-[#3a3a3f] rounded"></div>
                </div>
                <div className="h-1 w-16 bg-[#2c2c30] rounded"></div>
                <div className="h-1 w-12 bg-[#2c2c30] rounded"></div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="h-1 w-6 bg-[#3a3a3f] rounded"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></div>
                </div>
              </div>
              <div className="w-[130px] h-[80px] bg-[#1c1c1e] border border-[#2c2c30] rounded-lg p-2.5 flex flex-col gap-1.5 shrink-0 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#065f46]/30 border border-[#047857]/30 flex items-center justify-center text-[#34d399]">
                    <FileText className="h-2 w-2" />
                  </div>
                  <div className="h-1 w-8 bg-[#3a3a3f] rounded"></div>
                </div>
                <div className="h-1 w-12 bg-[#2c2c30] rounded"></div>
                <div className="h-1 w-14 bg-[#2c2c30] rounded"></div>
              </div>
            </div>

            {/* Collage Row 2 */}
            <div className="flex gap-3 translate-x-[-20px]">
              <div className="w-[150px] h-[90px] bg-[#222225] border border-[#323236] rounded-lg p-3 flex flex-col gap-1.5 shrink-0 shadow-xl">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-white text-[8px] font-bold">
                    D
                  </div>
                  <div className="h-1.5 w-12 bg-white/90 rounded"></div>
                </div>
                <div className="h-1 w-20 bg-[#3a3a3f] rounded"></div>
                <div className="h-1 w-16 bg-[#3a3a3f] rounded"></div>
                <div className="h-1 w-12 bg-[#3a3a3f] rounded"></div>
              </div>
              <div className="w-[130px] h-[90px] bg-[#1c1c1e] border border-[#2c2c30] rounded-lg p-2.5 flex flex-col gap-1.5 shrink-0 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#374151] flex items-center justify-center text-white">
                    <LayoutGrid className="h-2 w-2" />
                  </div>
                  <div className="h-1 w-8 bg-[#3a3a3f] rounded"></div>
                </div>
                <div className="h-1 w-14 bg-[#2c2c30] rounded"></div>
              </div>
            </div>

            {/* Collage Row 3 */}
            <div className="flex gap-3">
              <div className="w-[120px] h-[70px] bg-[#1c1c1e] border border-[#2c2c30] rounded-lg p-2 flex flex-col gap-1 shrink-0 shadow-lg">
                <div className="h-1 w-8 bg-[#3a3a3f] rounded"></div>
                <div className="h-1 w-14 bg-[#2c2c30] rounded"></div>
              </div>
              <div className="w-[140px] h-[70px] bg-[#1c1c1e] border border-[#2c2c30] rounded-lg p-2 flex flex-col gap-1 shrink-0 shadow-lg">
                <div className="h-1 w-12 bg-[#3a3a3f] rounded"></div>
                <div className="h-1 w-16 bg-[#2c2c30] rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Inputs */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-8 pt-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-white tracking-tight">Create a new site</h2>
              <p className="text-xs text-[#8e8e93]">
                Give your site a name your visitors will recognize.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="site-name" className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">
                Site name
              </label>
              <input
                id="site-name"
                type="text"
                autoFocus
                placeholder="Enter site name..."
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-[#222225] rounded-lg text-sm text-white placeholder-[#4e4e54] focus:outline-hidden focus:border-[#4c4c52] transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!siteName.trim()}
              className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-white/90 disabled:bg-[#222225] disabled:text-[#4c4c52] disabled:cursor-not-allowed rounded-lg transition-all cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
