import { useState } from "react"
import { Globe, Copy, ExternalLink, Send, Check, AlertCircle } from "lucide-react"
import { type Site } from "../sitesStore"

interface SitePublishPanelProps {
  site: Site
  onPublish: () => Promise<void>
}

/**
 * SitePublishPanel Component.
 * 
 * Purpose:
 * Renders the publishing interface inside the Site Setup view.
 * If the site is unpublished, prompts the user to make it live.
 * If published, displays a success card and copyable viewer links for each space.
 */
export default function SitePublishPanel({ site, onPublish }: SitePublishPanelProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [copiedSpaceId, setCopiedSpaceId] = useState<string | null>(null)

  const handlePublishClick = async () => {
    setIsPublishing(true)
    try {
      await onPublish()
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyLink = (spaceId: string) => {
    const publicUrl = `${window.location.origin}/share/s/${spaceId}`
    navigator.clipboard.writeText(publicUrl)
    setCopiedSpaceId(spaceId)
    setTimeout(() => setCopiedSpaceId(null), 2000)
  }

  return (
    <div className="lg:col-span-8 flex flex-col gap-6 font-sans">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-semibold tracking-wider text-[#8e8e93] uppercase font-bold text-zinc-400">Publishing settings</h2>
        <p className="text-xs text-[#8e8e93] max-w-[600px]">
          Configure visibility settings for your documentation project to share it with readers outside your organization.
        </p>
      </div>

      {!site.isPublished ? (
        /* Unpublished Onboarding Layout */
        <div className="bg-[#161618] border border-[#222225] rounded-xl p-6 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#222225] border border-[#2c2c30] flex items-center justify-center text-white shrink-0">
              <Globe className="h-5 w-5 text-[#8e8e93]" />
            </div>
            <div className="flex flex-col gap-1.5 mt-0.5">
              <h3 className="text-sm font-semibold text-white">Your documentation is currently offline</h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed max-w-[500px]">
                Publishing generates public-facing links for all spaces inside this site. Anyone with the generated URLs will be able to read the documentation without logging in.
              </p>
            </div>
          </div>

          <div className="border-t border-[#1f1f23] w-full"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#e0a800]">
              <AlertCircle className="h-4 w-4" />
              <span>Visible only to organization members</span>
            </div>

            <button
              onClick={handlePublishClick}
              disabled={isPublishing}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0070f3] hover:bg-[#0060d3] disabled:bg-[#0070f3]/50 disabled:cursor-not-allowed rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin w-3 h-3 border border-t-white border-white/20 rounded-full" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Publish Documentation Site</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Published Active Panel layout */
        <div className="flex flex-col gap-6">
          {/* Status Header Success Box */}
          <div className="bg-[#161618] border border-[#34c759]/20 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#34c759]/10 border border-[#34c759]/20 flex items-center justify-center text-[#34c759] shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1.5 mt-0.5">
                <h3 className="text-sm font-semibold text-white">Your site is published and online!</h3>
                <p className="text-xs text-[#8e8e93] leading-relaxed max-w-[500px]">
                  Public sharing links are active. Updates made via approved and merged Change Requests are automatically synced to these live links.
                </p>
              </div>
            </div>
          </div>

          {/* Share links per space list */}
          <div className="bg-[#161618] border border-[#222225] rounded-xl p-6 flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-white">Shareable documentation URLs</h4>
            <p className="text-xs text-[#8e8e93] -mt-1 leading-relaxed">
              Every space acts as an environment. Share the following links with your clients or team:
            </p>

            <div className="flex flex-col gap-3 mt-1">
              {site.spaces && site.spaces.length > 0 ? (
                site.spaces.map((space) => {
                  const spaceUrl = `${window.location.origin}/share/s/${space.id}`
                  return (
                    <div 
                      key={space.id}
                      className="bg-[#0c0c0e]/80 border border-[#222225] rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-semibold text-white truncate">{space.name}</span>
                        <span className="text-[11px] text-[#8e8e93] font-mono truncate">{spaceUrl}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-sans">
                        <button
                          onClick={() => handleCopyLink(space.id)}
                          className="px-3 py-1.5 text-[11px] font-semibold text-[#8e8e93] hover:text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedSpaceId === space.id ? (
                            <>
                              <Check className="h-3 w-3 text-[#34c759]" />
                              <span className="text-[#34c759]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`/share/s/${space.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#1c1c1e] hover:bg-[#222225] border border-[#2d2d30] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer decoration-none"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Live</span>
                        </a>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-xs text-[#8e8e93] italic py-4 text-center border border-dashed border-[#222225] rounded-lg">
                  No spaces found in this site
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
