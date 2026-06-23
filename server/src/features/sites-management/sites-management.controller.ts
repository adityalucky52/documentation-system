import { FastifyRequest, FastifyReply } from "fastify"
import { SitesManagementService } from "./sites-management.service.js"
import { CreateSiteDto, SetupSiteDto } from "./sites-management.dto.js"

export class SitesManagementController {
  private service = new SitesManagementService()

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

  getSites = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const userId = request.userId!
    const sites = await this.service.getSites(userId)
    return reply.send({ sites })
  }

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
}
