import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, FileText, AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AdminLogo from "../../../public/images/admin-logo.svg";

import { MdSpaceDashboard } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { MdNoteAlt } from "react-icons/md";
import { TiWarning } from "react-icons/ti";

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        // Navigate to admin login page
        navigate("/admin/login");
        // Show success toast
        toast.success("Đăng xuất thành công");
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
                                        className={`w-full justify-start h-10 rounded-lg mb-1 ${
                                            isActive
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
                    <Button
                        variant="outline"
                        className="w-full justify-start h-12 rounded-lg border-gray-600 bg-gray-800"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">Đăng xuất</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
