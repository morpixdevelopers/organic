import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  onLoginRequired,
}) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If admin route is accessed without being logged in, trigger login modal
    if (!loading && requireAdmin && !currentUser && onLoginRequired) {
      onLoginRequired();
    }
  }, [loading, requireAdmin, currentUser, onLoginRequired]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires admin and user is not admin, show admin login
  if (requireAdmin && !isAdmin) {
    // Don't redirect, stay on /admin page to show admin login in modal
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Admin Access Required
          </h2>
          <p className="text-gray-600">
            Please login with admin credentials to access this page.
          </p>
        </div>
      </div>
    );
  }

  // If route requires auth and user is not logged in, show the page but with limited access
  // (We're not blocking access to products page for non-logged users based on requirements)
  return children;
};

export default ProtectedRoute;
