import { create } from "zustand"

/**
 * Representation of a User object inside the client application.
 */
interface User {
  id: string
  email: string
  name: string | null
}

/**
 * Representation of an Organization object inside the client application.
 * Each site and space belongs to an organization.
 */
export interface Organization {
  id: string
  name: string
  userId: string
}

/**
 * Definition of the Zustand authentication store's state and methods.
 */
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

// REST API endpoint bases for authentication and organization actions
const API_URL = "http://localhost:5001/api/auth"
const ORG_API_URL = "http://localhost:5001/api/org"

/**
 * Helper: retrieves the authenticated user from browser localStorage (manual persistence).
 * Catches parse errors to prevent application crashes when reading modified/invalid stored values.
 */
const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null
  const u = localStorage.getItem("user")
  try {
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

/**
 * Helper: retrieves the currently active organization from browser localStorage.
 */
const getStoredOrg = (): Organization | null => {
  if (typeof window === "undefined") return null
  const o = localStorage.getItem("organization")
  try {
    return o ? JSON.parse(o) : null
  } catch {
    return null
  }
}

/**
 * Zustand hook `useAuthStore` to manage authenticating state globally.
 * Triggers re-renders in components listening to auth states (e.g. DashboardLayout, LoginPage).
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initialize state variables from manual localStorage caching
  user: getStoredUser(),
  organization: getStoredOrg(),
  isLoading: false,
  error: null,

  /**
   * authenticates a user using email and password.
   * Sends a POST request to `${API_URL}/login`.
   * On success: Updates state, stores user/organization in localStorage, returns true.
   * On failure: Populates error state, returns false.
   */
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

      // Persist values in localStorage for session recovery
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

  /**
   * Registers a new user.
   * Sends a POST request to `${API_URL}/register`.
   * On success: Caches user, clears organization state (needs organization setup), returns true.
   * On failure: Populates error state, returns false.
   */
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

  /**
   * Logs out the user.
   * Clears state and removes local storage cookies/items.
   */
  logout: () => {
    localStorage.removeItem("user")
    localStorage.removeItem("organization")
    set({ user: null, organization: null })
  },

  /**
   * Utility action to clear error state messages (useful for resetting form notices on component transitions).
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * Creates a new organization for the current user.
   * API requires x-user-id custom header since backend identifies requests using it.
   */
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

  /**
   * Fetches the organization associated with the logged-in user.
   * Returns null if no organization is configured, or details if it exists.
   */
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

