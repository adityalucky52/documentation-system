import BrandingPanel from "./components/BrandingPanel"
import LoginForm from "./components/LoginForm"

/**
 * LoginPage Component.
 * 
 * Purpose:
 * Renders the login layout of the application. It splits the screen on desktop displays:
 * - Left pane: Houses the interactive LoginForm, where the user inputs credentials.
 * - Right pane: Houses the static BrandingPanel, showcasing graphics and branding copy.
 * 
 * CSS Styling:
 * Uses flex layout, setting a full screen min-h-screen container. On larger viewports (lg:),
 * it displays items side-by-side using `flex-row`. In dark mode, it uses a deep grey/black bg-[#0c0c0e].
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0c0c0e]">
      {/* Form container (Left side on desktop screen size) */}
      <div className="flex flex-1 flex-col justify-center items-center py-12 lg:py-0">
        <LoginForm />
      </div>

      {/* Visual showcase panel (Right side on desktop screen size) */}
      <BrandingPanel />
    </div>
  )
}

