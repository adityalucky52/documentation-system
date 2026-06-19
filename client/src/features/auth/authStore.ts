import { create } from "zustand"

interface User {
  id: string
  email: string
  name: string | null
}

export interface Organization {
  id: string
  name: string
  userId: string
}

interface AuthState {
  user: User | null
  organization: Organization | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  createOrganization: (name: string) => Promise<Organization | null>
  fetchMyOrganization: () => Promise<Organization | null>
}

const API_URL = "http://localhost:5001/api/auth"
const ORG_API_URL = "http://localhost:5001/api/org"

// Helper functions for manual persistence
const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null
  const u = localStorage.getItem("user")
  try {
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

const getStoredOrg = (): Organization | null => {
  if (typeof window === "undefined") return null
  const o = localStorage.getItem("organization")
  try {
    return o ? JSON.parse(o) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  organization: getStoredOrg(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in")
      }

      // Persist values in localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      if (data.organization) {
        localStorage.setItem("organization", JSON.stringify(data.organization))
      } else {
        localStorage.removeItem("organization")
      }

      set({ 
        user: data.user, 
        organization: data.organization || null, 
        isLoading: false 
      })
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.removeItem("organization")

      set({ user: data.user, organization: null, isLoading: false })
      return true
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem("user")
    localStorage.removeItem("organization")
    set({ user: null, organization: null })
  },

  clearError: () => {
    set({ error: null })
  },

  createOrganization: async (name) => {
    const user = get().user
    if (!user) {
      set({ error: "You must be logged in to create an organization" })
      return null
    }

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(ORG_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create organization")
      }

      // Persist the created organization in localStorage
      localStorage.setItem("organization", JSON.stringify(data.organization))

      set({ organization: data.organization, isLoading: false })
      return data.organization
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  },

  fetchMyOrganization: async () => {
    const user = get().user
    if (!user) return null

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${ORG_API_URL}/me`, {
        method: "GET",
        headers: {
          "x-user-id": user.id,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch organization")
      }

      // Sync persistent state
      localStorage.setItem("organization", JSON.stringify(data.organization))

      set({ organization: data.organization, isLoading: false })
      return data.organization
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
      return null
    }
  }
}))
