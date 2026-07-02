import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSitesStore } from "../sitesStore"
import { useAuthStore } from "../../auth/authStore"

import SiteOnboardingOptions from "./SiteOnboardingOptions"
import ImportFilesModal from "./ImportFilesModal"
import SiteDashboardHeader from "./SiteDashboardHeader"
import SiteOverviewCard from "./SiteOverviewCard"
import SiteSettingsPanel from "./SiteSettingsPanel"
import SiteGetStartedChecklist from "./SiteGetStartedChecklist"
import SitePublishPanel from "./SitePublishPanel"

/**
 * SiteSetupPage Component.
 * 
 * Purpose:
 * Renders the dashboard and configuration hub for a specific documentation site.
 * 
 * Conditional Rendering Strategy:
 * 1. If site metadata is not found: Renders an error notice.
 * 2. If the site is brand new (`isSetup` === false): Displays the Onboarding view
 *    where the user chooses to initialize a blank workspace or import a Markdown file.
 * 3. If the site is already setup: Displays the main management dashboard, splitting into tabs
 *    (Overview checklist vs Settings panel with deletion features).
 * 
 * State & Store Integrations:
 * - `useParams`: Extracts `:siteId` and `:orgId` parameters from the React Router path context.
 * - `useSitesStore`: Supplies the `sites` list, `setupSite` action (onboarding), and `deleteSite` API action.
 * - `useAuthStore`: Retrieves current `user.id` to identify requests in API headers.
 */
export default function SiteSetupPage() {
  const { siteId, orgId } = useParams<{ siteId: string; orgId: string }>()
  const navigate = useNavigate()
  
  // Sites Store integration for retrieving matching site structure and setup actions
  const { sites, setupSite, deleteSite, publishSite } = useSitesStore()
  // Auth Store integration for active user headers
  const { user } = useAuthStore()
  
  // Find current site object within the list of fetched sites
  const site = sites.find((s) => s.id === siteId)
  const siteName = site?.name || "Site"
  
  // Tab menu visibility control state
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "preview" | "settings" | "publish">("overview")
  // Toggle for Markdown Import Modal dialog
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  /**
   * Action: Sets up the site as blank (no pages imported).
   */
  const handleSetupBlank = async () => {
    if (!site || !user) return
    await setupSite(site.id, "blank", user.id)
  }

  /**
   * Action: Sets up the site by importing Markdown page data (title & content).
   * Passed as a callback handler to ImportFilesModal.
   */
  const handleSetupWithFile = async (title: string, content: string) => {
    if (!site || !user) return
    await setupSite(site.id, "import", user.id, { title, content })
  }

  /**
   * Action: Permanently deletes the documentation site.
   * Prompts native window confirm dialog. If verified, routes user back to Organization Home.
   */
  const handleDeleteSite = async () => {
    if (!site || !user) return
    if (confirm(`Are you absolutely sure you want to delete the site "${site.name}"? This action is permanent and cannot be undone.`)) {
      const success = await deleteSite(site.id, user.id)
      if (success) {
        navigate(`/o/${orgId}/home`)
      }
    }
  }

  /**
   * Action: Redirects the user directly into the text editor of the site's first default space.
   */
  const handleStartFirstChangeRequest = () => {
    if (site?.spaces && site.spaces.length > 0) {
      navigate(`/o/${orgId}/s/${site.spaces[0].id}`)
    } else {
      setActiveTab("editor")
    }
  }

  /**
   * Action: Publishes the site.
   */
  const handlePublishSite = async () => {
    if (!site || !user) return
    await publishSite(site.id, user.id)
  }

  // Error boundary: Site does not exist in store list
  if (!site) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Site not found
      </div>
    )
  }

  // IF SITE IS NOT SETUP: Show onboarding options to establish spaces and pages
  if (!site.isSetup) {
    return (
      <>
        <SiteOnboardingOptions
          siteName={siteName}
          onSetupBlank={handleSetupBlank}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />

        <ImportFilesModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSetupWithFile={handleSetupWithFile}
        />
      </>
    )
  }

  // IF SITE IS SETUP: Show Active Site Dashboard (Overview, spaces list, checklists, settings)
  return (
    <div className="flex-1 flex flex-col w-full h-full text-[#f5f5f7] bg-[#0c0c0e] overflow-y-auto">
      {/* Site Dashboard Header Panel (Tab controllers) */}
      <SiteDashboardHeader
        siteName={siteName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orgId={orgId}
        siteSpaces={site.spaces}
      />

      <div className="max-w-[1200px] w-full mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Overview Details Card (Displays site meta statistics, spaces size count) */}
        <SiteOverviewCard siteName={siteName} isPublished={site.isPublished} spaces={site.spaces} />

        {/* Right Column: Dynamic rendering based on active tab */}
        {activeTab === "settings" ? (
          <SiteSettingsPanel onDeleteSite={handleDeleteSite} />
        ) : activeTab === "publish" ? (
          <SitePublishPanel site={site} onPublish={handlePublishSite} />
        ) : (
          <SiteGetStartedChecklist onStartFirstChangeRequest={handleStartFirstChangeRequest} />
        )}

      </div>

      {/* Hidden container fallback dialog if user triggers imports on setting overlays */}
      <ImportFilesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSetupWithFile={handleSetupWithFile}
      />
    </div>
  )
}

