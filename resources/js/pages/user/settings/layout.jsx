import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";
import { HiUserCircle } from "react-icons/hi";
import { TbShieldLockFilled } from "react-icons/tb";

export default function SettingsLayout() {
    const location = useLocation();

    const navItems = [
        {
            name: "Thông tin cá nhân",
            path: "/settings/personal-info",
            icon: HiUserCircle,
        },
        {
            name: "Bảo mật",
            path: "/settings/security",
            icon: TbShieldLockFilled,
        },
    ];

    return (
        <div className="bg-[#f5f3f0] h-[calc(100vh-60px)]">
            <div className=" max-w-5xl mx-auto px-4 py-20">
                <div className="flex h-full flex-col justify-center lg:flex-row gap-4">
                    {/* Sidebar */}
                    <div className="h-full lg:w-1/4">
                        <h1 className="text-3xl page-header mb-8">Cài đặt</h1>
                        <div className="">
                            <div className="!space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        location.pathname === item.path;

                                    return (
                                        <Link key={item.path} to={item.path}>
                                            <Button
                                                variant={
                                                    isActive
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                className={`w-50 justify-start h-10 rounded-full hover:scale-105 transition-all duration-300 mb-1 ${
                                                    isActive
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-[#e0dbd5] hover:text-[#968B7F] text-[#8c8074]"
                                                }`}
                                            >
                                                <Icon className="ml-1 mr-2 !h-5 !w-5" />
                                                <p className="text-[15px]">{item.name}</p>
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="h-full lg:w-3/4">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
