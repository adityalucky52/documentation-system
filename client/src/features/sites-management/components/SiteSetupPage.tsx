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

export default function SiteSetupPage() {
  const { siteId, orgId } = useParams<{ siteId: string; orgId: string }>()
  const navigate = useNavigate()
  const { sites, setupSite, deleteSite } = useSitesStore()
  const { user } = useAuthStore()
  const site = sites.find((s) => s.id === siteId)
  const siteName = site?.name || "Site"
  
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "preview" | "settings" | "publish">("overview")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleSetupBlank = async () => {
    if (!site || !user) return
    await setupSite(site.id, "blank", user.id)
  }

  const handleSetupWithFile = async (title: string, content: string) => {
    if (!site || !user) return
    await setupSite(site.id, "import", user.id, { title, content })
  }

  const handleDeleteSite = async () => {
    if (!site || !user) return
    if (confirm(`Are you absolutely sure you want to delete the site "${site.name}"? This action is permanent and cannot be undone.`)) {
      const success = await deleteSite(site.id, user.id)
      if (success) {
        navigate(`/o/${orgId}/home`)
      }
    }
  }

  const handleStartFirstChangeRequest = () => {
    if (site?.spaces && site.spaces.length > 0) {
      navigate(`/o/${orgId}/s/${site.spaces[0].id}`)
    } else {
      setActiveTab("editor")
    }
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Site not found
      </div>
    )
  }

  // IF SITE IS NOT SETUP: Show Onboarding templates
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

  // IF SITE IS SETUP: Show Active Site Dashboard (Overview, spaces, checklists)
  return (
    <div className="flex-1 flex flex-col w-full h-full text-[#f5f5f7] bg-[#0c0c0e] overflow-y-auto">
      <SiteDashboardHeader
        siteName={siteName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orgId={orgId}
        siteSpaces={site.spaces}
      />

      <div className="max-w-[1200px] w-full mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Site Info Card (4 cols) */}
        <SiteOverviewCard siteName={siteName} spaces={site.spaces} />

        {/* Right Column: Get Started Checklist or Settings Panel */}
        {activeTab === "settings" ? (
          <SiteSettingsPanel onDeleteSite={handleDeleteSite} />
        ) : (
          <SiteGetStartedChecklist onStartFirstChangeRequest={handleStartFirstChangeRequest} />
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
