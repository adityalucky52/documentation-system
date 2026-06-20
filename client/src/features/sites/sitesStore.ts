import { create } from "zustand"

export interface Page {
  id: string
  title: string
  content: string
  spaceId: string
  createdAt: string
  updatedAt: string
}

export interface Space {
  id: string
  name: string
  siteId: string
  pages?: Page[]
  createdAt: string
  updatedAt: string
}

export interface Site {
  id: string
  name: string
  isSetup: boolean
  spaces?: Space[]
  updatedAt: string
}

interface SitesState {
  sites: Site[]
  currentSpace: (Space & { pages: Page[]; site?: Site }) | null
  isLoading: boolean
  error: string | null
  isCreateModalOpen: boolean
  setCreateModalOpen: (isOpen: boolean) => void
  fetchSites: (userId: string) => Promise<void>
  addSite: (name: string, userId: string) => Promise<string | null>
  setupSite: (siteId: string, type: string, userId: string) => Promise<boolean>
  fetchSpace: (spaceId: string, userId: string) => Promise<void>
  createPage: (spaceId: string, title: string, userId: string) => Promise<Page | null>
  updatePage: (pageId: string, title: string, content: string, userId: string) => Promise<Page | null>
  deleteSite: (siteId: string, userId: string) => Promise<boolean>
}

const API_URL = "http://localhost:5001/api/site"

export const useSitesStore = create<SitesState>((set, get) => ({
  sites: [],
  currentSpace: null,
  isLoading: false,
  error: null,
  isCreateModalOpen: false,
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  
  fetchSites: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "x-user-id": userId
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sites")
      }
      
      const mappedSites = data.sites.map((site: any) => ({
        id: site.id,
        name: site.name,
        isSetup: site.isSetup,
        spaces: site.spaces,
        updatedAt: new Date(site.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }))

      set({ sites: mappedSites, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },

  addSite: async (name, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ name })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create site")
      }

      const newSite: Site = {
        id: data.site.id,
        name: data.site.name,
        isSetup: data.site.isSetup,
        spaces: data.site.spaces || [],
        updatedAt: "now"
      }

      set((state) => ({
        sites: [newSite, ...state.sites],
        isLoading: false
      }))
      return data.site.id
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  setupSite: async (siteId, type, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/${siteId}/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ type })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to setup site")
      }

      const updatedSite: Site = {
        id: data.site.id,
        name: data.site.name,
        isSetup: data.site.isSetup,
        spaces: data.site.spaces || [],
        updatedAt: new Date(data.site.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }

      set((state) => ({
        sites: state.sites.map((s) => s.id === siteId ? updatedSite : s),
        isLoading: false
      }))
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  },

  fetchSpace: async (spaceId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/spaces/${spaceId}`, {
        method: "GET",
        headers: {
          "x-user-id": userId
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch space details")
      }

      set({ currentSpace: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },

  createPage: async (spaceId, title, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/spaces/${spaceId}/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ title })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create page")
      }

      const current = get().currentSpace
      if (current && current.id === spaceId) {
        set({
          currentSpace: {
            ...current,
            pages: [...current.pages, data]
          }
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
      const response = await fetch(`${API_URL}/pages/${pageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ title, content })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update page")
      }

      const current = get().currentSpace
      if (current) {
        set({
          currentSpace: {
            ...current,
            pages: current.pages.map((p) => p.id === pageId ? data : p)
          }
        })
      }

      set({ isLoading: false })
      return data
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  deleteSite: async (siteId, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/${siteId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": userId
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete site")
      }

      set((state) => ({
        sites: state.sites.filter((s) => s.id !== siteId),
        isLoading: false
      }))
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  }
}))
