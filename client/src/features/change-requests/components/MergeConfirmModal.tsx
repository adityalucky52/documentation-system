import { useState } from "react"
import { GitMerge, CheckCircle, GitPullRequest } from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useEditorStore } from "../../editor/editorStore"
import { useSitesStore, type Page } from "../../sites-management/sitesStore"
import { useAuthStore } from "../../auth/authStore"

interface MergeConfirmModalProps {
  spaceId: string
  isOpen: boolean
  onClose: () => void
  selectedPage: Page | null
  editTitle: string
  editContent: string
}

export default function MergeConfirmModal({
  spaceId,
  isOpen,
  onClose,
  selectedPage,
  editTitle,
  editContent,
}: MergeConfirmModalProps) {
  const { user } = useAuthStore()
  const {
    selectedChangeRequestId,
    openChangeRequests,
    mergeChangeRequest,
    fetchOpenChangeRequests,
  } = useChangeRequestStore()
  const { updatePage } = useEditorStore()
  const { fetchSpace } = useSitesStore()

  const activeCR = openChangeRequests.find((cr) => cr.id === selectedChangeRequestId) ?? null

  const [isMerging, setIsMerging] = useState(false)
  const [mergeSuccess, setMergeSuccess] = useState(false)

  if (!isOpen) return null

  const confirmMergeEditsAction = async () => {
    if (!selectedPage || !user || !spaceId || !activeCR) return
    setIsMerging(true)

    try {
      // 1. Save current edits first
      await updatePage(selectedPage.id, editTitle, editContent, user.id)

      // 2. Merge the CR
      const merged = await mergeChangeRequest(activeCR.id, user.id)
      setIsMerging(false)
      if (merged) {
        setMergeSuccess(true)
        // Refetch space and open requests
        await fetchSpace(spaceId, user.id)
        await fetchOpenChangeRequests(spaceId, user.id)
      }
    } catch {
      setIsMerging(false)
    }
  }

  const handleClose = () => {
    onClose()
    setMergeSuccess(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#161618] border border-[#222225] rounded-xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full bg-[#818cf8]/10 flex items-center justify-center text-[#818cf8]">
            <GitMerge className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white">Merge change request</h3>
            {activeCR && (
              <span className="text-[10px] text-[#8e8e93] truncate max-w-[260px]">{activeCR.title}</span>
            )}
          </div>
        </div>

        {mergeSuccess ? (
          <div className="flex flex-col gap-4 py-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Successfully merged to Live!</span>
            </div>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              All edits have been published to the live documentation. You are now in read-only Live mode.
            </p>
            <div className="flex justify-end mt-2">
              <button
                onClick={handleClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              Are you sure you want to merge <strong className="text-white">{activeCR?.title}</strong>? This will write all edits directly to the live site.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#8e8e93] hover:text-white bg-[#1c1c1e] border border-[#2d2d30] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmMergeEditsAction}
                disabled={isMerging}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                {isMerging ? "Merging..." : "Confirm merge"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
