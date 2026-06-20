export interface CreateSiteDto {
  name: string
}

export interface PageDto {
  id: string
  title: string
  content: string
  spaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface SpaceDto {
  id: string
  name: string
  siteId: string
  pages?: PageDto[]
  createdAt: Date
  updatedAt: Date
}

export interface SiteDto {
  id: string
  name: string
  organizationId: string
  isSetup: boolean
  spaces?: SpaceDto[]
  createdAt: Date
  updatedAt: Date
}

export interface SiteResponseDto {
  message: string
  site: SiteDto
}

export interface GetSitesResponseDto {
  sites: SiteDto[]
}
