import BrandingPanel from "./components/BrandingPanel"
import LoginForm from "./components/LoginForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0c0c0e]">
      {/* Form (Left side on desktop) */}
      <div className="flex flex-1 flex-col justify-center items-center py-12 lg:py-0">
        <LoginForm />
      </div>

      {/* Visual showcase (Right side on desktop) */}
      <BrandingPanel />
    </div>
  )
}
