import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  GitPullRequest,
  GitMerge,
  Plus,
  Link as LinkIcon,
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useSitesStore } from "../../sites-management/sitesStore"
import { useAuthStore } from "../../auth/authStore"

export default function ChangeRequestReviewPane() {
  const { orgId, changeRequestId } = useParams<{ orgId: string; changeRequestId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    fetchChangeRequestDetail,
    mergeChangeRequest,
    selectChangeRequest,
    fetchOpenChangeRequests,
    requestChangeRequestReview,
  } = useChangeRequestStore()
  const { fetchSpace } = useSitesStore()

  const [loading, setLoading] = useState(true)
  const [crData, setCrData] = useState<any>(null)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [mergeSuccess, setMergeSuccess] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  // Fetch change request details on mount
  useEffect(() => {
    async function loadDetail() {
      if (!changeRequestId || !user) return
      setLoading(true)
      const data = await fetchChangeRequestDetail(changeRequestId, user.id)
      if (data) {
        setCrData(data)
      }
      setLoading(false)
    }
    loadDetail()
  }, [changeRequestId, user, fetchChangeRequestDetail])

  // Handle requesting review for the draft change request directly
  const handleRequestReviewDirectly = async () => {
    if (!changeRequestId || !user) return
    setIsRequesting(true)
    const success = await requestChangeRequestReview(changeRequestId, user.id)
    setIsRequesting(false)
    if (success) {
      // Reload details to show updated status
      const data = await fetchChangeRequestDetail(changeRequestId, user.id)
      if (data) setCrData(data)
      if (data?.changeRequest?.spaceId) {
        await fetchOpenChangeRequests(data.changeRequest.spaceId, user.id)
      }
    }
  }

  // Handle merging the change request directly
  const handleMerge = () => {
    setIsMergeModalOpen(true)
  }

  const confirmMergeAction = async () => {
    if (!changeRequestId || !user || !crData?.changeRequest?.spaceId) return
    setIsMerging(true)
    const targetSpaceId = crData.changeRequest.spaceId
    const success = await mergeChangeRequest(changeRequestId, user.id)
    setIsMerging(false)
    if (success) {
      setMergeSuccess(true)
      // Reload details to show merged state
      const data = await fetchChangeRequestDetail(changeRequestId, user.id)
      if (data) setCrData(data)
      // Clear selected CR workspace since it's merged
      selectChangeRequest(null)
      await fetchSpace(crData.changeRequest.spaceId, user.id)
      if (crData?.changeRequest?.spaceId) {
        await fetchOpenChangeRequests(crData.changeRequest.spaceId, user.id)
      }
    }
  }

  // Open this CR in the editor by selecting it as the active workspace
  const handleOpenInEditor = async () => {
    if (!crData || !user) return
    const targetSpaceId = crData.changeRequest.spaceId
    const crId = crData.changeRequest.id
    // Load the open CRs so selectChangeRequest can find this one
    await fetchOpenChangeRequests(targetSpaceId, user.id)
    selectChangeRequest(crId)
    await fetchSpace(targetSpaceId, user.id, crData.changeRequest.sourceBranchId)
    navigate(`/o/${orgId}/s/${targetSpaceId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 bg-[#121214]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-t-indigo-500 border-zinc-700 rounded-full"></div>
          <span className="text-xs">Loading change request...</span>
        </div>
      </div>
    )
  }

  if (!crData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-[#121214] gap-4">
        <span>Change request not found</span>
      </div>
    )
  }

  const { changeRequest, diffs } = crData
  const isMerged = changeRequest.status === "MERGED"

  return (
    <div className="flex-1 flex flex-col bg-[#121214] overflow-y-auto relative p-8">
      {/* Main Review Section wrapper */}
      <div className="max-w-[840px] w-full mx-auto flex flex-col gap-6">

        {/* Top Header Card */}
        <div className="border border-[#1f1f23] bg-[#0c0c0e]/80 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-xs text-[#8e8e93]">
                <span>Docs</span>
                <span>/</span>
                <span className="flex items-center gap-1">
                  <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Change request #{changeRequest.id.substring(3, 7)}</span>
                </span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight mt-1 block">{changeRequest.title}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isMerged && (
                <button
                  onClick={handleOpenInEditor}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-lg transition-colors cursor-pointer"
                >
                  Open in editor
                </button>
              )}
              {!isMerged && (
                changeRequest.status === "DRAFT" ? (
                  <button
                    onClick={handleRequestReviewDirectly}
                    disabled={isRequesting}
                    className="px-3.5 py-1.5 text-xs font-bold text-black bg-white hover:bg-zinc-100 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-zinc-300"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>{isRequesting ? "Requesting..." : "Request review"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleMerge}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merge</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[#1f1f23] text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-[#8e8e93] font-medium">Status</span>
              <span className={`inline-flex items-center w-max px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${isMerged ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                {changeRequest.status}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[#8e8e93] font-medium">Reviewers</span>
              <button className="flex items-center gap-1 px-2 py-1 bg-[#161618] border border-[#222225] text-[#8e8e93] hover:text-white rounded-md w-max transition-colors text-[10px]">
                <Plus className="w-3 h-3" />
                <span>Add reviewers</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[#8e8e93] font-medium">Participants</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                  G
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[#8e8e93] font-medium">Links</span>
              <button className="flex items-center gap-1 text-[#8e8e93] hover:text-white transition-colors text-[10px] font-semibold">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Add link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Changes Diff Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">Changes</h2>
            <span className="text-xs text-[#8e8e93] font-medium">{diffs.filter((d: any) => d.isModified).length} modification(s)</span>
          </div>

          <div className="flex flex-col gap-4">
            {diffs.map((diff: any) => (
              <div
                key={diff.pageId}
                className="border border-[#1f1f23] bg-[#0c0c0e] rounded-xl overflow-hidden"
              >
                {/* Diff Item Header */}
                <div className="px-4 py-3 bg-[#0e0e11] border-b border-[#1f1f23] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8e8e93]" />
                  <span className="text-xs font-bold text-white">{diff.title || "Untitled Page"}</span>
                </div>

                {/* Diff Content Box */}
                <div className="p-4 flex flex-col gap-4 text-xs font-mono">
                  {/* Title Comparison */}
                  {diff.originalTitle !== diff.title && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider font-sans">Title</span>
                      <div className="flex items-center gap-2 p-2 bg-[#161618] border border-[#222225] rounded-lg">
                        <span className="text-red-400 bg-red-950/20 px-1 py-0.5 rounded line-through">{diff.originalTitle || "None"}</span>
                        <ArrowRight className="w-3 h-3 text-[#8e8e93]" />
                        <span className="text-emerald-400 bg-emerald-950/20 px-1 py-0.5 rounded">{diff.title}</span>
                      </div>
                    </div>
                  )}

                  {/* Content Comparison */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider font-sans">Content Difference</span>
                    <div className="border border-[#1f1f23] rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 text-[11px] leading-relaxed">

                      {/* Original Version */}
                      <div className="p-3 bg-red-950/5 border-r border-[#1f1f23] text-[#8e8e93]">
                        <div className="text-[9px] font-sans font-bold text-red-400 uppercase mb-2">Original State</div>
                        <div className="whitespace-pre-wrap">
                          {diff.originalContent || <span className="italic text-zinc-700">None</span>}
                        </div>
                      </div>

                      {/* New Version */}
                      <div className="p-3 bg-emerald-950/5 text-[#d1d1d6]">
                        <div className="text-[9px] font-sans font-bold text-emerald-400 uppercase mb-2">New State</div>
                        <div className="whitespace-pre-wrap">
                          {diff.content || <span className="italic text-zinc-700">Empty Page</span>}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* GitBook-style Confirm Merge Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161618] border border-[#222225] rounded-xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-[#818cf8]/10 flex items-center justify-center text-[#818cf8]">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white">Merge change request</h3>
                <span className="text-[10px] text-[#8e8e93]">#{changeRequest.id.substring(3, 7)}</span>
              </div>
            </div>

            {mergeSuccess ? (
              <div className="flex flex-col gap-4 py-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Successfully merged to main!</span>
                </div>
                <p className="text-xs text-[#8e8e93] leading-relaxed">
                  All edits from this change request have been successfully published to the live documentation.
                </p>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setIsMergeModalOpen(false)
                      setMergeSuccess(false)
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsMergeModalOpen(false)
                      setMergeSuccess(false)
                      navigate(`/o/${orgId}/s/${changeRequest.spaceId}`)
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-black bg-white hover:bg-white/90 rounded-lg cursor-pointer"
                  >
                    Go to Space
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-2">
                <p className="text-xs text-[#8e8e93] leading-relaxed">
                  Are you sure you want to merge <strong>{changeRequest.title}</strong>? This will write all edits directly to the live site.
                </p>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setIsMergeModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#8e8e93] hover:text-white bg-[#1c1c1e] border border-[#2d2d30] rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmMergeAction}
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
      )}
    </div>
  )
}
