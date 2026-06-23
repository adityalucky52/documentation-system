import { EditorRepository } from "./editor.repository.js"

export class EditorService {
  private repository = new EditorRepository()

  async getSpace(spaceId: string, branchId?: string) {
    const space = await this.repository.findSpaceById(spaceId)
    if (!space) {
      throw new Error("Space not found")
    }

    let pages: any[] = []
    if (branchId) {
      const pageVersions = await this.repository.findPageVersionsByBranchId(branchId)
      pages = pageVersions.map(pv => ({
        id: pv.pageId,
        title: pv.title,
        content: pv.content,
        spaceId: space.id,
        updatedAt: pv.updatedAt
      }))
    } else {
      pages = await this.repository.findPagesBySpaceId(spaceId)
    }

    return {
      ...space,
      pages
    }
  }

  async createPage(spaceId: string, title: string, branchId?: string) {
    const space = await this.repository.findSpaceById(spaceId)
    if (!space) {
      throw new Error("Space not found")
    }

    const pageId = `page_${Math.random().toString(36).substring(2, 7)}`
    const page = await this.repository.createPage(pageId, title || "Untitled Page", "", space.id)

    // Ensure default main PageVersion exists
    const mainBranchId = `${spaceId}-main`
    await this.repository.upsertPageVersion(pageId, mainBranchId, page.title, page.content)

    // If a branchId is specified, also create a PageVersion on that branch
    if (branchId) {
      await this.repository.upsertPageVersion(pageId, branchId, page.title, page.content)
    }

    return page
  }

  async updatePage(pageId: string, title?: string, content?: string, branchId?: string) {
    const page = await this.repository.findPageById(pageId)
    if (!page) {
      throw new Error("Page not found")
    }

    const targetTitle = title !== undefined ? title : page.title
    const targetContent = content !== undefined ? content : page.content

    if (branchId) {
      const updatedVersion = await this.repository.upsertPageVersion(pageId, branchId, targetTitle, targetContent)
      return {
        id: updatedVersion.pageId,
        title: updatedVersion.title,
        content: updatedVersion.content,
        spaceId: page.spaceId,
        updatedAt: updatedVersion.updatedAt
      }
    }

    return this.repository.updatePage(pageId, targetTitle, targetContent)
  }
}
