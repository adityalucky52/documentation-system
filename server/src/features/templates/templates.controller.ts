import { FastifyRequest, FastifyReply } from "fastify"
import { TemplatesService } from "./templates.service.js"

/**
 * TemplatesController.
 * 
 * Purpose:
 * Handles incoming HTTP requests for reading template layouts.
 */
export class TemplatesController {
  private service = new TemplatesService()

  /**
   * getTemplates Handler.
   * GET /api/templates
   */
  getTemplates = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const templates = await this.service.getTemplates()
      return reply.send({ templates })
    } catch (err: any) {
      return reply.status(500).send({ error: err.message })
    }
  }

  /**
   * getTemplateById Handler.
   * GET /api/templates/:templateId
   */
  getTemplateById = async (
    request: FastifyRequest<{ Params: { templateId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { templateId } = request.params
      const template = await this.service.getTemplateById(templateId)
      if (!template) {
        return reply.status(404).send({ error: "Template not found" })
      }
      return reply.send({ template })
    } catch (err: any) {
      return reply.status(500).send({ error: err.message })
    }
  }
}
