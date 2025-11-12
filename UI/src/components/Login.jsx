import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Login = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";
  const [activeTab, setActiveTab] = useState(isAdminRoute ? "admin" : "user");
  const [isSignUp, setIsSignUp] = useState(false);
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithAdmin,
  } = useAuth();
  const navigate = useNavigate();

  // Reset form when modal closes or tab changes
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setAdminUserId("");
    setAdminPassword("");
    setError("");
    setIsSignUp(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onClose();
        resetForm();
        navigate("/");
      } else {
        setError(result.error || "Failed to sign in with Google");
      }
    } catch (err) {
      setError("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        if (!displayName.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        result = await signUpWithEmail(email, password, displayName);
      } else {
        result = await signInWithEmail(email, password);

        if (
          !result.success &&
          (result.error.includes("user-not-found") ||
            result.error.includes("No account found") ||
            result.error.includes("Invalid email or password"))
        ) {
          setError(
            "Invalid email or password. If you're a new user, please sign up first."
          );
          setLoading(false);
          return;
        }
      }

      if (result.success) {
        onClose();
        resetForm();
        navigate("/");
      } else {
        setError(
          result.error || `Failed to ${isSignUp ? "sign up" : "sign in"}`
        );
      }
    } catch (err) {
      setError("An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithAdmin(adminUserId, adminPassword);
      if (result.success) {
        onClose();
        resetForm();
        navigate("/admin");
      } else {
        setError(result.error || "Invalid admin credentials");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdminRoute ? "Admin Login" : isSignUp ? "Sign Up" : "Login"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            x
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              {!isSignUp &&
                (error.includes("No account found") ||
                  error.includes("Invalid email or password")) && (
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError("");
                    }}
                    className="mt-2 text-sm text-red-800 hover:text-red-900 font-semibold underline block"
                    type="button"
                  >
                    Click here to Sign Up
                  </button>
                )}
            </div>
          )}

          {isAdminRoute ? (
            // Admin Login Form (only show on /admin route)
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin ID
                </label>
                <input
                  type="text"
                  id="userId"
                  value={adminUserId}
                  onChange={(e) => setAdminUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter admin user ID"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>
          ) : (
            // User Login/Sign Up Tab
            <div className="space-y-4">
              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required={isSignUp}
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={
                      isSignUp
                        ? "Create a password (min 6 characters)"
                        : "Enter your password"
                    }
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? isSignUp
                      ? "Creating Account..."
                      : "Signing In..."
                    : isSignUp
                    ? "Sign Up"
                    : "Sign In"}
                </button>

                {/* Helper message for new users */}
                {!isSignUp && (
                  <div className="text-center text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800">
                      <span className="font-semibold">New user?</span> If you
                      don't have an account, please sign up first.
                    </p>
                  </div>
                )}
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
              </button>

              {/* Toggle between Sign In and Sign Up */}
              <div className="text-center text-sm text-gray-600 mt-4">
                {isSignUp ? (
                  <p>
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsSignUp(false)}
                      className="text-green-600 hover:text-green-700 font-semibold"
                      type="button"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsSignUp(true)}
                      className="text-green-600 hover:text-green-700 font-semibold"
                      type="button"
                    >
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
