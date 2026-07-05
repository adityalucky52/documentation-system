import { SpacesRepository } from "./spaces.repository.js"
import { TemplatesService } from "../templates/templates.service.js"

/**
 * SpacesService.
 * 
 * Purpose:
 * Coordinates the business rules for managing sites. Encapsulates logic for
 * authorization (ensuring users own an organization before creating sites) and
 * content generation (seeding new spaces and pages with templates or imports).
 */
export class SpacesService {
  private repository = new SpacesRepository()

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
    try {
      const site = await this.repository.findSiteById(siteId)
      if (!site) {
        throw new Error("Site not found")
      }

      // 1. Create a default workspace Space for the site
      const spaceId = `space_${Math.random().toString(36).substring(2, 7)}`
      await this.repository.createSpace(spaceId, "Space", site.id)

      // 2. Determine initial welcome content (template placeholders vs parsed file imports)
      if (type === "template") {
        const templatesService = new TemplatesService()
        const templates = await templatesService.getTemplates()
        const defaultTemplate = templates[0] // Choose first seeded Prisma template
        
        if (defaultTemplate && defaultTemplate.pages) {
          for (const p of defaultTemplate.pages) {
            const pageId = `page_${Math.random().toString(36).substring(2, 9)}`
            await this.repository.createPage(pageId, p.title, p.content, spaceId)
          }
        }
      } else if (type === "import") {
        const pageId = `page_${Math.random().toString(36).substring(2, 7)}`
        const defaultTitle = title || "Welcome"
        const defaultContent = content || "# Welcome to your new space\nStart editing here..."
        await this.repository.createPage(pageId, defaultTitle, defaultContent, spaceId)
      } else if (type !== "blank") {
        throw new Error("Unsupported setup type")
      }

      // 4. Update the site onboarding flag so the UI renders the workspace editor instead of options cards
      return await this.repository.updateSiteSetup(site.id, true)
    } catch (err: any) {
      console.error("Error in setupSite service method:", err)
      throw err
    }
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

  /**
   * publishSite Business logic.
   * 
   * Marks a site as published.
   */
  async publishSite(siteId: string) {
    const site = await this.repository.findSiteById(siteId)
    if (!site) {
      throw new Error("Site not found")
    }
    return this.repository.updateSitePublishStatus(siteId, true)
  }
}
