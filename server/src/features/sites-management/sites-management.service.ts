import { SitesManagementRepository } from "./sites-management.repository.js"

export class SitesManagementService {
  private repository = new SitesManagementRepository()

  async createSite(name: string, userId: string) {
    const organization = await this.repository.findUserOrganization(userId)
    if (!organization) {
      throw new Error("User does not have an organization")
    }

    const siteId = Math.random().toString(36).substring(2, 9)
    return this.repository.createSite(siteId, name, organization.id)
  }

  async getSites(userId: string) {
    const organization = await this.repository.findUserOrganization(userId)
    if (!organization) {
      return []
    }
    return this.repository.findSitesByOrganizationId(organization.id)
  }

  async setupSite(siteId: string, type: string, title?: string, content?: string) {
    const site = await this.repository.findSiteById(siteId)
    if (!site) {
      throw new Error("Site not found")
    }

    const spaceId = `space_${Math.random().toString(36).substring(2, 7)}`
    await this.repository.createSpace(spaceId, "Space", site.id)

    const pageId = `page_${Math.random().toString(36).substring(2, 7)}`
    const defaultTitle = type === "import" && title ? title : "Welcome"
    const defaultContent = type === "import" && content ? content : "# Welcome to your new space\nStart editing here..."
    await this.repository.createPage(pageId, defaultTitle, defaultContent, spaceId)

    return this.repository.updateSiteSetup(site.id, true)
  }

  async deleteSite(siteId: string) {
    const site = await this.repository.findSiteById(siteId)
    if (!site) {
      throw new Error("Site not found")
    }
    await this.repository.deleteSite(siteId)
    return { message: "Site deleted successfully" }
  }
}
