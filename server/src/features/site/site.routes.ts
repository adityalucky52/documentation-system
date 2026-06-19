import { FastifyInstance } from "fastify"
import { createSiteHandler, getSitesHandler, setupSiteHandler } from "./site.controller.js"

declare module "fastify" {
  interface FastifyRequest {
    userId?: string
  }
}

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
      type: { type: "string" }
    }
  }
}

export async function siteRoutes(fastify: FastifyInstance) {
  // Pre-handler hook to validate and extract authentication headers
  fastify.addHook("preHandler", async (request, reply) => {
    const userId = request.headers["x-user-id"] as string
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized: User ID is required" })
    }
    request.userId = userId
  })

  fastify.post("/", { schema: createSiteSchema }, createSiteHandler)
  fastify.get("/", getSitesHandler)
  fastify.post("/:siteId/setup", { schema: setupSiteSchema }, setupSiteHandler)
}
