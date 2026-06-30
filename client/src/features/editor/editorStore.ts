import { create } from "zustand"
import { useSitesStore, type Page } from "../sites-management/sitesStore"

/**
 * EditorState Interface.
 * Handles page creation and page content updates.
 */
interface EditorState {
  isLoading: boolean
  error: string | null

  createPage: (spaceId: string, title: string, userId: string) => Promise<Page | null>
  updatePage: (pageId: string, title: string, content: string, userId: string) => Promise<Page | null>
}

// REST API Base route for documentation sites management
const API_URL = "http://localhost:5001/api/site"

/**
 * useEditorStore: Zustand store to handle content editing actions.
 * Integrates directly with sites management stores to sync layout page lists.
 */
export const useEditorStore = create<EditorState>((set) => ({
  isLoading: false,
  error: null,

  /**
   * Action: Creates a new page document inside a space.
   * 
   * Context details:
   * 1. Lazy-loads `useChangeRequestStore` to retrieve the current active Git-like branch/change request.
   * 2. Fires POST request to `${API_URL}/spaces/${spaceId}/pages`.
   * 3. Syncs layout: If the user is currently looking at the modified space, appends the new page structure to the UI sites store.
   */
  createPage: async (spaceId, title, userId) => {
    set({ isLoading: true, error: null })
    try {
      // Dynamically import store to resolve circular TypeScript dependency issues
      const { useChangeRequestStore } = await import("../change-requests/changeRequestStore")
      const branchId = useChangeRequestStore.getState().activeBranchId

      const response = await fetch(`${API_URL}/spaces/${spaceId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ title, branchId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create page")

      // Sync pages array on active space in the separate useSitesStore
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

  /**
   * Action: Updates an existing page document's title or markdown content body.
   * 
   * Context details:
   * 1. Lazily fetches active branch state to commit change revisions onto the Git-like branch structure.
   * 2. Fires PUT request to `${API_URL}/pages/${pageId}`.
   * 3. Syncs layout: Updates the corresponding page inside `useSitesStore.getState().currentSpace`.
   */
  updatePage: async (pageId, title, content, userId) => {
    set({ isLoading: true, error: null })
    try {
      // Dynamic import to bypass circular reference warnings
      const { useChangeRequestStore } = await import("../change-requests/changeRequestStore")
      const branchId = useChangeRequestStore.getState().activeBranchId

      const response = await fetch(`${API_URL}/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ title, content, branchId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update page")

      // Update pages array inside useSitesStore to refresh editor UI lists
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

