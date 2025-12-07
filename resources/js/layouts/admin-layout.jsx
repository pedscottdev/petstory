import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import AdminLogo from "../../../public/images/admin-logo.svg";

import { MdSpaceDashboard } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { MdNoteAlt } from "react-icons/md";
import { TiWarning } from "react-icons/ti";

// Import AlertDialog components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ButtonLoader from "@/components/ui/ButtonLoader";

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAdminAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const navItems = [
        {
            name: "Tổng quan",
            path: "/admin/dashboard",
            icon: MdSpaceDashboard,
        },
        {
            name: "Người dùng",
            path: "/admin/users",
            icon: FaUserCog,
        },
        {
            name: "Bài viết",
            path: "/admin/posts",
            icon: MdNoteAlt,
        },
        {
            name: "Báo cáo",
            path: "/admin/reports",
            icon: TiWarning,
        },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Call admin logout
            await logout();
            // Navigate to admin login page
            navigate("/admin/login");
            // Show success toast
            toast.success("Đăng xuất thành công");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi đăng xuất");
        } finally {
            setIsLoggingOut(false);
            setShowLogoutDialog(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar with dark background and light text/icons */}
            <div className="flex flex-col justify-between h-full w-64 bg-[#13171E] text-white py-8">

                <nav className="">
                    <div className="px-6 pb-8">
                        <img
                            src={AdminLogo}
                            alt="Admin Logo"
                            className="h-9 w-auto"
                        />
                    </div>
                    <div className="space-y-1 px-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={
                                            isActive ? "secondary" : "ghost"
                                        }
                                        className={`w-full justify-start h-10 rounded-lg mb-1 ${isActive
                                            ? "bg-white text-gray-900 hover:bg-gray-100"
                                            : "hover:bg-gray-800 text-gray-300 hover:text-white"
                                            }`}
                                    >
                                        <Icon className="mr-4 !h-5 !w-5" />
                                        <span className="text-[15px] font-semibold">
                                            {item.name}
                                        </span>
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
                <div className="px-4 mt-8">
                    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start h-12 rounded-lg border-gray-600 bg-gray-800"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                <span className="font-medium">Đăng xuất</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className={"page-header text-[22px]"}>Xác nhận đăng xuất</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị không?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full" disabled={isLoggingOut}>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <span className="flex items-center justify-center">
                                            <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                                            Đang đăng xuất
                                        </span>
                                    ) : "Xác nhận"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto h-full">
                <div className="p-4 px-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}