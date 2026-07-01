import { create } from "zustand"

/**
 * ChangeRequest Interface.
 * Maps metadata for the Git-like document branching system.
 */
export interface ChangeRequest {
  id: string
  title: string
  status: "OPEN" | "MERGED" | "CLOSED"
  spaceId: string
  sourceBranchId: string
  sourceBranch?: { id: string; name: string }
  targetBranchId: string
  creatorId: string
  createdAt: string
  updatedAt: string
  space?: {
    id: string
    name: string
    site?: {
      id: string
      name: string
    }
  }
}

/**
 * ChangeRequestState Interface.
 * Manages active branch states, list array caches, loading states, and API CRUD triggers.
 */
interface ChangeRequestState {
  changeRequests: ChangeRequest[]
  selectedChangeRequestId: string | null
  openChangeRequests: ChangeRequest[]
  activeBranchId: string | null
  isLoading: boolean
  error: string | null

  selectChangeRequest: (crId: string | null) => void
  fetchOpenChangeRequests: (spaceId: string, userId: string) => Promise<void>
  fetchChangeRequests: (spaceId: string, userId: string, status?: string) => Promise<void>
  createChangeRequest: (spaceId: string, title: string, userId: string) => Promise<ChangeRequest | null>
  mergeChangeRequest: (changeRequestId: string, userId: string) => Promise<boolean>
  fetchChangeRequestDetail: (changeRequestId: string, userId: string) => Promise<any>
  fetchOrgChangeRequests: (orgId: string, userId: string, status?: string) => Promise<void>
}

/**
 * useChangeRequestStore.
 * Zustand store executing version control requests (branches creation, draft updates, merge commits).
 */
export const useChangeRequestStore = create<ChangeRequestState>((set, get) => ({
  changeRequests: [],
  selectedChangeRequestId: null,
  openChangeRequests: [],
  activeBranchId: null,
  isLoading: false,
  error: null,

  /**
   * Action: Selects and activates a change request branch.
   * Updates state IDs to route write transactions to the source branch context.
   */
  selectChangeRequest: (crId) => {
    const { openChangeRequests } = get()
    const cr = openChangeRequests.find((c) => c.id === crId) ?? null
    set({
      selectedChangeRequestId: crId,
      activeBranchId: cr ? cr.sourceBranchId : null,
    })
  },

  /**
   * Action: Fetches open change requests.
   * Helps synchronize active selection references in case elements were deleted on backend.
   */
  fetchOpenChangeRequests: async (spaceId, userId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/vc/spaces/${spaceId}/change-requests?status=open`,
        { headers: { "x-user-id": userId } }
      )
      const opens = response.ok ? await response.json() : []
      set({ openChangeRequests: opens })

      // Clean up stale selections if no longer present in lists
      const { selectedChangeRequestId } = get()
      if (selectedChangeRequestId && !opens.find((c) => c.id === selectedChangeRequestId)) {
        set({ selectedChangeRequestId: null, activeBranchId: null })
      }
    } catch {
      // Non-critical loading failures fail silently
    }
  },

  /**
   * Action: Queries space change requests matching specific status filters.
   */
  fetchChangeRequests: async (spaceId, userId, status) => {
    set({ isLoading: true, error: null })
    try {
      const query = status ? `?status=${status}` : ""
      const response = await fetch(
        `http://localhost:5001/api/vc/spaces/${spaceId}/change-requests${query}`,
        { method: "GET", headers: { "x-user-id": userId } }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch change requests")
      set({ changeRequests: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },

  /**
   * Action: Creates a new Change Request branch for safe content editing.
   * Fires POST request and appends results to state collections.
   */
  createChangeRequest: async (spaceId, title, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `http://localhost:5001/api/vc/spaces/${spaceId}/change-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({ title }),
        }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create change request")
      set((state) => ({
        changeRequests: [data, ...state.changeRequests],
        openChangeRequests: [data, ...state.openChangeRequests],
        isLoading: false,
      }))
      return data
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  /**
   * Action: Merges a branch back into the main branch.
   * Fires PUT request to merge endpoint.
   * Toggles status flags, removes entry from active open requests list, and resets active selections.
   */
  mergeChangeRequest: async (changeRequestId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `http://localhost:5001/api/vc/change-requests/${changeRequestId}/merge`,
        { method: "PUT", headers: { "x-user-id": userId } }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to merge change request")
      set((state) => ({
        changeRequests: state.changeRequests.map((cr) =>
          cr.id === changeRequestId ? { ...cr, status: "MERGED" } : cr
        ),
        openChangeRequests: state.openChangeRequests.filter((cr) => cr.id !== changeRequestId),
        selectedChangeRequestId:
          state.selectedChangeRequestId === changeRequestId ? null : state.selectedChangeRequestId,
        activeBranchId:
          state.selectedChangeRequestId === changeRequestId ? null : state.activeBranchId,
        isLoading: false,
      }))
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  },



  /**
   * Action: Fetches diff schemas and full body records of a specific change request.
   */
  fetchChangeRequestDetail: async (changeRequestId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `http://localhost:5001/api/vc/change-requests/${changeRequestId}`,
        { method: "GET", headers: { "x-user-id": userId } }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch change request details")
      set({ isLoading: false })
      return data
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  /**
   * Action: Fetches all active branch change requests globally under the active organization.
   */
  fetchOrgChangeRequests: async (orgId, userId, status) => {
    set({ isLoading: true, error: null })
    try {
      const query = status ? `?status=${status}` : ""
      const response = await fetch(
        `http://localhost:5001/api/vc/orgs/${orgId}/change-requests${query}`,
        { method: "GET", headers: { "x-user-id": userId } }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch organization change requests")
      set({ changeRequests: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },
}))

