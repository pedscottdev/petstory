import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LogoIcon from "../../../public/images/logo-icon.svg";

/**
 * ProtectedRoute kiểm tra trạng thái đăng nhập hoặc quyền truy cập.
 * - Nếu đang kiểm tra session → hiển thị loading
 * - Nếu chưa đăng nhập → chuyển hướng về /login
 * - Nếu có yêu cầu quyền (permissionsRequired) → kiểm tra trước khi cho vào
 */

export default function ProtectedRoute({ children, permissionsRequired = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Khi đang kiểm tra session, hiển thị loading (hoặc nothing, tùy UX)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <img src={LogoIcon} alt="Logo" className="w-24 h-24 mx-auto animate-bounce" />
          {/* <p className="mt-4 text-gray-600">Đang tải...</p> */}
        </div>
        <p className="fixed bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">© 2025 PEDROLAB. All rights reserved.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    permissionsRequired.length > 0 &&
    !permissionsRequired.every((p) => user?.permissions?.includes(p))
  ) {
    return <Navigate to="/403" replace />;
  }

  // Nếu pass hết → render children hoặc Outlet
  return children || <Outlet />;
}
