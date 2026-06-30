import { FastifyInstance } from "fastify"
import { createOrgHandler, getMyOrgHandler } from "./org.controller.js"

// Fastify Request Extension.
// Extends FastifyRequest interface to safely bind authenticated user context keys.
declare module "fastify" {
  interface FastifyRequest {
    userId?: string
  }
}

/**
 * createOrgSchema.
 * Enforces validation rules on Organization creation payloads.
 * Requires: name (minimum 1 char).
 */
const createOrgSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1 }
    }
  }
}

/**
 * Organization Routes Plugin.
 * 
 * Purpose:
 * Exposes endpoints for managing workspace tenant profiles (Organizations).
 * 
 * Prefix: `/api/org`
 * 
 * Endpoints:
 * 1. POST `/` -> Creates a new organization for the user.
 * 2. GET `/me` -> Fetches the active organization details belonging to the user.
 * 
 * Middlewares:
 * preHandler Hook: Acts as an authentication middleware. Checks for the `x-user-id` header
 * in all requests. Rejects requests with a 401 Unauthorized error if the header is missing,
 * otherwise sets `request.userId` for controllers.
 */
export async function orgRoutes(fastify: FastifyInstance) {
  // Pre-handler hook to validate and extract authentication headers
  fastify.addHook("preHandler", async (request, reply) => {
    const userId = request.headers["x-user-id"] as string
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized: User ID is required" })
    }
    request.userId = userId
  })

  fastify.post("/", { schema: createOrgSchema }, createOrgHandler)
  fastify.get("/me", getMyOrgHandler)
}


