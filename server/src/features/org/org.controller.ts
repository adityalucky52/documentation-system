import { FastifyRequest, FastifyReply } from "fastify"
import { prisma } from "../../lib/prisma.js"
import { CreateOrgDto, OrgResponseDto, GetOrgResponseDto } from "./org.dto.js"

/**
 * createOrgHandler Controller.
 * 
 * Purpose:
 * Creates a tenant workspace container (Organization) for the authenticated user.
 * 
 * Triggered by:
 * - Frontend: CreateOrganizationPage onboarding form (on clicking "Create workspace").
 * 
 * Database Operations:
 * 1. Read check: Reads `Organization` table to ensure the user does not already own one.
 * 2. Create organization: Generates an 8-character slug ID and writes (inserts) a new row
 *    into the `Organization` table.
 */
export async function createOrgHandler(
  request: FastifyRequest<{ Body: CreateOrgDto }>,
  reply: FastifyReply
) {
  const { name } = request.body
  const userId = request.userId!

  // Check if organization already exists for the user in the database
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

  // Generate a short ID of 8 characters for URL slugging (e.g. o/abcde123)
  const orgId = Math.random().toString(36).substring(2, 10)

  // Write new Organization record to database
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

/**
 * getMyOrgHandler Controller.
 * 
 * Purpose:
 * Returns the tenant workspace belonging to the user.
 * 
 * Triggered by:
 * - Frontend: DashboardLayout (onMount page loading sequence, or useAuthStore.syncOrganization checks).
 * 
 * Database Operations:
 * - Read organization: Reads `Organization` table looking up a row matched to `userId`.
 */
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



