/**
 * User entity type.
 * Representation of an authenticated User object inside the client application.
 */
export interface User {
  id: string
  email: string
  name: string | null
}
