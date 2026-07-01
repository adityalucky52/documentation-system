import { EditorRepository } from "./editor.repository.js"
import { prisma } from "../../lib/prisma.js"

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
      // Ensure the branch and page version baselines exist before loading
      await this.ensureBranchExists(spaceId, branchId)

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
        createdAt: page.createdAt,
        updatedAt: updatedVersion.updatedAt
      }
    } else {
      // Update live page directly
      const updatedPage = await this.repository.updatePage(pageId, targetTitle, targetContent)
      return updatedPage
    }
  }

  /**
   * Helper: ensureBranchExists
   * 
   * Purpose:
   * Guarantees that a Branch entry exists in the DB, and if there are no page versions,
   * seeds the branch with page versions cloned from the live Page table.
   */
  async ensureBranchExists(spaceId: string, branchId: string) {
    let branch = await this.repository.findBranchById(branchId)
    if (!branch) {
      const name = branchId.includes("-main") ? "main" : "draft"
      branch = await this.repository.createBranch(branchId, name, spaceId)
    }

    const pageVersions = await this.repository.findPageVersionsByBranchId(branchId)
    if (pageVersions.length === 0) {
      // Seed with live page versions
      const livePages = await this.repository.findPagesBySpaceId(spaceId)
      for (const page of livePages) {
        await this.repository.upsertPageVersion(page.id, branchId, page.title, page.content)
      }
    }
  }

  /**
   * mergeSpace Business logic.
   * 
   * Purpose:
   * Atomically publishes all draft page versions on `${spaceId}-draft` to `${spaceId}-main`
   * and overrides the live `Page` table contents.
   */
  async mergeSpace(spaceId: string, userId: string) {
    const draftBranchId = `${spaceId}-draft`
    const mainBranchId = `${spaceId}-main`

    // Ensure baseline branch references exist
    await this.ensureBranchExists(spaceId, draftBranchId)
    await this.ensureBranchExists(spaceId, mainBranchId)

    // Pull modifications from draft branch
    const pageVersions = await this.repository.findPageVersionsByBranchId(draftBranchId)
    if (pageVersions.length === 0) {
      return { message: "No changes to merge" }
    }

    // Execute atomic merge transaction
    await this.repository.mergeBranchTransaction(spaceId, draftBranchId, mainBranchId, pageVersions, userId)
    return { message: "Workspace merged to live successfully" }
  }

  /**
   * Retrieves all merge logs for a specific Space.
   */
  async getSpaceMergeLogs(spaceId: string) {
    return this.repository.findMergeLogsBySpaceId(spaceId)
  }

  /**
   * Retrieves all merge logs for an Organization by finding all spaces matching sites inside the org.
   */
  async getOrgMergeLogs(orgId: string) {
    // 1. Find all sites in the organization
    // Wait, let's make sure we have access to site query.
    // Let's use EditorRepository to query sites or spaces!
    // Since sites are grouped under orgs, we can query Sites and Spaces.
    // Let's add helper findSitesByOrgId / findSpacesBySiteIds inside EditorRepository?
    // Wait! sitesStore and changeRequestsRepository already have findSitesByOrgId and findSpacesBySiteIds!
    // Let's see if we can implement them in EditorRepository or check if we can query them directly.
    // Yes! Let's write them in EditorRepository or query prisma directly in repository.
    // We already added findSitesByOrgId and findSpacesBySiteIds in ChangeRequestsRepository,
    // so let's check if we can import them or write them directly.
    // Writing them directly in EditorRepository is cleanest! Let's see: we did add:
    // findSitesByOrgId and findSpacesBySiteIds. Wait! We viewed them in ChangeRequestsRepository.
    // Let's implement them directly in EditorRepository so it's self-contained:
    // Oh, wait, we can just query spaces that belong to sites in the organization.
    // Let's see how:
    const spaces = await prisma.space.findMany({
      where: {
        site: {
          organizationId: orgId
        }
      },
      select: { id: true }
    })
    const spaceIds = spaces.map(s => s.id)
    return this.repository.findMergeLogsBySpaceIds(spaceIds)
  }
}
