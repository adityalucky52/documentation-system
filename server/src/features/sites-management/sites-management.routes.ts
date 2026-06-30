import { FastifyInstance } from "fastify"
import { SitesManagementController } from "./sites-management.controller.js"

/**
 * createSiteSchema.
 * Enforces site creation validation rules.
 * Requires: name (minimum 1 char).
 */
const createSiteSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1 }
    }
  }
}

/**
 * setupSiteSchema.
 * Validates the body parameters for setting up onboarding templates or importing files.
 * Requires: type (e.g. "template" vs "blank").
 */
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

/**
 * Sites Management Routes Plugin.
 * 
 * Purpose:
 * Exposes endpoints to create, fetch, delete, and configure documentation sites.
 * 
 * Prefix: `/api/site`
 * 
 * Endpoints:
 * 1. POST `/` -> Creates a new site (triggered by CreateSiteModal).
 * 2. GET `/` -> Fetches all sites in user's organization (triggered by DashboardPage).
 * 3. POST `/:siteId/setup` -> Initializes space/pages from templates (triggered by onboarding checklists).
 * 4. DELETE `/:siteId` -> Deletes a site (triggered by SiteSettingsPanel).
 * 
 * Middlewares:
 * preHandler Hook: Extends request authentication validation mapping `x-user-id` to controllers.
 */
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

