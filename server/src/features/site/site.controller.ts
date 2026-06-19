import { FastifyRequest, FastifyReply } from "fastify"
import { prisma } from "../../lib/prisma.js"
import { CreateSiteDto, SiteResponseDto, GetSitesResponseDto } from "./site.dto.js"

export async function createSiteHandler(
  request: FastifyRequest<{ Body: CreateSiteDto }>,
  reply: FastifyReply
) {
  const { name } = request.body
  const userId = request.userId!

  // Find the organization owned by the user
  const organization = await prisma.organization.findUnique({
    where: { userId }
  })

  if (!organization) {
    return reply.status(400).send({ error: "User does not have an organization" })
  }

  // Generate a short ID of exactly 7 characters
  const siteId = Math.random().toString(36).substring(2, 9)

  // Create the site
  const site = await prisma.site.create({
    data: {
      id: siteId,
      name,
      organizationId: organization.id,
      isSetup: false
    },
    include: {
      spaces: true
    }
  })

  const response: SiteResponseDto = {
    message: "Site created successfully",
    site
  }

  return reply.status(201).send(response)
}

export async function getSitesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.userId!

  const organization = await prisma.organization.findUnique({
    where: { userId }
  })

  if (!organization) {
    const response: GetSitesResponseDto = { sites: [] }
    return reply.send(response)
  }

  const sites = await prisma.site.findMany({
    where: {
      organizationId: organization.id
    },
    include: {
      spaces: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  })

  const response: GetSitesResponseDto = { sites }
  return reply.send(response)
}

export async function setupSiteHandler(
  request: FastifyRequest<{ Params: { siteId: string }; Body: { type: string } }>,
  reply: FastifyReply
) {
  const { siteId } = request.params
  const { type } = request.body

  const site = await prisma.site.findUnique({
    where: { id: siteId }
  })

  if (!site) {
    return reply.status(404).send({ error: "Site not found" })
  }

  // Create a default Space (name: "Space") inside this site
  const spaceId = `space_${Math.random().toString(36).substring(2, 7)}`
  await prisma.space.create({
    data: {
      id: spaceId,
      name: "Space",
      siteId: site.id
    }
  })

  // Update site isSetup flag
  const updatedSite = await prisma.site.update({
    where: { id: site.id },
    data: { isSetup: true },
    include: { spaces: true }
  })

  const response: SiteResponseDto = {
    message: `Site setup completed using ${type}`,
    site: updatedSite
  }

  return reply.send(response)
}
