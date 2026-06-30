import { useState, useEffect } from "react"
import { X, CheckCircle, Plus } from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useAuthStore } from "../../auth/authStore"

/**
 * RequestReviewModal Props.
 * @param spaceId - Unique active space identifier. Originates in `SpaceEditorPage`.
 * @param isOpen - Modal visibility flag. Originates in `SpaceEditorPage`.
 * @param onClose - Modal dismissal callback. Originates in `SpaceEditorPage`.
 * @param showNotification - Triggers status notice flashes. Originates in `SpaceEditorPage`.
 */
interface RequestReviewModalProps {
  spaceId: string
  isOpen: boolean
  onClose: () => void
  showNotification: (msg: string) => void
}

/**
 * RequestReviewModal Component.
 * 
 * Purpose:
 * Renders the review request dialog allowing authors to promote their branches
 * from "DRAFT" to "OPEN" (ready for peer review).
 * Provides inputs for review titles and descriptions.
 */
export default function RequestReviewModal({
  spaceId,
  isOpen,
  onClose,
  showNotification,
}: RequestReviewModalProps) {
  const { user } = useAuthStore()
  // Connect change requests version control stores
  const {
    selectedChangeRequestId,
    openChangeRequests,
    requestChangeRequestReview,
    fetchOpenChangeRequests,
  } = useChangeRequestStore()

  // Derived: Current active change request
  const activeCR = openChangeRequests.find((cr) => cr.id === selectedChangeRequestId) ?? null

  // Local Form States
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewDescription, setReviewDescription] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Effect 1: Synchronize form values with active change request data when modal toggles open
  useEffect(() => {
    if (isOpen && activeCR) {
      setReviewTitle(activeCR.title)
      setReviewDescription("")
      setReviewSuccess(false)
    }
  }, [isOpen, activeCR])

  // Early return: Render nothing if modal flag is closed
  if (!isOpen) return null

  /**
   * Action: Submits review request status change to backend.
   * On success, re-fetches open branches list and updates visual indicators.
   */
  const confirmRequestReviewAction = async () => {
    if (!activeCR || !user || !spaceId) return
    setIsReviewing(true)
    const success = await requestChangeRequestReview(activeCR.id, user.id)
    setIsReviewing(false)
    if (success) {
      setReviewSuccess(true)
      // Refetch space branches to synchronize status updates on editor components
      await fetchOpenChangeRequests(spaceId, user.id)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#161618] border border-[#222225] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Request review</h2>
            <p className="text-sm text-[#8e8e93] leading-relaxed">
              Mark your change request as ready for review and notify team members.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8e8e93] hover:text-white rounded-lg transition-colors cursor-pointer mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Template vs Input Form Panels */}
        {reviewSuccess ? (
          <div className="px-6 pb-6 flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center gap-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl px-4 py-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-emerald-400">Review requested!</span>
                <span className="text-xs text-[#8e8e93] mt-0.5">Your team members have been notified to review your changes.</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="px-6 pb-6 flex flex-col gap-5">

              {/* Title input field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Add a title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder={activeCR?.title || "Enter a title..."}
                  className="w-full px-3.5 py-2.5 bg-[#0e0e11] border border-[#3a3a3f] focus:border-indigo-500/60 rounded-lg text-sm text-white placeholder-[#4e4e54] outline-none transition-colors"
                />
                <p className="text-[11px] text-[#8e8e93]">
                  e.g. 'Adding a Welcome page', 'Updating API intro text'
                </p>
              </div>

              {/* Description textarea */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Describe your changes</label>
                <div className="border border-[#2c2c30] focus-within:border-indigo-500/60 rounded-lg overflow-hidden transition-colors bg-[#0e0e11]">
                  <textarea
                    value={reviewDescription}
                    onChange={(e) => setReviewDescription(e.target.value)}
                    placeholder="Add your description here..."
                    rows={4}
                    className="w-full px-3.5 pt-3 pb-1 bg-transparent text-sm text-white placeholder-[#4e4e54] outline-none resize-none"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 border-t border-[#2c2c30]">
                    <button
                      type="button"
                      title="Attach file"
                      className="p-1 text-[#8e8e93] hover:text-white rounded transition-colors cursor-pointer"
                      onClick={() => showNotification("File attachment coming soon!")}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Add emoji"
                      className="p-1 text-[#8e8e93] hover:text-white rounded transition-colors cursor-pointer"
                      onClick={() => showNotification("Emoji picker coming soon!")}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 13s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviewers Selection Panel (Mock options) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Reviewers</span>
                  <button
                    type="button"
                    title="Add reviewer"
                    onClick={() => showNotification("Reviewer selection coming soon!")}
                    className="p-1 text-[#8e8e93] hover:text-white border border-[#2c2c30] hover:border-[#3a3a3f] rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#8e8e93] leading-relaxed">
                  Select specific reviewers, or keep it empty to notify all reviewers in your organization.
                </p>
              </div>

            </div>

            {/* Footer Modal controls */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#1f1f23] bg-[#0e0e11]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#8e8e93] hover:text-white bg-[#1c1c1e] border border-[#2d2d30] rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRequestReviewAction}
                disabled={isReviewing}
                className="px-5 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                {isReviewing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : (
                  <span>Request review</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

