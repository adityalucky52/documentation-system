import { FastifyRequest, FastifyReply } from "fastify"
import { ChangeRequestsService } from "./change-requests.service.js"

/**
 * ChangeRequestsController.
 * 
 * Purpose:
 * Coordinates Git-like version control actions for documentation changes.
 * Acts as the middleware coordinator handling branch creation, status reviews, comparative diff requests,
 * and merge pipelines.
 */
export class ChangeRequestsController {
  private service = new ChangeRequestsService()

  /**
   * createChangeRequest Handler.
   * 
   * Purpose:
   * Initializes a new workspace edit branch and registers it as an open change request.
   * 
   * Triggered by:
   * - Frontend: ChangeRequestSwitcher footer (on clicking "Create" in the new branch form).
   */
  createChangeRequest = async (
    request: FastifyRequest<{ Params: { spaceId: string }; Body: { title: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { spaceId } = request.params
      const { title } = request.body
      const userId = request.userId!
      const changeRequest = await this.service.createChangeRequest(spaceId, title, userId)
      return reply.status(201).send(changeRequest)
    } catch (err: any) {
      return reply.status(400).send({ error: err.message })
    }
  }

  /**
   * getChangeRequests Handler.
   * 
   * Purpose:
   * Lists the change requests associated with a Space, filtered by status.
   * 
   * Triggered by:
   * - Frontend: ChangeRequestsDrawer sliding menu.
   */
  getChangeRequests = async (
    request: FastifyRequest<{ Params: { spaceId: string }; Querystring: { status?: string } }>,
    reply: FastifyReply
  ) => {
    const { spaceId } = request.params
    const { status } = request.query
    const changeRequests = await this.service.getChangeRequests(spaceId, status)
    return reply.send(changeRequests)
  }

  /**
   * getChangeRequestDetail Handler.
   * 
   * Purpose:
   * Retrieves change request details, including a side-by-side comparison of modified page versions.
   * 
   * Triggered by:
   * - Frontend: ChangeRequestReviewPane.
   */
  getChangeRequestDetail = async (
    request: FastifyRequest<{ Params: { changeRequestId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { changeRequestId } = request.params
      const detail = await this.service.getChangeRequestDetail(changeRequestId)
      return reply.send(detail)
    } catch (err: any) {
      return reply.status(404).send({ error: err.message })
    }
  }

  /**
   * mergeChangeRequest Handler.
   * 
   * Purpose:
   * Merges all draft page modifications from a branch back into the main live pages,
   * then updates the change request status to MERGED.
   * 
   * Triggered by:
   * - Frontend: MergeConfirmModal, ChangeRequestReviewPane ("Confirm merge" triggers).
   */
  mergeChangeRequest = async (
    request: FastifyRequest<{ Params: { changeRequestId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { changeRequestId } = request.params
      const result = await this.service.mergeChangeRequest(changeRequestId)
      return reply.send(result)
    } catch (err: any) {
      const statusCode = err.message === "Change Request not found" ? 404 : 400
      return reply.status(statusCode).send({ error: err.message })
    }
  }

  /**
   * getOrgChangeRequests Handler.
   * 
   * Purpose:
   * Lists all change requests across all sites in an organization.
   * 
   * Triggered by:
   * - Frontend: GlobalChangeRequestsPage dashboard feed.
   */
  getOrgChangeRequests = async (
    request: FastifyRequest<{ Params: { orgId: string }; Querystring: { status?: string } }>,
    reply: FastifyReply
  ) => {
    const { orgId } = request.params
    const { status } = request.query
    const changeRequests = await this.service.getOrgChangeRequests(orgId, status)
    return reply.send(changeRequests)
  }


}

