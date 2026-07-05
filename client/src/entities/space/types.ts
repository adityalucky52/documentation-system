import type { Page } from "@entities/page/types"
import type { Site } from "@entities/site/types"

/**
 * Space entity type.
 * Represents a branch/workspace space within a specific documentation site (Git-like).
 * Holds pages and belongs to a Site.
 */
export interface Space {
  id: string
  name: string
  siteId: string
  isTemplate: boolean
  pages?: Page[]
  createdAt: string
  updatedAt: string
}

/**
 * Extended Space type used by the active editor/reader context.
 * Includes full pages array and optional parent site reference.
 */
export interface CurrentSpace extends Space {
  isTemplate: boolean
  pages: Page[]
  site?: Site
}
