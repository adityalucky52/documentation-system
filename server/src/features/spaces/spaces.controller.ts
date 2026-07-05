import { FastifyRequest, FastifyReply } from "fastify"
import { SpacesService } from "./spaces.service.js"
import { CreateSiteDto, SetupSiteDto } from "./spaces.dto.js"

/**
 * SpacesController.
 * 
 * Purpose:
 * Handles incoming HTTP requests for documentation sites, delegates database operations
 * to the `SpacesService` layer, and formats JSON responses.
 * 
 * Triggered by:
 * - Frontend interactions on the Dashboard page, Site Setup page, and Settings tab.
 */
export class SpacesController {
  private service = new SpacesService()

  /**
   * createSite Handler.
   * 
   * Purpose:
   * Registers a new site structure under the user's organization.
   * 
   * Triggered by:
   * - Frontend: CreateSiteModal (on clicking "Create site" form submit).
   * 
   * Request Lifecycle:
   * POST /api/site --> Controller.createSite --> Service.createSite --> Repository.createSite --> Response (201 Created)
   */
  createSite = async (
    request: FastifyRequest<{ Body: CreateSiteDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { name } = request.body
      const userId = request.userId!
      const site = await this.service.createSite(name, userId)
      return reply.status(201).send({ message: "Site created successfully", site })
    } catch (err: any) {
      return reply.status(400).send({ error: err.message })
    }
  }

  /**
   * getSites Handler.
   * 
   * Purpose:
   * Fetches all registered documentation sites in the user's organization.
   * 
   * Triggered by:
   * - Frontend: DashboardPage (on mount).
   */
  getSites = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const userId = request.userId!
    const sites = await this.service.getSites(userId)
    return reply.send({ sites })
  }

  /**
   * setupSite Handler.
   * 
   * Purpose:
   * Configures a site's structure, creating default spaces/pages from a template.
   * 
   * Triggered by:
   * - Frontend: SiteOnboardingOptions checklists.
   */
  setupSite = async (
    request: FastifyRequest<{ Params: { siteId: string }; Body: SetupSiteDto }>,
    reply: FastifyReply
  ) => {
    try {
      const { siteId } = request.params
      const { type, title, content } = request.body
      const site = await this.service.setupSite(siteId, type, title, content)
      return reply.send({ message: `Site setup completed using ${type}`, site })
    } catch (err: any) {
      const statusCode = err.message === "Site not found" ? 404 : 400
      return reply.status(statusCode).send({ error: err.message })
    }
  }

  /**
   * deleteSite Handler.
   * 
   * Purpose:
   * Deletes a site and all nested spaces/pages (Cascades in DB).
   * 
   * Triggered by:
   * - Frontend: SiteSettingsPanel (on clicking "Delete Site" inside the danger zone).
   */
  deleteSite = async (
    request: FastifyRequest<{ Params: { siteId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { siteId } = request.params
      const result = await this.service.deleteSite(siteId)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(404).send({ error: err.message })
    }
  }

  /**
   * publishSite Handler.
   * 
   * Purpose:
   * Marks a site as public/published.
   */
  publishSite = async (
    request: FastifyRequest<{ Params: { siteId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { siteId } = request.params
      const site = await this.service.publishSite(siteId)
      return reply.send({ message: "Site published successfully", site })
    } catch (err: any) {
      const statusCode = err.message === "Site not found" ? 404 : 400
      return reply.status(statusCode).send({ error: err.message })
    }
  }
}
