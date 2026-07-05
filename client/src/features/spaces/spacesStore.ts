import { create } from "zustand"
import type { Page } from "@entities/page/types"
import type { Space, CurrentSpace } from "@entities/space/types"
import type { Site } from "@entities/site/types"

// Re-export entity types for backward compatibility with existing imports
export type { Page, Space, Site }

/**
 * Zustand State Interface for spaces management.
 */
interface SpacesState {
  sites: Site[]
  currentSpace: CurrentSpace | null
  isLoading: boolean
  error: string | null
  isCreateModalOpen: boolean

  setCreateModalOpen: (isOpen: boolean) => void
  fetchSites: (userId: string) => Promise<void>
  addSite: (name: string, userId: string) => Promise<string | null>
  setupSite: (siteId: string, type: string, userId: string, importData?: { title: string; content: string }) => Promise<Site | null>
  fetchSpace: (spaceId: string, userId: string, branchId?: string) => Promise<void>
  deleteSite: (siteId: string, userId: string) => Promise<boolean>
  publishSite: (siteId: string, userId: string) => Promise<boolean>
}

// REST API Base route for documentation sites management
const API_URL = "http://localhost:5001/api/site"

/**
 * useSpacesStore: Zustand store to handle CRUD operations on sites, spaces, and active workspace configurations.
 * Renamed from useSitesStore (was in sites-management/sitesStore.ts).
 */
export const useSpacesStore = create<SpacesState>((set) => ({
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

      const mappedSites = data.sites.map((site: Site & { updatedAt: string }) => ({
        id: site.id,
        name: site.name,
        isSetup: site.isSetup,
        isPublished: site.isPublished,
        spaces: site.spaces,
        updatedAt: new Date(site.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))

      set({ sites: mappedSites, isLoading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      set({ error: message, isLoading: false })
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
        isPublished: data.site.isPublished || false,
        spaces: data.site.spaces || [],
        updatedAt: "now",
      }

      set((state) => ({ sites: [newSite, ...state.sites], isLoading: false }))
      return data.site.id
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      set({ error: message, isLoading: false })
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
        isPublished: data.site.isPublished || false,
        spaces: data.site.spaces || [],
        updatedAt: new Date(data.site.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      set((state) => ({
        sites: state.sites.map((s) => (s.id === siteId ? updatedSite : s)),
        isLoading: false,
      }))
      return updatedSite
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      set({ error: message, isLoading: false })
      return null
    }
  },

  /**
   * Action: Loads full details of a specific workspace space, including nested pages.
   */
  fetchSpace: async (spaceId, userId, branchId) => {
    set({ isLoading: true, error: null })
    try {
      const url = branchId
        ? `${API_URL}/spaces/${spaceId}?branchId=${branchId}`
        : `${API_URL}/spaces/${spaceId}`

      const response = await fetch(url, {
        method: "GET",
        headers: { "x-user-id": userId },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch space details")

      set({ currentSpace: data, isLoading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      set({ error: message, isLoading: false })
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

      set((state) => ({ sites: state.sites.filter((s) => s.id !== siteId), isLoading: false }))
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      set({ error: message, isLoading: false })
      return false
    }
  },

  /**
   * Action: Publish a documentation site to make its spaces accessible to the public.
   */
  publishSite: async (siteId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/${siteId}/publish`, {
        method: "POST",
        headers: { "x-user-id": userId },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to publish site")

      set((state) => ({
        sites: state.sites.map((s) =>
          s.id === siteId ? { ...s, isPublished: true } : s
        ),
        isLoading: false,
      }))
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      set({ error: message, isLoading: false })
      return false
    }
  },
}))

/**
 * Backward-compatibility alias.
 * Components that still import useSitesStore will continue to work.
 * @deprecated Use useSpacesStore instead.
 */
export const useSitesStore = useSpacesStore
