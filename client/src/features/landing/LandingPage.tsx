import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Star, CheckCircle } from "lucide-react"

/**
 * GithubIcon SVG Component.
 * Displays GitHub's logo as a clean outline shape using Lucide stroke style properties.
 */
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

/**
 * LandingPage Component.
 * 
 * Purpose:
 * Renders the introductory landing page of DocuSphere.
 * Provides public links for logging in or signing up.
 * 
 * Sub-layouts:
 * 1. Navigation Header: Branding title, mock menus, and link buttons to `/login` and `/register`.
 * 2. Hero Section: Catchy slogan, description, call-to-actions, and list of platform perks.
 *    Incorporates a soft blurred background glow overlay using absolute positioning and high tailwind blurs.
 * 3. Footer: Simple copyright note displaying the current dynamic year.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <BookOpen className="size-6 text-emerald-500" />
          <span className="font-heading text-lg font-bold tracking-tight">DocuSphere</span>
        </div>
        
        {/* Navigation items (Mock links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Features</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Templates</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Pricing</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Changelog</a>
        </nav>

        {/* Auth entry links */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">Sign up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 lg:py-32 relative overflow-hidden">
        {/* Decorative backdrop light spot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl flex flex-col gap-6 relative z-10">
          {/* Release version pill banner */}
          <div className="inline-flex items-center gap-2 self-center rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Star className="size-3.5 fill-current" />
            <span>DocuSphere 2.0 is now live</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500 bg-clip-text text-transparent">
            Where knowledge meets beautiful design.
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            DocuSphere is the modern documentation platform where teams write, collaborate, and share technical documentation seamlessly.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
            <Link to="/register">
              <Button size="lg" className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold gap-2 shadow-lg shadow-emerald-500/20">
                Start for free
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base font-medium gap-2">
              <GithubIcon className="size-5" strokeWidth="2" />
              Star on GitHub
            </Button>
          </div>

          {/* Feature highlights checklist */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="size-4 text-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="size-4 text-emerald-500" />
              14-day free trial
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="size-4 text-emerald-500" />
              GitHub Sync active
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <p>&copy; {new Date().getFullYear()} DocuSphere. Built using React, TypeScript, Tailwind, and shadcn/ui.</p>
      </footer>
    </div>
  )
}

