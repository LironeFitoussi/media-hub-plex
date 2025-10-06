import { Link } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function Header() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const { user } = useAppSelector((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-11/12 max-w-6xl">
      <nav className="bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg border border-white/30">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl sm:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300 z-50"
            onClick={closeMobileMenu}
          >
            YourApp
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/downloads" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
                >
                  Downloads
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.profilePicture && (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                  />
                )}
                <span className="text-gray-700 font-medium hidden lg:inline">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  variant="outline"
                  className="bg-white/90 hover:bg-white text-gray-700"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => loginWithRedirect()}
                className="bg-white/90 hover:bg-white text-blue-600 shadow-sm hover:shadow-md transition-all duration-300"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden z-50 p-2 text-gray-800 hover:text-blue-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="text-2xl" />
            ) : (
              <FiMenu className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/30 space-y-3">
            {/* Mobile Navigation Links */}
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-base px-4 py-2 rounded-xl"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/downloads" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-base px-4 py-2 rounded-xl"
                  onClick={closeMobileMenu}
                >
                  Downloads
                </Link>
                <Link 
                  to="/profile" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-base px-4 py-2 rounded-xl"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
              </>
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-3 border-t border-white/30">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {user?.profilePicture && (
                    <div className="flex items-center gap-3 px-4">
                      <img
                        src={user.profilePicture}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full border-2 border-white/50"
                      />
                      <span className="text-gray-700 font-medium">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      logout({ logoutParams: { returnTo: window.location.origin } });
                      closeMobileMenu();
                    }}
                    variant="outline"
                    className="w-full bg-white/90 hover:bg-white text-gray-700"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    loginWithRedirect();
                    closeMobileMenu();
                  }}
                  className="w-full bg-white/90 hover:bg-white text-blue-600 shadow-sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

