import { BookOpen, Globe, Upload } from "lucide-react"

/**
 * SpaceOnboardingOptionsProps
 * @param siteName - The name of the documentation site being created.
 * @param onSetupBlank - Callback function to navigate or initiate the setup of a blank site.
 * @param onSetupTemplate - Callback function to setup from a Prisma Docs template.
 * @param onOpenImportModal - Callback function to trigger the content import workflow.
 */
interface SpaceOnboardingOptionsProps {
  siteName: string
  onSetupBlank: () => void
  onSetupTemplate: () => void
  onOpenImportModal: () => void
}

/**
 * SpaceOnboardingOptions Component
 *
 * Purpose:
 * Renders the onboarding selection view for a new site, allowing users to:
 * 1. Start with a template (Documentation structure).
 * 2. Import existing content (Docs, Markdown, HTML).
 * 3. Start from a blank state.
 *
 * Renamed from SiteOnboardingOptions — moved from sites-management into space-creation.
 */
export default function SpaceOnboardingOptions({
  siteName,
  onSetupBlank,
  onSetupTemplate,
  onOpenImportModal
}: SpaceOnboardingOptionsProps) {
  return (
    <div className="max-w-[1012px] w-full mx-auto px-8 py-12 flex flex-col gap-10 font-sans text-[#f5f5f7]">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-[#8e8e93] font-medium">
          <span>Docs sites</span>
          <span>/</span>
          <span className="text-white">{siteName}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white leading-tight mt-1">
          Set up your space
        </h1>
        <p className="text-sm text-[#8e8e93]">
          Choose how you want to start building content for <strong className="text-white font-medium">{siteName}</strong>.
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Docs Template Option */}
        <div
          onClick={onSetupTemplate}
          className="flex flex-col bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl overflow-hidden group cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="h-[150px] bg-[#0c0c0e] border-b border-[#222225] flex items-center justify-center p-4 relative overflow-hidden shrink-0">
            <div className="w-[180px] h-[100px] bg-[#161618] border border-[#222225] rounded-lg p-2.5 flex flex-col gap-1.5 shadow-lg group-hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-[#312e81]/30 border border-[#4338ca]/30 flex items-center justify-center text-[#818cf8]">
                  <BookOpen className="h-2 w-2" />
                </div>
                <div className="h-1.5 w-12 bg-[#3a3a3f] rounded"></div>
              </div>
              <div className="h-1 w-28 bg-[#2c2c30] rounded"></div>
              <div className="h-1 w-24 bg-[#2c2c30] rounded"></div>
              <div className="h-1 w-20 bg-[#2c2c30] rounded"></div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl"></div>
          </div>
          <div className="p-5 flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
              Docs template
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              Start with a ready-made documentation layout you can customize.
            </p>
          </div>
        </div>

        {/* Import Option */}
        <div
          onClick={onOpenImportModal}
          className="flex flex-col bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl overflow-hidden group cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="h-[150px] bg-[#0c0c0e] border-b border-[#222225] flex items-center justify-center p-4 relative overflow-hidden shrink-0">
            <div className="flex items-center gap-6 group-hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 rounded-xl bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-[#8e8e93]">
                <Globe className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-[#312e81]/20 border border-[#4338ca]/30 flex items-center justify-center text-[#818cf8]">
                  <Upload className="h-4 w-4" />
                </div>
                <div className="h-1 w-10 bg-[#3a3a3f] rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
              Import
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              Bring in existing content from online docs, Markdown, or HTML files.
            </p>
          </div>
        </div>

        {/* Blank Option */}
        <div
          onClick={onSetupBlank}
          className="flex flex-col bg-[#161618] border border-[#222225] hover:border-[#323236] rounded-xl overflow-hidden group cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="h-[150px] bg-[#0c0c0e] border-b border-[#222225] flex items-center justify-center p-4 relative overflow-hidden shrink-0">
            <div className="w-[180px] h-[100px] bg-[#161618] border border-[#222225] rounded-lg p-3 flex flex-col gap-2 shadow-lg group-hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-1.5 border-b border-[#222225] pb-2">
                <div className="h-1.5 w-16 bg-[#3a3a3f] rounded"></div>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="h-1 w-24 bg-[#2c2c30] rounded"></div>
                <div className="h-1 w-16 bg-[#2c2c30] rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
              Blank
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              Begin with an empty space and create everything from scratch.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
