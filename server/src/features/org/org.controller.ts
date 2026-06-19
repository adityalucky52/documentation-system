import { FastifyRequest, FastifyReply } from "fastify"
import { prisma } from "../../lib/prisma.js"

export async function createOrgHandler(
  request: FastifyRequest<{ Body: { name: string; userId?: string } }>,
  reply: FastifyReply
) {
  const { name, userId: bodyUserId } = request.body
  const userId = bodyUserId || (request.headers["x-user-id"] as string)

  if (!name) {
    return reply.status(400).send({ error: "Organization name is required" })
  }

  if (!userId) {
    return reply.status(401).send({ error: "User ID is required" })
  }

  // Check if organization already exists for the user
  const existingOrg = await prisma.organization.findUnique({
    where: { userId }
  })

  if (existingOrg) {
    // If it already exists, return it (since only one org is allowed per user)
    return reply.send({
      message: "Organization already exists",
      organization: existingOrg
    })
  }

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name,
      userId
    }
  })

  return reply.status(201).send({
    message: "Organization created successfully",
    organization
  })
}

export async function getMyOrgHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.headers["x-user-id"] as string

  if (!userId) {
    return reply.status(401).send({ error: "User ID is required" })
  }

  const organization = await prisma.organization.findUnique({
    where: { userId }
  })

  if (!organization) {
    return reply.status(404).send({ error: "Organization not found" })
  }

  return reply.send({ organization })
}
