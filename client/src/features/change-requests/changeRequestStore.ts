import { create } from "zustand"

export interface ChangeRequest {
  id: string
  title: string
  status: "DRAFT" | "OPEN" | "MERGED" | "CLOSED"
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
  requestChangeRequestReview: (changeRequestId: string, userId: string) => Promise<boolean>
  fetchChangeRequestDetail: (changeRequestId: string, userId: string) => Promise<any>
  fetchOrgChangeRequests: (orgId: string, userId: string, status?: string) => Promise<void>
}

export const useChangeRequestStore = create<ChangeRequestState>((set, get) => ({
  changeRequests: [],
  selectedChangeRequestId: null,
  openChangeRequests: [],
  activeBranchId: null,
  isLoading: false,
  error: null,

  selectChangeRequest: (crId) => {
    const { openChangeRequests } = get()
    const cr = openChangeRequests.find((c) => c.id === crId) ?? null
    set({
      selectedChangeRequestId: crId,
      activeBranchId: cr ? cr.sourceBranchId : null,
    })
  },

  fetchOpenChangeRequests: async (spaceId, userId) => {
    try {
      const [draftRes, openRes] = await Promise.all([
        fetch(`http://localhost:5001/api/vc/spaces/${spaceId}/change-requests?status=draft`, {
          headers: { "x-user-id": userId },
        }),
        fetch(`http://localhost:5001/api/vc/spaces/${spaceId}/change-requests?status=open`, {
          headers: { "x-user-id": userId },
        }),
      ])
      const drafts = draftRes.ok ? await draftRes.json() : []
      const opens = openRes.ok ? await openRes.json() : []
      const combined: ChangeRequest[] = [...drafts, ...opens]
      set({ openChangeRequests: combined })

      const { selectedChangeRequestId } = get()
      if (selectedChangeRequestId && !combined.find((c) => c.id === selectedChangeRequestId)) {
        set({ selectedChangeRequestId: null, activeBranchId: null })
      }
    } catch {
      // Non-critical
    }
  },

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

  requestChangeRequestReview: async (changeRequestId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `http://localhost:5001/api/vc/change-requests/${changeRequestId}/review`,
        { method: "PUT", headers: { "x-user-id": userId } }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to request review")
      set((state) => ({
        changeRequests: state.changeRequests.map((cr) =>
          cr.id === changeRequestId ? { ...cr, status: "OPEN" } : cr
        ),
        openChangeRequests: state.openChangeRequests.map((cr) =>
          cr.id === changeRequestId ? { ...cr, status: "OPEN" } : cr
        ),
        isLoading: false,
      }))
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  },

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
