import { FastifyInstance } from "fastify"
import { ChangeRequestsController } from "./change-requests.controller.js"

/**
 * ChangeRequestsRoutes Plugin.
 * 
 * Purpose:
 * Exposes API routes for version control (Git-style) branches, pull request status reviews,
 * comparisons, and merge routines.
 * 
 * Prefix: `/api/vc`
 * 
 * Endpoints:
 * 1. POST `/spaces/:spaceId/change-requests` -> Creates a branch + CR record (triggered by Switcher "New Change Request").
 * 2. GET `/spaces/:spaceId/change-requests` -> Lists branch options (triggered by Switcher dropdown open).
 * 3. GET `/change-requests/:changeRequestId` -> Fetches comparative side-by-side page diffs (triggered by Review Pane).
 * 4. PUT `/change-requests/:changeRequestId/merge` -> Merges changes into live pages (triggered by Merge Modal).
 * 5. GET `/orgs/:orgId/change-requests` -> Lists all organization-level change requests (triggered by GlobalChangeRequestsPage).
 * 
 * Middlewares:
 * preHandler Hook: Authenticates the request context.
 */
export async function changeRequestsRoutes(fastify: FastifyInstance) {
  const controller = new ChangeRequestsController()

  // Authentication check hook
  fastify.addHook("preHandler", async (request, reply) => {
    const userId = request.headers["x-user-id"] as string
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized: User ID is required" })
    }
    request.userId = userId
  })

  // Endpoints
  fastify.post("/spaces/:spaceId/change-requests", controller.createChangeRequest)
  fastify.get("/spaces/:spaceId/change-requests", controller.getChangeRequests)
  fastify.get("/change-requests/:changeRequestId", controller.getChangeRequestDetail)
  fastify.put("/change-requests/:changeRequestId/merge", controller.mergeChangeRequest)
  fastify.get("/orgs/:orgId/change-requests", controller.getOrgChangeRequests)
}

