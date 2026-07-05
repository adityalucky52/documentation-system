/**
 * Data Transfer Objects (DTOs) for Spaces Feature.
 * 
 * Purpose:
 * Enforces type contracts for HTTP requests managing documentation sites.
 */

/**
 * CreateSiteDto.
 * Request format for POST `/api/site` payloads.
 */
export interface CreateSiteDto {
  name: string
}

/**
 * SetupSiteDto.
 * Request format for POST `/api/site/:siteId/setup` payloads.
 * Used when initializing a site from templates or drag-and-drop file content.
 */
export interface SetupSiteDto {
  type: string
  title?: string
  content?: string
}
