import { useState } from "react"
import { GitMerge, CheckCircle } from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useEditorStore } from "../../editor/editorStore"
import { useSitesStore, type Page } from "../../sites-management/sitesStore"
import { useAuthStore } from "../../auth/authStore"

/**
 * MergeConfirmModal Props.
 * @param spaceId - Unique active space identifier. Originates in `SpaceEditorPage`.
 * @param isOpen - Modal visibility flag. Originates in `SpaceEditorPage`.
 * @param onClose - Modal dismissal callback. Originates in `SpaceEditorPage`.
 * @param selectedPage - Currently active page layout. Originates in `SpaceEditorPage`.
 * @param editTitle - Latest title buffer value. Originates in `SpaceEditorPage`.
 * @param editContent - Latest content buffer value. Originates in `SpaceEditorPage`.
 */
interface MergeConfirmModalProps {
  spaceId: string
  isOpen: boolean
  onClose: () => void
  selectedPage: Page | null
  editTitle: string
  editContent: string
}

/**
 * MergeConfirmModal Component.
 * 
 * Purpose:
 * Renders the merge confirmation dialog box inside the editor space.
 * 
 * Logic details:
 * Pre-merge Auto-save: Before executing the merge call, the modal executes an updatePage request
 * to commit the writer's latest keystroke drafts (`editTitle`, `editContent`) onto the server database.
 * This guarantees no changes are lost when the branch is committed into main.
 */
export default function MergeConfirmModal({
  spaceId,
  isOpen,
  onClose,
  selectedPage,
  editTitle,
  editContent,
}: MergeConfirmModalProps) {
  const { user } = useAuthStore()
  // Connect change requests version control store
  const {
    selectedChangeRequestId,
    openChangeRequests,
    mergeChangeRequest,
    fetchOpenChangeRequests,
  } = useChangeRequestStore()
  // Connect editing actions to commit latest draft updates
  const { updatePage } = useEditorStore()
  // Connect space synchronizer to reload documents page tree
  const { fetchSpace } = useSitesStore()

  // Derived: Current active change request branch metadata
  const activeCR = openChangeRequests.find((cr) => cr.id === selectedChangeRequestId) ?? null

  // Local UI transaction states
  const [isMerging, setIsMerging] = useState(false)
  const [mergeSuccess, setMergeSuccess] = useState(false)

  // Early return: Render nothing if modal flag is closed
  if (!isOpen) return null

  /**
   * Action: Saves latest draft edits and commits the Git-like merge request to main branch.
   */
  const confirmMergeEditsAction = async () => {
    if (!selectedPage || !user || !spaceId || !activeCR) return
    setIsMerging(true)

    try {
      // 1. Commit and save latest edits draft to the database
      await updatePage(selectedPage.id, editTitle, editContent, user.id)

      // 2. Execute branch merge action to publish changes live
      const merged = await mergeChangeRequest(activeCR.id, user.id)
      setIsMerging(false)
      if (merged) {
        setMergeSuccess(true)
        // Refetch main space page lists and open change requests
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
      <div className="w-full max-w-md bg-[#161618] border border-[#222225] rounded-xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 font-sans">

        {/* Modal Header */}
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full bg-[#818cf8]/10 flex items-center justify-center text-[#818cf8]">
            <GitMerge className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white">Merge</h3>
            {activeCR && (
              <span className="text-[10px] text-[#8e8e93] truncate max-w-[260px]">{activeCR.title}</span>
            )}
          </div>
        </div>

        {/* Success screen vs confirmation screen panels */}
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

