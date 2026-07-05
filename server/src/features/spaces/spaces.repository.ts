import { prisma } from "../../lib/prisma.js"

/**
 * SpacesRepository.
 * 
 * Purpose:
 * Encapsulates direct CRUD queries targeting SQL database tables:
 * `Organization`, `Site`, `Space`, and `Page`.
 * Decouples query building from business logic.
 */
export class SpacesRepository {
  /**
   * Reads Organization table looking up a row matched to owner userId.
   */
  async findUserOrganization(userId: string) {
    return prisma.organization.findUnique({
      where: { userId }
    })
  }

  /**
   * Creates a new Site record in the database.
   * Maps properties to `Site` columns, defaults `isSetup` to false.
   */
  async createSite(id: string, name: string, organizationId: string) {
    return prisma.site.create({
      data: {
        id,
        name,
        organizationId,
        isSetup: false
      },
      include: {
        spaces: {
          include: {
            pages: true
          }
        }
      }
    })
  }

  /**
   * Reads Site table returning list sorted by last modified timestamps.
   * Resolves relation joins: Site joins Space joins Page (representing main branch pages list).
   */
  async findSitesByOrganizationId(organizationId: string) {
    return prisma.site.findMany({
      where: {
        organizationId
      },
      include: {
        spaces: {
          include: {
            pages: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })
  }

  /**
   * Reads Site table looking up unique ID match.
   */
  async findSiteById(siteId: string) {
    return prisma.site.findUnique({
      where: { id: siteId }
    })
  }

  /**
   * Creates a new Space record in the database.
   * Relates the space to a Site.
   */
  async createSpace(id: string, name: string, siteId: string) {
    return prisma.space.create({
      data: {
        id,
        name,
        siteId
      }
    })
  }

  /**
   * Creates a new Page record in the database.
   * This writes the master page version.
   */
  async createPage(id: string, title: string, content: string, spaceId: string) {
    return prisma.page.create({
      data: {
        id,
        title,
        content,
        spaceId
      }
    })
  }

  /**
   * Updates isSetup column on Site record.
   * Triggered when template/import onboarding finishes.
   */
  async updateSiteSetup(siteId: string, isSetup: boolean) {
    return prisma.site.update({
      where: { id: siteId },
      data: { isSetup },
      include: {
        spaces: {
          include: {
            pages: true
          }
        }
      }
    })
  }

  /**
   * Deletes a Site record from the database.
   * Cascade constraints in PostgreSQL schema automatically delete nested Space, Page, and Branch records.
   */
  async deleteSite(siteId: string) {
    return prisma.site.delete({
      where: { id: siteId }
    })
  }

  /**
   * Updates isPublished column on Site record.
   * Triggered when a user clicks the Publish button.
   */
  async updateSitePublishStatus(siteId: string, isPublished: boolean) {
    return prisma.site.update({
      where: { id: siteId },
      data: { isPublished },
      include: {
        spaces: {
          include: {
            pages: true
          }
        }
      }
    })
  }
}
