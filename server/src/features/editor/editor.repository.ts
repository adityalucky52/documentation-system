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
}

