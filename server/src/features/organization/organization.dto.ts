/**
 * Data Transfer Objects (DTOs) for Organization Feature.
 * 
 * Purpose:
 * Enforces type contracts for incoming body properties and returned JSON schemas.
 */

/**
 * CreateOrgDto.
 * Request format for POST `/api/org` payload.
 */
export interface CreateOrgDto {
  name: string
}

/**
 * OrganizationDto.
 * Maps organization model attributes for responses.
 */
export interface OrganizationDto {
  id: string
  name: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * OrgResponseDto.
 * Standard response wrapper structure returned by createOrgHandler.
 */
export interface OrgResponseDto {
  message: string
  organization: OrganizationDto
}

/**
 * GetOrgResponseDto.
 * Response wrapper structure returned by getMyOrgHandler.
 */
export interface GetOrgResponseDto {
  organization: OrganizationDto
}
