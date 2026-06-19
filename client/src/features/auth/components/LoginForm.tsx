import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuthStore } from "../authStore"

const GitBookLogo = () => (
  <div className="flex flex-col gap-[2px] items-start justify-center">
    <div className="w-[18px] h-[7px] bg-[#cfcfd3] rounded-[2px] transform skew-x-[-15deg]"></div>
    <div className="w-[18px] h-[7px] bg-[#898993] rounded-[2px] transform skew-x-[-15deg] translate-x-[2px]"></div>
    <div className="w-[18px] h-[7px] bg-[#4b4b52] rounded-[2px] transform skew-x-[-15deg] translate-x-[4px]"></div>
  </div>
)

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

export default function LoginForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const { login, isLoading, error, clearError } = useAuthStore()

  // Clear errors when navigating away or switching steps
  useEffect(() => {
    clearError()
  }, [step, clearError])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setStep('password')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) {
      const currentOrg = useAuthStore.getState().organization
      if (currentOrg) {
        navigate(`/o/${currentOrg.id}/home`)
      } else {
        navigate("/create-organization")
      }
    }
  }

  return (
    <div className="w-full max-w-[420px] flex flex-col gap-9 px-4 sm:px-6">
      {/* GitBook Logo */}
      <div className="flex items-center gap-2">
        <GitBookLogo />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-white leading-tight">
          {step === 'email' ? 'Sign in to DocuSphere' : 'Enter your password'}
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        {step === 'email' ? (
          <>
            {/* Social Authentication buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full h-10 gap-2 border-[#26262b] bg-[#121214] hover:bg-[#1b1b1f] hover:text-white text-[#d4d4d8] font-medium text-xs rounded-lg transition-colors">
                <GithubIcon className="size-4 text-[#d4d4d8]" />
                Continue with GitHub
              </Button>
              <Button variant="outline" className="w-full h-10 gap-2 border-[#26262b] bg-[#121214] hover:bg-[#1b1b1f] hover:text-white text-[#d4d4d8] font-medium text-xs rounded-lg transition-colors">
                <GoogleIcon className="size-4" />
                Continue with Google
              </Button>
            </div>

            <div className="relative flex items-center justify-center my-1.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#26262b]" />
              </div>
              <span className="relative z-10 bg-[#0c0c0e] px-4 text-[10px] text-[#71717a] font-semibold uppercase tracking-wider">
                OR
              </span>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter work email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-[#0e0e10] border-[#26262b] text-white placeholder-[#71717a] focus-visible:border-white focus-visible:ring-0 rounded-lg text-sm transition-colors"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 mt-1 bg-[#27272a] hover:bg-[#3f3f46] text-[#e4e4e7] hover:text-white font-medium text-sm rounded-lg transition-all"
              >
                Continue
              </Button>
            </form>
          </>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {/* Back to email link */}
              <div className="flex items-center justify-between text-xs text-[#71717a]">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <ArrowLeft className="size-3" />
                  <span>{email}</span>
                </button>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-[#0e0e10] border-[#26262b] text-white placeholder-[#71717a] focus-visible:border-white focus-visible:ring-0 rounded-lg text-sm transition-colors"
              />

              {error && (
                <span className="text-xs text-rose-500 font-semibold">{error}</span>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-10 mt-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-5 text-center">
        <p className="text-xs text-[#71717a] leading-relaxed">
          By continuing, you agree to the{" "}
          <a href="#" className="underline hover:text-[#a1a1aa] transition-colors">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="underline hover:text-[#a1a1aa] transition-colors">Privacy policy</a>.
        </p>

        <p className="text-sm text-[#a1a1aa]">
          Get started with DocuSphere.{" "}
          <Link to="/register" className="font-bold text-white hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
