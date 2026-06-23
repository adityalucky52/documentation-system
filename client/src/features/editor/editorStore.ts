import { create } from "zustand"
import { useSitesStore, type Page } from "../sites-management/sitesStore"

interface EditorState {
  isLoading: boolean
  error: string | null

  createPage: (spaceId: string, title: string, userId: string) => Promise<Page | null>
  updatePage: (pageId: string, title: string, content: string, userId: string) => Promise<Page | null>
}

const API_URL = "http://localhost:5001/api/site"

export const useEditorStore = create<EditorState>((set, get) => ({
  isLoading: false,
  error: null,

  createPage: async (spaceId, title, userId) => {
    set({ isLoading: true, error: null })
    try {
      const { useChangeRequestStore } = await import("../change-requests/changeRequestStore")
      const branchId = useChangeRequestStore.getState().activeBranchId

      const response = await fetch(`${API_URL}/spaces/${spaceId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ title, branchId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create page")

      const current = useSitesStore.getState().currentSpace
      if (current && current.id === spaceId) {
        useSitesStore.setState({
          currentSpace: { ...current, pages: [...current.pages, data] },
        })
      }

      set({ isLoading: false })
      return data
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  updatePage: async (pageId, title, content, userId) => {
    set({ isLoading: true, error: null })
    try {
      const { useChangeRequestStore } = await import("../change-requests/changeRequestStore")
      const branchId = useChangeRequestStore.getState().activeBranchId

      const response = await fetch(`${API_URL}/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ title, content, branchId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update page")

      const current = useSitesStore.getState().currentSpace
      if (current) {
        useSitesStore.setState({
          currentSpace: {
            ...current,
            pages: current.pages.map((p) => (p.id === pageId ? data : p)),
          },
        })
      }

      set({ isLoading: false })
      return data
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },
}))
