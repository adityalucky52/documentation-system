import { FastifyInstance } from "fastify"
import { EditorController } from "./editor.controller.js"

/**
 * Editor Routes Plugin.
 * 
 * Purpose:
 * Exposes endpoints for managing workspace pages and document structure.
 * 
 * Prefix: `/api/site`
 * 
 * Endpoints:
 * 1. GET `/spaces/:spaceId` -> Fetches all pages inside a Space (triggered by SpaceEditorPage loading).
 *    Supports optional query parameters like `?branchId=xxx` to fetch isolated drafts.
 * 2. POST `/spaces/:spaceId/pages` -> Appends a new Page record (triggered by sidebar "New page" button).
 * 3. PUT `/pages/:pageId` -> Updates a Page's content (triggered by debounced text editors autosave).
 * 
 * Middlewares:
 * preHandler Hook: Validates `x-user-id` authentication context.
 */
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

