import { EditorRepository } from "./editor.repository.js"

/**
 * EditorService.
 * 
 * Purpose:
 * Core business coordinator for documentation edits.
 * Handles Git-like version isolation rules, ensuring authors can edit drafts
 * independently without overriding published content.
 */
export class EditorService {
  private repository = new EditorRepository()

  /**
   * getSpace Business logic.
   * 
   * Retrieves a space's details and nested page hierarchy.
   * If a `branchId` is provided, page titles and content are resolved from the
   * isolated `PageVersion` table (draft). Otherwise, pages are resolved from the `Page` table (live).
   */
  async getSpace(spaceId: string, branchId?: string) {
    const space = await this.repository.findSpaceById(spaceId)
    if (!space) {
      throw new Error("Space not found")
    }

    let pages: any[] = []
    if (branchId) {
      // Fetch draft versions for the selected change request branch
      const pageVersions = await this.repository.findPageVersionsByBranchId(branchId)
      pages = pageVersions.map(pv => ({
        id: pv.pageId,
        title: pv.title,
        content: pv.content,
        spaceId: space.id,
        updatedAt: pv.updatedAt
      }))
    } else {
      // Fetch live pages from master branch
      pages = await this.repository.findPagesBySpaceId(spaceId)
    }

    return {
      ...space,
      pages
    }
  }

  /**
   * createPage Business logic.
   * 
   * Steps:
   * 1. Validates that the target Space exists.
   * 2. Writes the baseline `Page` record.
   * 3. Creates a default `PageVersion` on the main branch (`spaceId-main`).
   * 4. If a specific `branchId` (change request) is active, also writes an isolated version to that branch.
   */
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

  /**
   * updatePage Business logic.
   * 
   * Router paths target this when saving document changes.
   * - If a `branchId` is passed, the update is saved to the `PageVersion` table (draft branch).
   * - Otherwise, the update is saved directly to the main `Page` table (live main branch).
   */
  async updatePage(pageId: string, title?: string, content?: string, branchId?: string) {
    const page = await this.repository.findPageById(pageId)
    if (!page) {
      throw new Error("Page not found")
    }

    const targetTitle = title !== undefined ? title : page.title
    const targetContent = content !== undefined ? content : page.content

    if (branchId) {
      // Update the draft version of the page
      const updatedVersion = await this.repository.upsertPageVersion(pageId, branchId, targetTitle, targetContent)
      return {
        id: updatedVersion.pageId,
        title: updatedVersion.title,
        content: updatedVersion.content,
        spaceId: page.spaceId,
        updatedAt: updatedVersion.updatedAt
      }
    }

    // Update live page directly
    return this.repository.updatePage(pageId, targetTitle, targetContent)
  }
}

