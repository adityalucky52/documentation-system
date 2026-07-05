import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSpacesStore } from "@features/spaces/spacesStore"
import { useAuthStore } from "@features/auth/authStore"

import SpaceOnboardingOptions from "@features/space-creation/components/SpaceOnboardingOptions"
import ImportFilesModal from "@features/space-creation/components/ImportFilesModal"
import SpaceDashboardHeader from "./SpaceDashboardHeader"
import SpaceOverviewCard from "./SpaceOverviewCard"
import SpaceSettingsPanel from "./SpaceSettingsPanel"
import SpaceGetStartedChecklist from "./SpaceGetStartedChecklist"
import PublishPanel from "@features/publishing/components/PublishPanel"

/**
 * SpaceSetupPage Component.
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
 * Renamed from SiteSetupPage — moved from sites-management into spaces feature.
 * Internal imports now pull from space-creation/ and publishing/ features.
 */
export default function SpaceSetupPage() {
  const { siteId, orgId } = useParams<{ siteId: string; orgId: string }>()
  const navigate = useNavigate()

  const { sites, setupSite, deleteSite, publishSite, error } = useSpacesStore()
  const { user } = useAuthStore()

  const site = sites.find((s) => s.id === siteId)
  const siteName = site?.name || "Site"

  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "preview" | "settings" | "publish">("overview")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  /**
   * Action: Sets up the site as blank (no pages imported).
   */
  const handleSetupBlank = async () => {
    if (!site || !user) return
    try {
      const updatedSite = await setupSite(site.id, "blank", user.id)
      const newSpaceId = updatedSite?.spaces?.[0]?.id
      if (newSpaceId) {
        navigate(`/o/${orgId}/s/${newSpaceId}?type=blank`)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to setup blank site")
    }
  }

  /**
   * Action: Sets up the site using the Prisma Docs template.
   */
  const handleSetupTemplate = async () => {
    if (!site || !user) return
    const updatedSite = await setupSite(site.id, "template", user.id)
    const firstSpaceId = updatedSite?.spaces?.[0]?.id
    if (firstSpaceId) {
      navigate(`/o/${orgId}/s/${firstSpaceId}?type=template`)
    }
  }

  /**
   * Action: Sets up the site by importing Markdown page data (title & content).
   */
  const handleSetupWithFile = async (title: string, content: string) => {
    if (!site || !user) return
    const updatedSite = await setupSite(site.id, "import", user.id, { title, content })
    const firstSpaceId = updatedSite?.spaces?.[0]?.id
    if (firstSpaceId) {
      navigate(`/o/${orgId}/s/${firstSpaceId}`)
    }
  }

  /**
   * Action: Permanently deletes the documentation site.
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

  if (!site) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Site not found
      </div>
    )
  }

  // IF SITE IS NOT SETUP: Show onboarding options
  if (!site.isSetup) {
    return (
      <>
        {error && (
          <div className="max-w-[1012px] w-full mx-auto px-8 mt-6">
            <div className="bg-[#2c1515] border border-[#ff453a]/30 text-[#ff453a] text-xs font-medium px-4 py-3 rounded-lg flex items-center justify-between">
              <span>Error: {error}</span>
            </div>
          </div>
        )}
        <SpaceOnboardingOptions
          siteName={siteName}
          onSetupBlank={handleSetupBlank}
          onSetupTemplate={handleSetupTemplate}
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

  // IF SITE IS SETUP: Show Active Site Dashboard
  return (
    <div className="flex-1 flex flex-col w-full h-full text-[#f5f5f7] bg-[#0c0c0e] overflow-y-auto">
      {/* Site Dashboard Header Panel */}
      <SpaceDashboardHeader
        siteName={siteName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orgId={orgId}
        siteSpaces={site.spaces}
      />

      <div className="max-w-[1200px] w-full mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Overview Details Card */}
        <SpaceOverviewCard siteName={siteName} isPublished={site.isPublished} spaces={site.spaces} />

        {/* Right Column: Dynamic rendering based on active tab */}
        {activeTab === "settings" ? (
          <SpaceSettingsPanel onDeleteSite={handleDeleteSite} />
        ) : activeTab === "publish" ? (
          <PublishPanel site={site} onPublish={handlePublishSite} />
        ) : (
          <SpaceGetStartedChecklist onStartFirstChangeRequest={handleStartFirstChangeRequest} />
        )}

      </div>

      <ImportFilesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSetupWithFile={handleSetupWithFile}
      />
    </div>
  )
}
