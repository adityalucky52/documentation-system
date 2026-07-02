import { FastifyInstance } from "fastify"
import { PublicController } from "./public.controller.js"

/**
 * Public Routes Plugin.
 *
 * Purpose:
 * Exposes endpoints for public (unauthenticated) viewers to access published documentation.
 * Unlike the admin editor routes, this does not require x-user-id headers or login sessions.
 */
export async function publicRoutes(fastify: FastifyInstance) {
  const controller = new PublicController()

  // GET /api/public/spaces/:spaceId -> returns live pages
  fastify.get("/spaces/:spaceId", controller.getPublishedSpace)
}
