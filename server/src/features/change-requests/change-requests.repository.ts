import { prisma } from "../../lib/prisma.js"
import { ChangeRequestStatus } from "../../../generated/prisma/index.js"

export class ChangeRequestsRepository {
  async findBranchById(branchId: string) {
    return prisma.branch.findUnique({
      where: { id: branchId }
    })
  }

  async createBranch(id: string, name: string, spaceId: string) {
    return prisma.branch.create({
      data: {
        id,
        name,
        spaceId
      }
    })
  }

  async findPagesBySpaceId(spaceId: string) {
    return prisma.page.findMany({
      where: { spaceId }
    })
  }

  async findPageVersionsByBranchId(branchId: string) {
    return prisma.pageVersion.findMany({
      where: { branchId }
    })
  }

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

  async findSitesByOrgId(orgId: string) {
    return prisma.site.findMany({
      where: { organizationId: orgId }
    })
  }

  async findSpacesBySiteIds(siteIds: string[]) {
    return prisma.space.findMany({
      where: { siteId: { in: siteIds } }
    })
  }

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

  async updateChangeRequestStatus(changeRequestId: string, status: ChangeRequestStatus) {
    return prisma.changeRequest.update({
      where: { id: changeRequestId },
      data: { status }
    })
  }

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
