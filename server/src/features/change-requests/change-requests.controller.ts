import { FastifyRequest, FastifyReply } from "fastify"
import { ChangeRequestsService } from "./change-requests.service.js"

export class ChangeRequestsController {
  private service = new ChangeRequestsService()

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

  getChangeRequests = async (
    request: FastifyRequest<{ Params: { spaceId: string }; Querystring: { status?: string } }>,
    reply: FastifyReply
  ) => {
    const { spaceId } = request.params
    const { status } = request.query
    const changeRequests = await this.service.getChangeRequests(spaceId, status)
    return reply.send(changeRequests)
  }

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

  getOrgChangeRequests = async (
    request: FastifyRequest<{ Params: { orgId: string }; Querystring: { status?: string } }>,
    reply: FastifyReply
  ) => {
    const { orgId } = request.params
    const { status } = request.query
    const changeRequests = await this.service.getOrgChangeRequests(orgId, status)
    return reply.send(changeRequests)
  }

  requestReview = async (
    request: FastifyRequest<{ Params: { changeRequestId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { changeRequestId } = request.params
      const updated = await this.service.requestReview(changeRequestId)
      return reply.send(updated)
    } catch (err: any) {
      const statusCode = err.message === "Change request not found" ? 404 : 400
      return reply.status(statusCode).send({ error: err.message })
    }
  }
}
