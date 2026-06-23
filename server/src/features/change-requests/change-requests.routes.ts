import { FastifyInstance } from "fastify"
import { ChangeRequestsController } from "./change-requests.controller.js"

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
  fastify.put("/change-requests/:changeRequestId/review", controller.requestReview)
  fastify.get("/orgs/:orgId/change-requests", controller.getOrgChangeRequests)
}
