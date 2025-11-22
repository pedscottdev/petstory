import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import LogoIcon from "../../../public/images/logo-icon.svg";

/**
 * AdminProtectedRoute checks admin authentication status
 * - If loading → show loading screen
 * - If not authenticated → redirect to /admin/login
 * - If authenticated → render children or Outlet
 */

export default function AdminProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAdminAuth();

    // Show loading screen while checking session
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#13171e]">
                <div className="text-center">
                    <img src={LogoIcon} alt="Logo" className="w-24 h-24 mx-auto animate-bounce" />
                </div>
                <p className="fixed bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">© 2025 PEDROLAB. All rights reserved.</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Render protected content
    return children || <Outlet />;
}
