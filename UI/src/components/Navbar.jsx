import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../img/logo.jpeg";

const SCROLL_CLOSE_GRACE_MS = 250; // ignore scrolls that occur within this many ms after opening

const Navbar = ({ cartCount, onCartClick, onLoginClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const scrollCloseHandlerRef = useRef(null);
  const openTimeRef = useRef(0); // timestamp when mobile menu was opened

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  // Close mobile menu and cleanup listener
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    openTimeRef.current = 0;
    if (scrollCloseHandlerRef.current) {
      window.removeEventListener("scroll", scrollCloseHandlerRef.current, {
        passive: true,
      });
      scrollCloseHandlerRef.current = null;
    }
  }, []);

  // Toggle mobile menu. When opening, attach a scroll listener that closes it on the first scroll
  // that occurs AFTER the grace period (to avoid immediate inertial scroll closing).
  const toggleMobileMenu = useCallback(() => {
    const willOpen = !isMobileMenuOpen;

    if (willOpen) {
      // If a previous handler exists, ensure it's removed first (safety)
      if (scrollCloseHandlerRef.current) {
        window.removeEventListener("scroll", scrollCloseHandlerRef.current, {
          passive: true,
        });
        scrollCloseHandlerRef.current = null;
      }

      setIsMobileMenuOpen(true);
      openTimeRef.current = Date.now();

      const onScrollClose = () => {
        const now = Date.now();
        // Only close if scroll happened after the grace period
        if (now - openTimeRef.current >= SCROLL_CLOSE_GRACE_MS) {
          closeMobileMenu();
        }
        // Otherwise ignore this scroll (likely inertia/momentum right after opening)
      };

      scrollCloseHandlerRef.current = onScrollClose;
      window.addEventListener("scroll", onScrollClose, { passive: true });
    } else {
      // User clicked toggle to close
      closeMobileMenu();
    }
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Ensure mobile menu closes on window resize to desktop sizes (>= md)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [closeMobileMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollCloseHandlerRef.current) {
        window.removeEventListener("scroll", scrollCloseHandlerRef.current, {
          passive: true,
        });
        scrollCloseHandlerRef.current = null;
      }
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo}
              alt="Organic Store Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-gray-800">
              Organic Store
            </span>
          </Link>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 ${
                location.pathname === "/"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`font-medium transition-colors duration-200 ${
                location.pathname === "/products"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Products
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === "/admin"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart Button - Hide on admin page, and on home page if cart is empty */}
            {location.pathname !== "/admin" &&
              !(location.pathname === "/" && cartCount === 0) && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

            {/* Login/User Menu */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {currentUser.displayName?.charAt(0) || "A"}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {currentUser.displayName || "Admin"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.displayName || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation"
              className="text-gray-700 hover:text-green-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  // X icon
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  // Hamburger
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ${
            isMobileMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col items-center space-y-2 mt-2 pb-4">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 ${
                location.pathname === "/"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
              onClick={() => {
                closeMobileMenu();
              }}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`font-medium transition-colors duration-200 ${
                location.pathname === "/products"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
              onClick={() => {
                closeMobileMenu();
              }}
            >
              Products
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === "/admin"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
                onClick={() => {
                  closeMobileMenu();
                }}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
