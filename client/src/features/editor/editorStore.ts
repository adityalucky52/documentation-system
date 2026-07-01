import { create } from "zustand"
import { useSitesStore, type Page } from "../sites-management/sitesStore"

/**
 * EditorState Interface.
 * Handles page creation and page content updates.
 */
interface EditorState {
  isLoading: boolean
  error: string | null
  mergeLogs: any[]

  createPage: (spaceId: string, title: string, userId: string) => Promise<Page | null>
  updatePage: (pageId: string, title: string, content: string, userId: string) => Promise<Page | null>
  fetchMergeLogs: (spaceId: string, userId: string) => Promise<void>
  fetchOrgMergeLogs: (orgId: string, userId: string) => Promise<void>
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
  mergeLogs: [],

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
      const branchId = `${spaceId}-draft`

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
      const spaceId = useSitesStore.getState().currentSpace?.id
      const branchId = spaceId ? `${spaceId}-draft` : undefined

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

  /**
   * Action: Queries space merge logs history.
   */
  fetchMergeLogs: async (spaceId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/spaces/${spaceId}/merge-logs`, {
        method: "GET",
        headers: { "x-user-id": userId }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch merge logs")
      set({ mergeLogs: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },

  /**
   * Action: Queries all organization-wide merge logs.
   */
  fetchOrgMergeLogs: async (orgId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/orgs/${orgId}/merge-logs`, {
        method: "GET",
        headers: { "x-user-id": userId }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch organization merge logs")
      set({ mergeLogs: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },
}))

