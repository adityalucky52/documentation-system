import { FastifyRequest, FastifyReply } from "fastify"
import { EditorService } from "./editor.service.js"

/**
 * EditorController.
 * 
 * Purpose:
 * Receives and validates HTTP requests targeting pages and space trees.
 * Determines if updates should affect the live main Page content or remain isolated
 * inside a draft Branch by checking the `branchId` query or body parameter.
 */
export class EditorController {
  private service = new EditorService()

  /**
   * getSpace Handler.
   * 
   * Purpose:
   * Returns a space structure with its list of pages.
   * 
   * Context details:
   * Reads the query string `branchId`. If present, the service overrides live master page contents
   * with draft modifications retrieved from the `PageVersion` table.
   * 
   * Triggered by:
   * - Frontend: SpaceEditorPage (on mount, or when selecting a different branch in ChangeRequestSwitcher).
   */
  getSpace = async (
    request: FastifyRequest<{ Params: { spaceId: string }; Querystring: { branchId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { spaceId } = request.params
      const { branchId } = request.query
      const space = await this.service.getSpace(spaceId, branchId)
      return reply.send(space)
    } catch (err: any) {
      return reply.status(404).send({ error: err.message })
    }
  }

  /**
   * createPage Handler.
   * 
   * Purpose:
   * Creates a new Page entry in a Space.
   * 
   * Branching rules:
   * If `branchId` is provided, a corresponding placeholder entry is created in the `PageVersion` table,
   * isolating the new page to that draft branch.
   * 
   * Triggered by:
   * - Frontend: EditorSidebar (on clicking the "+ Add page" button in the hierarchy).
   */
  createPage = async (
    request: FastifyRequest<{ Params: { spaceId: string }; Body: { title: string; branchId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { spaceId } = request.params
      const { title, branchId } = request.body
      const page = await this.service.createPage(spaceId, title, branchId)
      return reply.status(201).send(page)
    } catch (err: any) {
      return reply.status(404).send({ error: err.message })
    }
  }

  /**
   * updatePage Handler.
   * 
   * Purpose:
   * Saves updated page titles or markdown content.
   * 
   * Branching rules:
   * If `branchId` is provided, this writes the updates to the `PageVersion` table (draft).
   * If `branchId` is missing, it updates the main `Page` table (live).
   * 
   * Triggered by:
   * - Frontend: RichTextEditor auto-save timer (firing every 800ms during active editing).
   */
  updatePage = async (
    request: FastifyRequest<{ Params: { pageId: string }; Body: { title?: string; content?: string; branchId?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { pageId } = request.params
      const { title, content, branchId } = request.body
      const page = await this.service.updatePage(pageId, title, content, branchId)
      return reply.send(page)
    } catch (err: any) {
      return reply.status(404).send({ error: err.message })
    }
  }

  /**
   * mergeSpace Handler.
   * 
   * Purpose:
   * Atomically publishes all draft page versions on `${spaceId}-draft` to `${spaceId}-main`
   * and overrides the live master `Page` table contents.
   * 
   * Triggered by:
   * - Frontend: MergeConfirmModal ("Confirm merge" trigger).
   */
  mergeSpace = async (
    request: FastifyRequest<{ Params: { spaceId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { spaceId } = request.params
      const userId = request.userId!
      const result = await this.service.mergeSpace(spaceId, userId)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(400).send({ error: err.message })
    }
  }

  /**
   * getSpaceMergeLogs Handler.
   */
  getSpaceMergeLogs = async (
    request: FastifyRequest<{ Params: { spaceId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { spaceId } = request.params
      const logs = await this.service.getSpaceMergeLogs(spaceId)
      return reply.send(logs)
    } catch (err: any) {
      return reply.status(400).send({ error: err.message })
    }
  }

  /**
   * getOrgMergeLogs Handler.
   */
  getOrgMergeLogs = async (
    request: FastifyRequest<{ Params: { orgId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { orgId } = request.params
      const logs = await this.service.getOrgMergeLogs(orgId)
      return reply.send(logs)
    } catch (err: any) {
      return reply.status(400).send({ error: err.message })
    }
  }
}

