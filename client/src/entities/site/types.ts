import type { Space } from "@entities/space/types"

/**
 * Site entity type.
 * Represents a documentation site. Contains Spaces.
 * Each Site belongs to an Organization.
 */
export interface Site {
  id: string
  name: string
  isSetup: boolean
  isPublished: boolean
  spaces?: Space[]
  updatedAt: string
}
