import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute kiểm tra trạng thái đăng nhập hoặc quyền truy cập.
 * - Nếu chưa đăng nhập → chuyển hướng về /login
 * - Nếu có yêu cầu quyền (permissionsRequired) → kiểm tra trước khi cho vào
 */

export default function ProtectedRoute({ permissionsRequired = [] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    permissionsRequired.length > 0 &&
    !permissionsRequired.every((p) => user?.permissions?.includes(p))
  ) {
    return <Navigate to="/403" replace />;
  }

  // Nếu pass hết → render các route con
  return <Outlet />;
}
