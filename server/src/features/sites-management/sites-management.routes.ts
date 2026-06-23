import { FastifyInstance } from "fastify"
import { SitesManagementController } from "./sites-management.controller.js"

const createSiteSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1 }
    }
  }
}

const setupSiteSchema = {
  body: {
    type: "object",
    required: ["type"],
    properties: {
      type: { type: "string" },
      title: { type: "string" },
      content: { type: "string" }
    }
  }
}

export async function sitesManagementRoutes(fastify: FastifyInstance) {
  const controller = new SitesManagementController()

  // Pre-handler hook to validate and extract authentication headers
  fastify.addHook("preHandler", async (request, reply) => {
    const userId = request.headers["x-user-id"] as string
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized: User ID is required" })
    }
    request.userId = userId
  })

  fastify.post("/", { schema: createSiteSchema }, controller.createSite)
  fastify.get("/", controller.getSites)
  fastify.post("/:siteId/setup", { schema: setupSiteSchema }, controller.setupSite)
  fastify.delete("/:siteId", controller.deleteSite)
}
