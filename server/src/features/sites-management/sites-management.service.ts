import { SitesManagementRepository } from "./sites-management.repository.js"

/**
 * SitesManagementService.
 * 
 * Purpose:
 * Coordinates the business rules for managing sites. Encapsulates logic for
 * authorization (ensuring users own an organization before creating sites) and
 * content generation (seeding new spaces and pages with templates or imports).
 */
export class SitesManagementService {
  private repository = new SitesManagementRepository()

  /**
   * createSite Business logic.
   * 
   * Verifies the user has a registered organization.
   * If yes, generates a random 7-character site ID and creates the record.
   */
  async createSite(name: string, userId: string) {
    const organization = await this.repository.findUserOrganization(userId)
    if (!organization) {
      throw new Error("User does not have an organization")
    }

    const siteId = Math.random().toString(36).substring(2, 9)
    return this.repository.createSite(siteId, name, organization.id)
  }

  /**
   * getSites Business logic.
   * 
   * Fetches the user's organization and returns all nested sites.
   */
  async getSites(userId: string) {
    const organization = await this.repository.findUserOrganization(userId)
    if (!organization) {
      return []
    }
    return this.repository.findSitesByOrganizationId(organization.id)
  }

  /**
   * setupSite Business logic.
   * 
   * Seeds a newly created site with a default Space and a starter welcome Page.
   * Handles both blank setups (using placeholder markdown) and custom uploads
   * (parsing raw HTML/Markdown content passed from the client drag-and-drop modal).
   */
  async setupSite(siteId: string, type: string, title?: string, content?: string) {
    const site = await this.repository.findSiteById(siteId)
    if (!site) {
      throw new Error("Site not found")
    }

    // 1. Create a default workspace Space for the site
    const spaceId = `space_${Math.random().toString(36).substring(2, 7)}`
    await this.repository.createSpace(spaceId, "Space", site.id)

    // 2. Determine initial welcome content (template placeholders vs parsed file imports)
    const pageId = `page_${Math.random().toString(36).substring(2, 7)}`
    const defaultTitle = type === "import" && title ? title : "Welcome"
    const defaultContent = type === "import" && content ? content : "# Welcome to your new space\nStart editing here..."
    
    // 3. Write welcome page to database
    await this.repository.createPage(pageId, defaultTitle, defaultContent, spaceId)

    // 4. Update the site onboarding flag so the UI renders the workspace editor instead of options cards
    return this.repository.updateSiteSetup(site.id, true)
  }

  /**
   * deleteSite Business logic.
   * 
   * Deletes a site after validating it exists.
   */
  async deleteSite(siteId: string) {
    const site = await this.repository.findSiteById(siteId)
    if (!site) {
      throw new Error("Site not found")
    }
    await this.repository.deleteSite(siteId)
    return { message: "Site deleted successfully" }
  }
}

