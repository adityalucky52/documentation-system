import { ChangeRequestsRepository } from "./change-requests.repository.js"
import { ChangeRequestStatus } from "../../../generated/prisma/index.js"

export class ChangeRequestsService {
  private repository = new ChangeRequestsRepository()

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

  async createChangeRequest(spaceId: string, title: string, userId: string) {
    // Ensure main branch exists
    const mainBranchId = await this.ensureMainBranchExists(spaceId)

    // Create a new branch
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
      ChangeRequestStatus.DRAFT,
      spaceId,
      branchId,
      mainBranchId,
      userId
    )
  }

  async getChangeRequests(spaceId: string, status?: string) {
    const filterStatus = status ? (status.toUpperCase() as ChangeRequestStatus) : undefined
    return this.repository.findChangeRequestsBySpaceId(spaceId, filterStatus)
  }

  async getChangeRequestDetail(changeRequestId: string) {
    const changeRequest = await this.repository.findChangeRequestById(changeRequestId)
    if (!changeRequest) {
      throw new Error("Change Request not found")
    }

    // Map differences
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

  async mergeChangeRequest(changeRequestId: string) {
    const changeRequest = await this.repository.findChangeRequestById(changeRequestId)
    if (!changeRequest) {
      throw new Error("Change Request not found")
    }

    if (changeRequest.status === ChangeRequestStatus.MERGED) {
      throw new Error("Change request is already merged")
    }

    await this.repository.mergeChangeRequestTransaction(
      changeRequestId,
      changeRequest.targetBranchId,
      changeRequest.sourceBranch.pageVersions
    )

    return { message: "Change request merged successfully" }
  }

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

  async requestReview(changeRequestId: string) {
    const changeRequest = await this.repository.findChangeRequestById(changeRequestId)
    if (!changeRequest) {
      throw new Error("Change request not found")
    }

    if (changeRequest.status !== ChangeRequestStatus.DRAFT) {
      throw new Error("Only draft change requests can be sent for review")
    }

    return this.repository.updateChangeRequestStatus(changeRequestId, ChangeRequestStatus.OPEN)
  }
}
