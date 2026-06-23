import { prisma } from "../../lib/prisma.js"

export class EditorRepository {
  async findSpaceById(spaceId: string) {
    return prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        site: true
      }
    })
  }

  async findPageVersionsByBranchId(branchId: string) {
    return prisma.pageVersion.findMany({
      where: { branchId },
      orderBy: { updatedAt: "asc" }
    })
  }

  async findPagesBySpaceId(spaceId: string) {
    return prisma.page.findMany({
      where: { spaceId },
      orderBy: { createdAt: "asc" }
    })
  }

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

  async findPageById(pageId: string) {
    return prisma.page.findUnique({
      where: { id: pageId }
    })
  }

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
