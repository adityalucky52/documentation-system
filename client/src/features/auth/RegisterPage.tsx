import BrandingPanel from "./components/BrandingPanel"
import RegisterForm from "./components/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0c0c0e]">
      {/* Form (Left side on desktop) */}
      <div className="flex flex-1 flex-col justify-center items-center py-12 lg:py-0">
        <RegisterForm />
      </div>

      {/* Visual showcase (Right side on desktop) */}
      <BrandingPanel />
    </div>
  )
}
