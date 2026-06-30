import { create } from "zustand"

/**
 * Page Interface.
 * Represents a documentation page document.
 */
export interface Page {
  id: string
  title: string
  content: string
  spaceId: string
  createdAt: string
  updatedAt: string
}

/**
 * Space Interface.
 * Represents a branch/workspace space within a specific documentation site (Git-like).
 * Holds pages.
 */
export interface Space {
  id: string
  name: string
  siteId: string
  pages?: Page[]
  createdAt: string
  updatedAt: string
}

/**
 * Site Interface.
 * Represents a documentation site. Contains spaces.
 */
export interface Site {
  id: string
  name: string
  isSetup: boolean
  spaces?: Space[]
  updatedAt: string
}

/**
 * Zustand State Interface for sites management.
 */
interface SitesState {
  sites: Site[] // List of all organization documentation sites
  currentSpace: (Space & { pages: Page[]; site?: Site }) | null // The currently active editor workspace space
  isLoading: boolean
  error: string | null
  isCreateModalOpen: boolean // UI visibility flag for CreateSiteModal

  setCreateModalOpen: (isOpen: boolean) => void
  fetchSites: (userId: string) => Promise<void>
  addSite: (name: string, userId: string) => Promise<string | null>
  setupSite: (siteId: string, type: string, userId: string, importData?: { title: string; content: string }) => Promise<boolean>
  fetchSpace: (spaceId: string, userId: string, branchId?: string) => Promise<void>
  deleteSite: (siteId: string, userId: string) => Promise<boolean>
}

// REST API Base route for documentation sites management
const API_URL = "http://localhost:5001/api/site"

/**
 * useSitesStore: Zustand store to handle CRUD operations on sites, spaces, and active workspace configurations.
 */
export const useSitesStore = create<SitesState>((set) => ({
  sites: [],
  currentSpace: null,
  isLoading: false,
  error: null,
  isCreateModalOpen: false,

  /**
   * Action: Sets the visibility of the new site creation dialog drawer.
   */
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

  /**
   * Action: Fetches all sites available in the user's active organization.
   * Sends user credentials via custom 'x-user-id' header.
   */
  fetchSites: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "x-user-id": userId },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch sites")

      // Map raw dates into reader-friendly formatted strings
      const mappedSites = data.sites.map((site: any) => ({
        id: site.id,
        name: site.name,
        isSetup: site.isSetup,
        spaces: site.spaces,
        updatedAt: new Date(site.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))

      set({ sites: mappedSites, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },

  /**
   * Action: Instantiates a new site shell.
   * Returns the new site's unique identifier.
   */
  addSite: async (name, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ name }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create site")

      const newSite: Site = {
        id: data.site.id,
        name: data.site.name,
        isSetup: data.site.isSetup,
        spaces: data.site.spaces || [],
        updatedAt: "now",
      }

      // Prepend the new site to the active lists array
      set((state) => ({ sites: [newSite, ...state.sites], isLoading: false }))
      return data.site.id
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  /**
   * Action: Completes onboarding configuration for a site.
   * Prompts if a user chooses to start with empty docs or imports markdown templates.
   */
  setupSite: async (siteId, type, userId, importData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/${siteId}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ type, ...importData }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to setup site")

      const updatedSite: Site = {
        id: data.site.id,
        name: data.site.name,
        isSetup: data.site.isSetup,
        spaces: data.site.spaces || [],
        updatedAt: new Date(data.site.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      // Update the modified site in the stores list
      set((state) => ({
        sites: state.sites.map((s) => (s.id === siteId ? updatedSite : s)),
        isLoading: false,
      }))
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  },

  /**
   * Action: Loads full details of a specific workspace space, including nested pages.
   * 
   * Dynamic Import & Circular Dependency Mitigation:
   * Dynamically loads `useChangeRequestStore` inside the function runtime. This resolves
   * TypeScript compiler circular imports (where sitesStore needs changeRequestStore, and vice-versa).
   */
  fetchSpace: async (spaceId, userId, branchId) => {
    set({ isLoading: true, error: null })
    try {
      // Lazy load to bypass circular imports
      const { useChangeRequestStore } = await import("../change-requests/changeRequestStore")
      
      // Fallback: If no custom branchId is explicitly passed, fetch the store's current active branch (Git mode context)
      const resolvedBranchId = branchId ?? useChangeRequestStore.getState().activeBranchId
      const url = resolvedBranchId
        ? `${API_URL}/spaces/${spaceId}?branchId=${resolvedBranchId}`
        : `${API_URL}/spaces/${spaceId}`

      const response = await fetch(url, {
        method: "GET",
        headers: { "x-user-id": userId },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch space details")

      set({ currentSpace: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },

  /**
   * Action: Deletes a site.
   */
  deleteSite: async (siteId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/${siteId}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to delete site")

      // Remove deleted item from the store's sites array
      set((state) => ({ sites: state.sites.filter((s) => s.id !== siteId), isLoading: false }))
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  },
}))

