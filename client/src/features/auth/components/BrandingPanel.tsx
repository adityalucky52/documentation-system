
/**
 * BrandingPanel Component.
 * 
 * Purpose:
 * Renders the decorative visual branding pane shown on the right side of the screen during Login/Register on desktop screens.
 * Contains:
 * 1. A glowing background pattern using an inline SVG with linear gradients and gaussian filters.
 * 2. A simulated workspace interface composed of 3 overlapping cards representing mock documentation structures (NebulaOS, BlocAPI, Supra AI).
 * 
 * Responsiveness:
 * - Hidden on mobile screens (`hidden`)
 * - Rendered starting from desktop viewport (`lg:flex` with 55% width).
 */
export default function BrandingPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[55%] bg-[#08080a] justify-center items-center overflow-hidden border-l border-zinc-900">
      
      {/* 
        Orange Swirl SVG Background:
        Utilizes an SVG path with high standard-deviation gaussian blur and an oklch/orange linear gradient to render a smooth mesh glow.
      */}
      <div className="absolute inset-y-0 left-0 w-full flex items-center justify-center pointer-events-none opacity-90">
        <svg className="w-[140%] h-[140%] -translate-x-[20%]" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradient definition for the glowing lines */}
            <linearGradient id="orange-glow" x1="100" y1="100" x2="700" y2="700" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff4500" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#ff8c00" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#ffa500" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
            </linearGradient>
            {/* Blur filter for the neon/glowing light effect */}
            <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="30" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Swirling glowing tubes */}
          <path
            d="M 150,600 C 120,400 250,200 450,200 C 650,200 700,400 600,550 C 500,700 300,650 250,500 C 200,350 350,150 550,100"
            stroke="url(#orange-glow)"
            strokeWidth="88"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow-blur)"
          />
          <path
            d="M 180,570 C 160,420 270,240 460,240 C 620,240 660,390 580,510 C 500,630 340,600 300,480 C 260,360 380,180 530,140"
            stroke="#ff3d00"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* 
        Floating Cascading Documentation Cards:
        Renders mock editor workspaces using CSS transform rotates and translations to simulate a 3D overlay.
      */}
      <div className="absolute right-[-10%] top-[10%] w-[90%] flex flex-col gap-6 transform rotate-[-20deg] scale-[0.88] origin-top-right select-none">
        
        {/* Card 1: NebulaOS (Light Theme Card mock) */}
        <div className="w-[620px] rounded-2xl bg-white text-zinc-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-zinc-200/80 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <span className="size-5 rounded bg-zinc-950 flex items-center justify-center text-[10px] text-emerald-400 font-bold">N</span>
            <span className="font-semibold text-sm tracking-tight text-zinc-950">NebulaOS</span>
            <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded ml-2 font-medium">Published Docs</span>
          </div>
          <div className="flex gap-4">
            <div className="w-1/3 flex flex-col gap-2 border-r border-zinc-100 pr-4 text-xs text-zinc-500 font-medium">
              <span className="text-zinc-950 font-semibold bg-zinc-100/80 px-2 py-1.5 rounded">Introduction</span>
              <span className="px-2 py-1.5 hover:text-zinc-950">Quickstart</span>
              <span className="px-2 py-1.5 hover:text-zinc-950">Basic configuration</span>
              <span className="px-2 py-1.5 hover:text-zinc-950">Theme configuration</span>
            </div>
            <div className="w-2/3 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Resources</span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 mt-1">Introduction</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                NebulaOS is an open-source, distributed operating system built for the OpenHQ Foundation.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: BlocAPI (Dark Theme Card mock with translation) */}
        <div className="w-[620px] rounded-2xl bg-[#0d0e12] text-zinc-400 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border border-zinc-800 p-5 flex flex-col gap-4 translate-x-8">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
            <span className="size-5 rounded bg-orange-500 flex items-center justify-center text-[10px] text-white font-bold">B</span>
            <span className="font-semibold text-sm tracking-tight text-white">BlocAPI</span>
            <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded ml-2 font-medium">Documentation</span>
          </div>
          <div className="flex gap-4">
            <div className="w-1/3 flex flex-col gap-2 border-r border-zinc-800 pr-4 text-xs font-medium">
              <span className="px-2 py-1.5 hover:text-white">APIs</span>
              <span className="text-white font-semibold bg-zinc-900 px-2 py-1.5 rounded">Accounts API</span>
              <span className="pl-6 text-zinc-500">Current user</span>
              <span className="px-2 py-1.5 hover:text-white">Channels API</span>
            </div>
            <div className="w-2/3 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Developer Process</span>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">Accounts API</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                The Accounts API handles secure authorization and workspace configuration endpoints.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Supra AI (Light Theme Card mock with extra translation) */}
        <div className="w-[620px] rounded-2xl bg-white text-zinc-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-zinc-200/80 p-5 flex flex-col gap-4 translate-x-16">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <span className="size-5 rounded bg-violet-600 flex items-center justify-center text-[10px] text-white font-bold">S</span>
            <span className="font-semibold text-sm tracking-tight text-zinc-950">Supra AI</span>
            <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded ml-2 font-medium">Guides</span>
          </div>
          <div className="flex gap-4">
            <div className="w-1/3 flex flex-col gap-2 border-r border-zinc-100 pr-4 text-xs text-zinc-500 font-medium">
              <span className="text-zinc-950 font-semibold bg-zinc-100/80 px-2 py-1.5 rounded">Welcome</span>
              <span className="px-2 py-1.5 hover:text-zinc-950">Prompt guide</span>
              <span className="px-2 py-1.5 hover:text-zinc-950">Model training</span>
              <span className="px-2 py-1.5 hover:text-zinc-950">Deployment</span>
            </div>
            <div className="w-2/3 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">SDKs & Integrations</span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 mt-1">Model Training</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Configure hyperparameters and compute nodes for optimized weights training.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

