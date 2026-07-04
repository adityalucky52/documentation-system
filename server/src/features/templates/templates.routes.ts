import { FastifyInstance } from "fastify"
import { TemplatesController } from "./templates.controller.js"

/**
 * Templates Routes Plugin.
 * 
 * Prefix: `/api/templates`
 */
export async function templatesRoutes(fastify: FastifyInstance) {
  const controller = new TemplatesController()

  // Require user authentication for template actions (matching sites management)
  fastify.addHook("preHandler", async (request, reply) => {
    const userId = request.headers["x-user-id"] as string
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized: User ID is required" })
    }
    request.userId = userId
  })

  fastify.get("/", controller.getTemplates)
  fastify.get("/:templateId", controller.getTemplateById)
}
