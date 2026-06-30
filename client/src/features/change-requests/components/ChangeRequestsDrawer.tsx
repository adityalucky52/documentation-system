import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { X, Calendar, User, CheckCircle2, GitMerge } from "lucide-react"
import { useChangeRequestStore } from "../changeRequestStore"
import { useAuthStore } from "../../auth/authStore"

/**
 * ChangeRequestsDrawer Props.
 * @param onClose - Callback to close/dismiss the drawer overlay. Originates in `SpaceEditorPage`.
 */
interface ChangeRequestsDrawerProps {
  onClose: () => void
}

/**
 * ChangeRequestsDrawer Component.
 * 
 * Purpose:
 * Renders the sliding side drawer displaying space-level publish history.
 * Allows authors to browse previous merged versions of documentation.
 */
export default function ChangeRequestsDrawer({ onClose }: ChangeRequestsDrawerProps) {
  // Retrieve space and org parameters from route paths
  const { spaceId, orgId } = useParams<{ spaceId: string; orgId: string }>()
  const navigate = useNavigate()
  
  const { user } = useAuthStore()
  // Connect change requests version control stores
  const { 
    changeRequests, 
    fetchChangeRequests
  } = useChangeRequestStore()

  // Effect: Query merged change requests for the space on mount or space changes
  useEffect(() => {
    if (spaceId && user) {
      // Force fetching only merged entries
      fetchChangeRequests(spaceId, user.id, "merged")
    }
  }, [spaceId, user, fetchChangeRequests])

  /**
   * Action: Navigates router state to inspection review pane `/o/:orgId/s/:spaceId/~/changes/:crId`.
   */
  const handleOpenReviewPane = (crId: string) => {
    navigate(`/o/${orgId}/s/${spaceId}/~/changes/${crId}`)
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-[380px] bg-[#0e0e11] border-l border-[#1f1f23] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 font-sans">
      
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1f1f23] bg-[#0c0c0e]">
        <div className="flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Publish History</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-[#1a1a1e] rounded text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Change Request Listing */}
        <div className="flex flex-col gap-2">
          {changeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#8e8e93] gap-2">
              <GitMerge className="w-8 h-8 text-[#222225]" />
              <span className="text-xs">No publish logs found</span>
            </div>
          ) : (
            changeRequests.map((cr) => (
              <div 
                key={cr.id}
                onClick={() => handleOpenReviewPane(cr.id)}
                className="p-3 border border-[#1f1f23] hover:border-[#323236] bg-[#121214] rounded-lg flex flex-col gap-2 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate leading-snug group-hover:text-indigo-400 transition-colors">
                      {cr.title}
                    </span>
                  </div>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                    Merged
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8e8e93]">
                  <span className="flex items-center gap-0.5">
                    <User className="w-3 h-3" />
                    <span>You</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(cr.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  )
}
