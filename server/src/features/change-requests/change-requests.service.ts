import { ChangeRequestsRepository } from "./change-requests.repository.js"
import { ChangeRequestStatus } from "../../../generated/prisma/index.js"

/**
 * ChangeRequestsService.
 * 
 * Purpose:
 * Core version control logic (branch copying, diff analysis, transaction merge logic).
 * Mimics git mechanics inside SQL tables (`Branch`, `PageVersion`, `ChangeRequest`).
 */
export class ChangeRequestsService {
  private repository = new ChangeRequestsRepository()

  /**
   * Helper: ensureMainBranchExists.
   * 
   * Purpose:
   * Guarantees that the baseline 'main' branch exists for a space.
   * If missing, creates the main branch and populates it with baseline PageVersion records.
   */
  async ensureMainBranchExists(spaceId: string) {
    const mainBranchId = `${spaceId}-main`
    
    // Find or create main branch
    let mainBranch = await this.repository.findBranchById(mainBranchId)
    if (!mainBranch) {
      mainBranch = await this.repository.createBranch(mainBranchId, "main", spaceId)
    }

    // Find all pages in this space
    const pages = await this.repository.findPagesBySpaceId(spaceId)

    // Ensure every page has a PageVersion for the main branch
    for (const page of pages) {
      await this.repository.upsertPageVersion(page.id, mainBranchId, page.title, page.content)
    }

    return mainBranchId
  }

  /**
   * createChangeRequest.
   * 
   * Purpose:
   * Initializes a new workspace edit branch and copies all current main branch versions into it,
   * creating an isolated workspace for edits.
   * 
   * Steps:
   * 1. Confirms main branch existence.
   * 2. Generates new branch credentials.
   * 3. Loops and copies all main `PageVersion` records into the new branch.
   * 4. Registers the new `ChangeRequest` database record in OPEN status.
   */
  async createChangeRequest(spaceId: string, title: string, userId: string) {
    // Ensure main branch exists
    const mainBranchId = await this.ensureMainBranchExists(spaceId)

    // Create a new branch ID and format the branch name based on the request title
    const branchId = `branch_${Math.random().toString(36).substring(2, 9)}`
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const branchName = `change-request-${cleanTitle || Math.random().toString(36).substring(2, 5)}`

    await this.repository.createBranch(branchId, branchName, spaceId)

    // Copy all page versions from main branch to the new branch
    const mainPageVersions = await this.repository.findPageVersionsByBranchId(mainBranchId)
    for (const pv of mainPageVersions) {
      await this.repository.createPageVersion(pv.pageId, branchId, pv.title, pv.content)
    }

    // Create the Change Request
    const changeRequestId = `cr_${Math.random().toString(36).substring(2, 9)}`
    return this.repository.createChangeRequest(
      changeRequestId,
      title || "Untitled Change Request",
      ChangeRequestStatus.OPEN,
      spaceId,
      branchId,
      mainBranchId,
      userId
    )
  }

  /**
   * getChangeRequests.
   * 
   * Purpose:
   * Lists the change requests in a Space.
   */
  async getChangeRequests(spaceId: string, status?: string) {
    const filterStatus = status ? (status.toUpperCase() as ChangeRequestStatus) : undefined
    return this.repository.findChangeRequestsBySpaceId(spaceId, filterStatus)
  }

  /**
   * getChangeRequestDetail.
   * 
   * Purpose:
   * Returns details for a Change Request, including a side-by-side comparison (diff)
   * of modified pages between the source and target branches.
   * 
   * Diff Algorithm:
   * Loops through page versions on the source branch, matches them with versions on the target branch,
   * and highlights modified titles or content.
   */
  async getChangeRequestDetail(changeRequestId: string) {
    const changeRequest = await this.repository.findChangeRequestById(changeRequestId)
    if (!changeRequest) {
      throw new Error("Change Request not found")
    }

    // Compare source branch versions with target branch versions
    const diffs = changeRequest.sourceBranch.pageVersions.map(sourcePv => {
      const targetPv = changeRequest.targetBranch.pageVersions.find(tpv => tpv.pageId === sourcePv.pageId)
      return {
        pageId: sourcePv.pageId,
        title: sourcePv.title,
        content: sourcePv.content,
        originalTitle: targetPv?.title || "",
        originalContent: targetPv?.content || "",
        isModified: !targetPv || targetPv.title !== sourcePv.title || targetPv.content !== sourcePv.content
      }
    })

    return {
      changeRequest,
      diffs
    }
  }

  /**
   * mergeChangeRequest.
   * 
   * Purpose:
   * Commits draft changes back to the main branch.
   * 
   * Database Operations:
   * Executes a database transaction that:
   * 1. Updates live pages in the `Page` table.
   * 2. Promotes draft versions in the `PageVersion` table to target main branches.
   * 3. Marks the change request status as MERGED.
   */
  async mergeChangeRequest(changeRequestId: string) {
    const changeRequest = await this.repository.findChangeRequestById(changeRequestId)
    if (!changeRequest) {
      throw new Error("Change Request not found")
    }

    if (changeRequest.status === ChangeRequestStatus.MERGED) {
      throw new Error("Change request is already merged")
    }

    // Execute atomic transaction merge updates
    await this.repository.mergeChangeRequestTransaction(
      changeRequestId,
      changeRequest.targetBranchId,
      changeRequest.sourceBranch.pageVersions
    )

    return { message: "Change request merged successfully" }
  }

  /**
   * getOrgChangeRequests.
   * 
   * Purpose:
   * Fetches change requests across the entire organization.
   */
  async getOrgChangeRequests(orgId: string, status?: string) {
    const filterStatus = status ? (status.toUpperCase() as ChangeRequestStatus) : undefined
    
    // Find all sites in the organization
    const sites = await this.repository.findSitesByOrgId(orgId)
    const siteIds = sites.map(s => s.id)

    // Find all spaces in these sites
    const spaces = await this.repository.findSpacesBySiteIds(siteIds)
    const spaceIds = spaces.map(sp => sp.id)

    return this.repository.findOrgChangeRequests(spaceIds, filterStatus)
  }


}

