import { FastifyRequest, FastifyReply } from "fastify"
import { prisma } from "../../lib/prisma.js"
import { CreateOrgDto, OrgResponseDto, GetOrgResponseDto } from "./org.dto.js"

export async function createOrgHandler(
  request: FastifyRequest<{ Body: CreateOrgDto }>,
  reply: FastifyReply
) {
  const { name } = request.body
  const userId = request.userId!

  // Check if organization already exists for the user
  const existingOrg = await prisma.organization.findUnique({
    where: { userId }
  })

  if (existingOrg) {
    // If it already exists, return it (since only one org is allowed per user)
    const response: OrgResponseDto = {
      message: "Organization already exists",
      organization: existingOrg
    }
    return reply.send(response)
  }

  // Generate a short ID of 8 characters
  const orgId = Math.random().toString(36).substring(2, 10)

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      id: orgId,
      name,
      userId
    }
  })

  const response: OrgResponseDto = {
    message: "Organization created successfully",
    organization
  }

  return reply.status(201).send(response)
}

export async function getMyOrgHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.userId!

  const organization = await prisma.organization.findUnique({
    where: { userId }
  })

  if (!organization) {
    return reply.status(404).send({ error: "Organization not found" })
  }

  const response: GetOrgResponseDto = { organization }
  return reply.send(response)
}


