import BrandingPanel from "./components/BrandingPanel"
import RegisterForm from "./components/RegisterForm"

/**
 * RegisterPage Component.
 * 
 * Purpose:
 * Renders the signup/registration interface. Like the LoginPage, it features a split layout:
 * - Left pane: Houses the interactive RegisterForm, where users fill in details to create an account.
 * - Right pane: Displays the BrandingPanel visual branding content.
 * 
 * CSS Styling:
 * Adapts responsively using TailwindCSS flex rules (stacked `flex-col` on small screens, row layout `lg:flex-row` on desktops).
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0c0c0e]">
      {/* Form container (Left side on desktop screen size) */}
      <div className="flex flex-1 flex-col justify-center items-center py-12 lg:py-0">
        <RegisterForm />
      </div>

      {/* Visual showcase panel (Right side on desktop screen size) */}
      <BrandingPanel />
    </div>
  )
}

