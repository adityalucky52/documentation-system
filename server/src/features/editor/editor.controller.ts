import { FastifyRequest, FastifyReply } from "fastify"
import { EditorService } from "./editor.service.js"

export class EditorController {
  private service = new EditorService()

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
}
