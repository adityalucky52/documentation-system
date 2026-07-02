import { FastifyRequest, FastifyReply } from "fastify"
import { EditorService } from "../editor/editor.service.js"

/**
 * PublicController.
 *
 * Purpose:
 * Exposes endpoints for public (unauthenticated) readers to fetch published documentation spaces and pages.
 * Reuses EditorService to fetch space structures and live master page contents.
 */
export class PublicController {
  private service = new EditorService()

  /**
   * getPublishedSpace Handler.
   *
   * Purpose:
   * Returns a space structure with its list of live pages (unauthenticated).
   */
  getPublishedSpace = async (
    request: FastifyRequest<{ Params: { spaceId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { spaceId } = request.params
      // Fetch public/live space (without branchId)
      const space = await this.service.getSpace(spaceId)
      return reply.send(space)
    } catch (err: any) {
      return reply.status(404).send({ error: err.message })
    }
  }
}
