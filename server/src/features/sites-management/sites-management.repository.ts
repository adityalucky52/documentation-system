import { prisma } from "../../lib/prisma.js"

export class SitesManagementRepository {
  async findUserOrganization(userId: string) {
    return prisma.organization.findUnique({
      where: { userId }
    })
  }

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

  async findSiteById(siteId: string) {
    return prisma.site.findUnique({
      where: { id: siteId }
    })
  }

  async createSpace(id: string, name: string, siteId: string) {
    return prisma.space.create({
      data: {
        id,
        name,
        siteId
      }
    })
  }

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

  async deleteSite(siteId: string) {
    return prisma.site.delete({
      where: { id: siteId }
    })
  }
}
