import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  GitPullRequest,
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useAuthStore } from "../../auth/authStore"

/**
 * ChangeRequestReviewPane Component.
 * 
 * Purpose:
 * Renders the detail analysis panel for a selected merged documentation version.
 * Displays:
 * 1. Publish/Merge metadata.
 * 2. Visual side-by-side comparative text difference highlights (Original vs Published).
 */
export default function ChangeRequestReviewPane() {
  // Extract route parameters
  const { changeRequestId } = useParams<{ changeRequestId: string }>()
  const { user } = useAuthStore()

  const { fetchChangeRequestDetail } = useChangeRequestStore()

  // Local UI States
  const [loading, setLoading] = useState(true)
  const [crData, setCrData] = useState<any>(null)

  // Effect: Query full diff content schemas on component mount or changeRequestId switches
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

  // Loading boundary state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 bg-[#121214]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-t-indigo-500 border-zinc-700 rounded-full"></div>
          <span className="text-xs">Loading publish detail...</span>
        </div>
      </div>
    )
  }

  // Not Found boundary state
  if (!crData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-[#121214] gap-4">
        <span>Publish log not found</span>
      </div>
    )
  }

  // Extract change request properties and comparative diff arrays
  const { changeRequest, diffs } = crData

  return (
    <div className="flex-1 flex flex-col bg-[#121214] overflow-y-auto relative p-8 font-sans">
      <div className="max-w-[840px] w-full mx-auto flex flex-col gap-6">

        {/* Top Header Card: Title, Status, and Info */}
        <div className="border border-[#1f1f23] bg-[#0c0c0e]/80 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {/* Breadcrumbs path */}
              <div className="flex items-center gap-1.5 text-xs text-[#8e8e93]">
                <span>Docs</span>
                <span>/</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Publish Version #{changeRequest.id.substring(3, 7)}</span>
                </span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight mt-1 block">{changeRequest.title}</span>
            </div>

            <span className="shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Merged
            </span>
          </div>

          {/* Metadata Row */}
          <div className="pt-4 border-t border-[#1f1f23] text-xs flex flex-col gap-1.5">
            <span className="text-[#8e8e93] font-medium">Published by</span>
            <span className="text-white font-semibold">You (Author)</span>
          </div>
        </div>

        {/* Changes Diff Panel: Loops over differences and highlights comparative splits */}
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

                {/* Diff Comparison Canvas */}
                <div className="p-4 flex flex-col gap-4 text-xs font-mono">
                  {/* Title Diff */}
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

                  {/* Body Content Diff */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider font-sans">Content Difference</span>
                    <div className="border border-[#1f1f23] rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 text-[11px] leading-relaxed">

                      {/* Original Version Block */}
                      <div className="p-3 bg-red-950/5 border-r border-[#1f1f23] text-[#8e8e93]">
                        <div className="text-[9px] font-sans font-bold text-red-400 uppercase mb-2">Original State</div>
                        <div className="whitespace-pre-wrap">
                          {diff.originalContent || <span className="italic text-zinc-700">None</span>}
                        </div>
                      </div>

                      {/* Revised Version Block */}
                      <div className="p-3 bg-emerald-950/5 text-[#d1d1d6]">
                        <div className="text-[9px] font-sans font-bold text-emerald-400 uppercase mb-2">Published State</div>
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
    </div>
  )
}
