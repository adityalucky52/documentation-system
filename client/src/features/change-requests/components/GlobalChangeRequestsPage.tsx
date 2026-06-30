import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, User, CheckCircle2, GitMerge } from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useAuthStore } from "../../auth/authStore"
import ChangeRequestReviewPane from "./ChangeRequestReviewPane"

/**
 * GlobalChangeRequestsPage Component.
 * 
 * Purpose:
 * Renders the organization-wide publish/merge history dashboard view.
 * Displays a list of all merged documentation versions across all spaces inside the organization.
 */
export default function GlobalChangeRequestsPage() {
  // Extract org context and current review targets from routes
  const { orgId, changeRequestId } = useParams<{ orgId: string; changeRequestId: string }>()
  const navigate = useNavigate()

  // Fetch session parameters
  const { user } = useAuthStore()
  // Connect change request version control stores
  const { 
    changeRequests, 
    fetchOrgChangeRequests,
    isLoading 
  } = useChangeRequestStore()

  // Effect: Pull list of merged change requests for the organization
  useEffect(() => {
    if (orgId && user) {
      // Fetch only "merged" status change requests
      fetchOrgChangeRequests(orgId, user.id, "merged")
    }
  }, [orgId, user, fetchOrgChangeRequests])

  return (
    <div className="flex-1 flex w-full h-full text-[#f5f5f7] bg-[#0c0c0e] font-sans overflow-hidden">
      
      {/* Middle Column: Merge/Publish History Feed List */}
      <div className="w-[320px] border-r border-[#1f1f23] bg-[#0c0c0e] flex flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Section Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1f1f23] bg-[#0c0c0e] shrink-0">
            <span className="text-[13px] font-semibold text-[#f5f5f7]">Publish History</span>
            {changeRequests.length > 0 && (
              <span className="text-[10px] bg-[#1c1c1e] text-[#8e8e93] px-2 py-0.5 rounded font-bold">
                {changeRequests.length} versions
              </span>
            )}
          </div>

          {/* Change Request Feed List Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {isLoading && changeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-t-indigo-500 border-zinc-700 rounded-full"></div>
                <span className="text-[10px]">Loading history...</span>
              </div>
            ) : changeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#8e8e93] gap-2">
                <GitMerge className="w-8 h-8 text-[#222225]" />
                <span className="text-xs">No publish history found</span>
              </div>
            ) : (
              changeRequests.map((cr) => {
                const spaceName = cr.space?.name || "Space"
                const siteName = cr.space?.site?.name || "Docs"
                const isActive = changeRequestId === cr.id

                return (
                  <div 
                    key={cr.id}
                    onClick={() => navigate(`/o/${orgId}/changes/${cr.id}`)}
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
                          {cr.title}
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
                        <span>{new Date(cr.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>

      {/* Right Column: Comparative Diff Canvas */}
      <div className="flex-1 flex flex-col h-full bg-[#121214] overflow-hidden">
        {changeRequestId ? (
          /* Render diff review panel if ID exists in URL */
          <ChangeRequestReviewPane />
        ) : (
          /* Render Graphic Placeholder if none is active */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
            
            {/* Stacked decorative card visuals */}
            <div className="relative w-[220px] h-[120px] mb-2 flex items-center justify-center">
              {/* Bottom Layer Card */}
              <div className="absolute w-[200px] h-[100px] bg-[#161618] border border-[#222225] rounded-xl translate-y-[-10px] scale-[0.92] opacity-30 shadow-md"></div>
              {/* Middle Layer Card */}
              <div className="absolute w-[200px] h-[100px] bg-[#161618] border border-[#222225] rounded-xl translate-y-[-5px] scale-[0.96] opacity-60 shadow-lg"></div>
              {/* Foreground main mockup card */}
              <div className="absolute w-[200px] h-[100px] bg-[#161618]/95 border border-[#2d2d30] rounded-xl p-3 shadow-2xl flex flex-col justify-between text-left">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/25 rounded-full text-[9px] font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Merged</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="h-1.5 w-24 bg-zinc-800 rounded"></div>
                  <div className="h-1 w-32 bg-zinc-900 rounded"></div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
                </div>
              </div>
            </div>

            {/* Placeholder descriptions typography */}
            <div className="flex flex-col gap-1.5 max-w-[420px]">
              <h2 className="text-sm font-bold text-white tracking-tight">Select a publish log</h2>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Pick a publish log from the list to view the differences merged into the live site.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
