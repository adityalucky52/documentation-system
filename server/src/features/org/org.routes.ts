import { FastifyInstance } from "fastify"
import { createOrgHandler, getMyOrgHandler } from "./org.controller.js"

export async function orgRoutes(fastify: FastifyInstance) {
  fastify.post("/", createOrgHandler)
  fastify.get("/me", getMyOrgHandler)
}
