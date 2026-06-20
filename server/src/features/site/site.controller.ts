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

  // Create a site
  const site = await prisma.site.create({
    data: {
      id: siteId,
      name,
      organizationId: organization.id,
      isSetup: false
    },
    include: {
      spaces: {
        include: {
          pages: true
        }
      }
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
      spaces: {
        include: {
          pages: true
        }
      }
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

  // Create a default Page in the new Space
  const pageId = `page_${Math.random().toString(36).substring(2, 7)}`
  await prisma.page.create({
    data: {
      id: pageId,
      title: "Welcome",
      content: "# Welcome to your new space\nStart editing here...",
      spaceId: spaceId
    }
  })

  // Update site isSetup flag
  const updatedSite = await prisma.site.update({
    where: { id: site.id },
    data: { isSetup: true },
    include: {
      spaces: {
        include: {
          pages: true
        }
      }
    }
  })

  const response: SiteResponseDto = {
    message: `Site setup completed using ${type}`,
    site: updatedSite
  }

  return reply.send(response)
}

export async function getSpaceHandler(
  request: FastifyRequest<{ Params: { spaceId: string } }>,
  reply: FastifyReply
) {
  const { spaceId } = request.params

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      pages: {
        orderBy: { createdAt: "asc" }
      },
      site: true
    }
  })

  if (!space) {
    return reply.status(404).send({ error: "Space not found" })
  }

  return reply.send(space)
}

export async function createPageHandler(
  request: FastifyRequest<{ Params: { spaceId: string }; Body: { title: string } }>,
  reply: FastifyReply
) {
  const { spaceId } = request.params
  const { title } = request.body

  const space = await prisma.space.findUnique({
    where: { id: spaceId }
  })

  if (!space) {
    return reply.status(404).send({ error: "Space not found" })
  }

  const pageId = `page_${Math.random().toString(36).substring(2, 7)}`
  const page = await prisma.page.create({
    data: {
      id: pageId,
      title: title || "Untitled Page",
      content: "",
      spaceId: space.id
    }
  })

  return reply.status(201).send(page)
}

export async function updatePageHandler(
  request: FastifyRequest<{ Params: { pageId: string }; Body: { title?: string; content?: string } }>,
  reply: FastifyReply
) {
  const { pageId } = request.params
  const { title, content } = request.body

  const page = await prisma.page.findUnique({
    where: { id: pageId }
  })

  if (!page) {
    return reply.status(404).send({ error: "Page not found" })
  }

  const updatedPage = await prisma.page.update({
    where: { id: pageId },
    data: {
      title: title !== undefined ? title : page.title,
      content: content !== undefined ? content : page.content
    }
  })

  return reply.send(updatedPage)
}

export async function deleteSiteHandler(
  request: FastifyRequest<{ Params: { siteId: string } }>,
  reply: FastifyReply
) {
  const { siteId } = request.params

  const site = await prisma.site.findUnique({
    where: { id: siteId }
  })

  if (!site) {
    return reply.status(404).send({ error: "Site not found" })
  }

  await prisma.site.delete({
    where: { id: siteId }
  })

  return reply.send({ message: "Site deleted successfully" })
}
