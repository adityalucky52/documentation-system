import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, User, CheckCircle2, GitMerge } from "lucide-react"
import { useEditorStore } from "../../editor/editorStore"
import { useAuthStore } from "../../auth/authStore"

/**
 * GlobalChangeRequestsPage Component.
 * 
 * Purpose:
 * Renders the organization-wide publish/merge history dashboard view.
 * Displays a list of all merged documentation versions across all spaces inside the organization.
 */
export default function GlobalChangeRequestsPage() {
  const { orgId, changeRequestId } = useParams<{ orgId: string; changeRequestId: string }>()
  const navigate = useNavigate()

  const { user } = useAuthStore()
  const { mergeLogs, fetchOrgMergeLogs, isLoading } = useEditorStore()

  // Fetch merge logs on mount or org/user context change
  useEffect(() => {
    if (orgId && user) {
      fetchOrgMergeLogs(orgId, user.id)
    }
  }, [orgId, user, fetchOrgMergeLogs])

  const selectedLog = mergeLogs.find((log) => log.id === changeRequestId)

  return (
    <div className="flex-1 flex w-full h-full text-[#f5f5f7] bg-[#0c0c0e] font-sans overflow-hidden">
      
      {/* Left Column: Merge/Publish History Feed List */}
      <div className="w-[320px] border-r border-[#1f1f23] bg-[#0c0c0e] flex flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Section Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1f1f23] bg-[#0c0c0e] shrink-0">
            <span className="text-[13px] font-semibold text-[#f5f5f7]">Publish History</span>
            {mergeLogs.length > 0 && (
              <span className="text-[10px] bg-[#1c1c1e] text-[#8e8e93] px-2 py-0.5 rounded font-bold">
                {mergeLogs.length} versions
              </span>
            )}
          </div>

          {/* Change Request Feed List Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {isLoading && mergeLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-t-indigo-500 border-zinc-700 rounded-full"></div>
                <span className="text-[10px]">Loading history...</span>
              </div>
            ) : mergeLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#8e8e93] gap-2">
                <GitMerge className="w-8 h-8 text-[#222225]" />
                <span className="text-xs">No publish history found</span>
              </div>
            ) : (
              mergeLogs.map((log) => {
                const spaceName = log.space?.name || "Space"
                const siteName = log.space?.site?.name || "Docs"
                const isActive = changeRequestId === log.id

                return (
                  <div 
                    key={log.id}
                    onClick={() => navigate(`/o/${orgId}/changes/${log.id}`)}
                    className={`p-3 border rounded-lg flex flex-col gap-2 transition-all cursor-pointer group ${isActive ? "bg-[#1c1c1e] border-indigo-500/35" : "border-[#1f1f23] hover:border-[#323236] bg-[#121214]"}`}
                  >
                    {/* Site & Space labels */}
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span>{siteName}</span>
                      <span>/</span>
                      <span>{spaceName}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className={`text-xs font-bold text-white truncate leading-snug group-hover:text-indigo-400 transition-colors ${isActive ? "text-indigo-400" : ""}`}>
                          {log.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8e8e93]">
                      <span className="flex items-center gap-0.5">
                        <User className="w-3 h-3" />
                        <span>Published by You</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(log.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Visual Detailed Card of the Selected Version */}
      <div className="flex-1 bg-[#121214] flex flex-col overflow-y-auto">
        {selectedLog ? (
          <div className="p-8 max-w-[640px] w-full mx-auto flex flex-col gap-6 font-sans">
            <div className="border border-[#1f1f23] bg-[#0c0c0e]/80 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#8e8e93]">
                    <span>Publish Version</span>
                    <span>/</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>#{selectedLog.id.substring(0, 8)}</span>
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-white tracking-tight mt-1">{selectedLog.title}</span>
                </div>
                <span className="shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live
                </span>
              </div>

              <div className="pt-4 border-t border-[#1f1f23] flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8e8e93]">Target Space</span>
                  <span className="text-white font-semibold">{selectedLog.space?.name || "Space"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8e8e93]">Published By</span>
                  <span className="text-white font-semibold">You (Author)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8e8e93]">Publish Timestamp</span>
                  <span className="text-white font-semibold">
                    {new Date(selectedLog.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8e8e93] gap-2">
            <GitMerge className="w-12 h-12 text-[#2c2c30]" />
            <p className="text-sm font-medium">Select a publish version to view details.</p>
          </div>
        )}
      </div>
    </div>
  )
}
