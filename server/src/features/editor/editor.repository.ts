import { prisma } from "../../lib/prisma.js"

/**
 * EditorRepository.
 * 
 * Purpose:
 * Encapsulates database operations for pages, spaces, and page versions.
 * Interacts with: `Space`, `Page`, and `PageVersion` tables.
 */
export class EditorRepository {
  /**
   * Reads Space table to retrieve a Space and its parent Site.
   */
  async findSpaceById(spaceId: string) {
    return prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        site: true
      }
    })
  }

  /**
   * Reads PageVersion table to retrieve draft edits for a branch.
   */
  async findPageVersionsByBranchId(branchId: string) {
    return prisma.pageVersion.findMany({
      where: { branchId },
      orderBy: { updatedAt: "asc" }
    })
  }

  /**
   * Reads Page table to retrieve live page versions.
   */
  async findPagesBySpaceId(spaceId: string) {
    return prisma.page.findMany({
      where: { spaceId },
      orderBy: { createdAt: "asc" }
    })
  }

  /**
   * Writes a new Page record.
   */
  async createPage(id: string, title: string, content: string, spaceId: string) {
    return prisma.page.create({
      data: {
        id,
        title,
        content,
        spaceId
      }
    })
  }

  /**
   * Writes or Updates a draft page version in PageVersion table.
   * Matches on the composite unique constraint `@@unique([pageId, branchId])`.
   */
  async upsertPageVersion(pageId: string, branchId: string, title: string, content: string) {
    return prisma.pageVersion.upsert({
      where: {
        pageId_branchId: {
          pageId,
          branchId
        }
      },
      update: {
        title,
        content
      },
      create: {
        pageId,
        branchId,
        title,
        content
      }
    })
  }

  /**
   * Reads Page table matching pageId.
   */
  async findPageById(pageId: string) {
    return prisma.page.findUnique({
      where: { id: pageId }
    })
  }

  /**
   * Updates a live Page record.
   */
  async updatePage(pageId: string, title: string, content: string) {
    return prisma.page.update({
      where: { id: pageId },
      data: {
        title,
        content
      }
    })
  }

  /**
   * Reads Branch table to check if a specific branchId exists.
   */
  async findBranchById(branchId: string) {
    return prisma.branch.findUnique({
      where: { id: branchId }
    })
  }

  /**
   * Writes a new Branch entry.
   */
  async createBranch(branchId: string, name: string, spaceId: string) {
    return prisma.branch.create({
      data: {
        id: branchId,
        name,
        spaceId
      }
    })
  }

  /**
   * Merges all page versions from the draft branch to the main branch and live Page records.
   */
  async mergeBranchTransaction(spaceId: string, draftBranchId: string, mainBranchId: string, pageVersions: any[], userId: string) {
    return prisma.$transaction(async (tx) => {
      // Ensure target master branch entry exists
      await tx.branch.upsert({
        where: { id: mainBranchId },
        update: {},
        create: {
          id: mainBranchId,
          name: "main",
          spaceId
        }
      })

      for (const draftPv of pageVersions) {
        // 1. Update primary live Page record
        await tx.page.update({
          where: { id: draftPv.pageId },
          data: {
            title: draftPv.title,
            content: draftPv.content
          }
        })

        // 2. Upsert historical/reference version on main branch
        await tx.pageVersion.upsert({
          where: {
            pageId_branchId: {
              pageId: draftPv.pageId,
              branchId: mainBranchId
            }
          },
          update: {
            title: draftPv.title,
            content: draftPv.content
          },
          create: {
            pageId: draftPv.pageId,
            branchId: mainBranchId,
            title: draftPv.title,
            content: draftPv.content
          }
        })
      }

      // 3. Log this publish event in the MergeLog table
      await tx.mergeLog.create({
        data: {
          spaceId,
          title: `Publish - ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
          mergedBy: userId
        }
      })
    })
  }

  /**
   * Reads MergeLog table for logs belonging to spaceId.
   */
  async findMergeLogsBySpaceId(spaceId: string) {
    return prisma.mergeLog.findMany({
      where: { spaceId },
      orderBy: { createdAt: "desc" }
    })
  }

  /**
   * Reads MergeLog table for logs belonging to spaceIds array.
   */
  async findMergeLogsBySpaceIds(spaceIds: string[]) {
    return prisma.mergeLog.findMany({
      where: { spaceId: { in: spaceIds } },
      include: {
        space: {
          include: { site: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  }
}

