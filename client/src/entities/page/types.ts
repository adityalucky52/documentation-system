/**
 * Page entity type.
 * Represents a documentation page document inside a Space.
 * Consumed by editor, reader, public, and spaces features.
 */
export interface Page {
  id: string
  title: string
  content: string
  spaceId: string
  createdAt: string
  updatedAt: string
}
