export interface CreateOrgDto {
  name: string
}

export interface OrganizationDto {
  id: string
  name: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface OrgResponseDto {
  message: string
  organization: OrganizationDto
}

export interface GetOrgResponseDto {
  organization: OrganizationDto
}
