import { FastifyInstance } from "fastify"
import { EditorController } from "./editor.controller.js"

export async function editorRoutes(fastify: FastifyInstance) {
  const controller = new EditorController()

  // Pre-handler hook to validate and extract authentication headers
  fastify.addHook("preHandler", async (request, reply) => {
    const userId = request.headers["x-user-id"] as string
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized: User ID is required" })
    }
    request.userId = userId
  })

  // Space and Page routing
  fastify.get("/spaces/:spaceId", controller.getSpace)
  fastify.post("/spaces/:spaceId/pages", controller.createPage)
  fastify.put("/pages/:pageId", controller.updatePage)
}
