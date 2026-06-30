import { prisma } from "../../lib/prisma.js"
import { ChangeRequestStatus } from "../../../generated/prisma/index.js"

/**
 * ChangeRequestsRepository.
 * 
 * Purpose:
 * Performs database actions for version control branches, change requests,
 * and page versions.
 * Integrates transactions to ensure atomic merges.
 */
export class ChangeRequestsRepository {
  /**
   * Reads Branch table by unique ID.
   */
  async findBranchById(branchId: string) {
    return prisma.branch.findUnique({
      where: { id: branchId }
    })
  }

  /**
   * Writes a new Branch record.
   */
  async createBranch(id: string, name: string, spaceId: string) {
    return prisma.branch.create({
      data: {
        id,
        name,
        spaceId
      }
    })
  }

  /**
   * Reads Page table filtering by spaceId.
   */
  async findPagesBySpaceId(spaceId: string) {
    return prisma.page.findMany({
      where: { spaceId }
    })
  }

  /**
   * Reads PageVersion records filtering by branchId.
   */
  async findPageVersionsByBranchId(branchId: string) {
    return prisma.pageVersion.findMany({
      where: { branchId }
    })
  }

  /**
   * Upserts a PageVersion record.
   */
  async upsertPageVersion(pageId: string, branchId: string, title: string, content: string) {
    return prisma.pageVersion.upsert({
      where: {
        pageId_branchId: {
          pageId,
          branchId
        }
      },
      update: {},
      create: {
        pageId,
        branchId,
        title,
        content
      }
    })
  }

  /**
   * Writes a new PageVersion record.
   */
  async createPageVersion(pageId: string, branchId: string, title: string, content: string) {
    return prisma.pageVersion.create({
      data: {
        pageId,
        branchId,
        title,
        content
      }
    })
  }

  /**
   * Writes a new ChangeRequest record.
   */
  async createChangeRequest(id: string, title: string, status: ChangeRequestStatus, spaceId: string, sourceBranchId: string, targetBranchId: string, creatorId: string) {
    return prisma.changeRequest.create({
      data: {
        id,
        title,
        status,
        spaceId,
        sourceBranchId,
        targetBranchId,
        creatorId
      },
      include: {
        sourceBranch: true
      }
    })
  }

  /**
   * Reads ChangeRequest records matching spaceId, optionally filtering by status.
   */
  async findChangeRequestsBySpaceId(spaceId: string, status?: ChangeRequestStatus) {
    return prisma.changeRequest.findMany({
      where: {
        spaceId,
        ...(status && { status })
      },
      include: {
        sourceBranch: true,
        targetBranch: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  }

  /**
   * Reads ChangeRequest details matching unique ID, joining source and target branches.
   */
  async findChangeRequestById(changeRequestId: string) {
    return prisma.changeRequest.findUnique({
      where: { id: changeRequestId },
      include: {
        sourceBranch: {
          include: { pageVersions: true }
        },
        targetBranch: {
          include: { pageVersions: true }
        }
      }
    })
  }

  /**
   * Reads Site records filtering by organizationId.
   */
  async findSitesByOrgId(orgId: string) {
    return prisma.site.findMany({
      where: { organizationId: orgId }
    })
  }

  /**
   * Reads Space records matching any Site IDs in siteIds.
   */
  async findSpacesBySiteIds(siteIds: string[]) {
    return prisma.space.findMany({
      where: { siteId: { in: siteIds } }
    })
  }

  /**
   * Reads ChangeRequest records across Space IDs.
   */
  async findOrgChangeRequests(spaceIds: string[], status?: ChangeRequestStatus) {
    return prisma.changeRequest.findMany({
      where: {
        spaceId: { in: spaceIds },
        ...(status && { status })
      },
      include: {
        sourceBranch: true,
        targetBranch: true,
        space: {
          include: { site: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  }

  /**
   * Updates status column on ChangeRequest table.
   */
  async updateChangeRequestStatus(changeRequestId: string, status: ChangeRequestStatus) {
    return prisma.changeRequest.update({
      where: { id: changeRequestId },
      data: { status }
    })
  }

  /**
   * Merges branch changes atomically using a transaction.
   * 
   * Transaction Steps:
   * 1. Updates live page structures in `Page` table.
   * 2. Upserts/Promotes draft changes to target branch versions (`PageVersion` table).
   * 3. Sets the ChangeRequest status to MERGED.
   */
  async mergeChangeRequestTransaction(changeRequestId: string, targetBranchId: string, pageVersions: any[]) {
    return prisma.$transaction(async (tx) => {
      // 1. Update live Page and main branch PageVersion contents
      for (const sourcePv of pageVersions) {
        // Update page table
        await tx.page.update({
          where: { id: sourcePv.pageId },
          data: {
            title: sourcePv.title,
            content: sourcePv.content
          }
        })

        // Update main branch's page version
        await tx.pageVersion.upsert({
          where: {
            pageId_branchId: {
              pageId: sourcePv.pageId,
              branchId: targetBranchId
            }
          },
          update: {
            title: sourcePv.title,
            content: sourcePv.content
          },
          create: {
            pageId: sourcePv.pageId,
            branchId: targetBranchId,
            title: sourcePv.title,
            content: sourcePv.content
          }
        })
      }

      // 2. Mark the Change Request as merged
      await tx.changeRequest.update({
        where: { id: changeRequestId },
        data: { status: ChangeRequestStatus.MERGED }
      })
    })
  }
}

