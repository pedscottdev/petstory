import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    TbCompass,
    TbCompassFilled,
    TbHome,
    TbHomeFilled,
    TbMessage2,
    TbPaw,
    TbPawFilled,
} from "react-icons/tb";
import { LuDog } from "react-icons/lu";
import { TbWorld } from "react-icons/tb";
import { TbMessage2Filled } from "react-icons/tb";
import {
    Bell,
    Search,
    Home,
    Users,
    UserPlus,
    MessageCircle,
    Heart,
    User2Icon,
    Settings,
    LogOut,
    ChevronDown,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";

import AppLogo from "../../../public/images/header-logo.svg";
import { RiGroup3Fill, RiGroup3Line } from "react-icons/ri";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [openCommandDialog, setOpenCommandDialog] = useState(false);

    // Navigation items with icons
    const navItems = [
        {
            name: "Trang chủ",
            path: "/",
            icon: TbHome,
            activeIcon: TbHomeFilled,
        },
        {
            name: "Thú cưng",
            path: "/pets",
            icon: TbPaw,
            activeIcon: TbPawFilled,
        },
        {
            name: "Nhóm",
            path: "/groups",
            icon: RiGroup3Line,
            activeIcon: RiGroup3Fill,
        },
        {
            name: "Theo dõi",
            path: "/followings",
            icon: TbCompass,
            activeIcon: TbCompassFilled,
        },
        {
            name: "Tin nhắn",
            path: "/chats",
            icon: TbMessage2,
            activeIcon: TbMessage2Filled,
        },
    ];

    // Notification items (sample data)
    const notifications = [
        {
            id: 1,
            text: "Bạn có 1 tin nhắn mới từ Puppy Lover",
            time: "5 phút trước",
        },
        {
            id: 2,
            text: "PetCare vừa đăng một bài viết mới",
            time: "1 giờ trước",
        },
        {
            id: 3,
            text: "Bạn đã được thêm vào nhóm Chó Cảnh",
            time: "2 giờ trước",
        },
    ];

    // Sample data for pets and users search
    const pets = [
        { id: 1, name: "Buddy", type: "Dog" },
        { id: 2, name: "Whiskers", type: "Cat" },
        { id: 3, name: "Rex", type: "Dog" },
        { id: 4, name: "Luna", type: "Cat" },
    ];

    const users = [
        { id: 1, name: "Nguyễn Văn A", username: "nguyenvana" },
        { id: 2, name: "Trần Thị B", username: "tranthib" },
        { id: 3, name: "Phạm Văn C", username: "phamvanc" },
        { id: 4, name: "Lê Thị D", username: "lethid" },
    ];

    const handleLogout = () => {
        // Navigate to login page
        navigate("/login");
        // Show success toast
        toast.success("Đăng xuất thành công");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#DADDE3] bg-white px-32">
            <div className="w-full flex justify-between h-14 items-center ">
                {/* Left Controller: Logo */}
                <div className="w-1/3 flex items-center justify-start gap-4">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={AppLogo} alt="App Logo" className="h-8" />
                    </Link>
                </div>

                {/* Center Controller: Navigation with Icons */}
                <nav className="w-1/3 flex items-center justify-center gap-2">
                    <TooltipProvider>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        <Link to={item.path}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`relative h-12 w-26 rounded-lg transition-colors hover:text-gray-600 ${
                                                    isActive
                                                        ? "text-[#91114D] hover:text-[#91114D] hover:bg-transparent"
                                                        : "text-gray-500 hover:bg-[#F1F1F1] "
                                                }`}
                                            >
                                                {isActive ? (
                                                    <item.activeIcon className="!h-6.5 !w-6.5" />
                                                ) : (
                                                    <Icon className="!h-6.5 !w-6.5" />
                                                )}
                                                {isActive && (
                                                    <div className="absolute -bottom-1 left-0 right-0 h-0.75 bg-[#91114D] rounded-t-md" />
                                                )}
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="!text-[14px]">
                                            {item.name}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </nav>

                {/* Right Controller: Search, Notifications and User Menu */}
                <div className="w-1/3 flex items-center justify-end gap-2">
                    {/* Search Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-gray-100 hover:bg-gray-200 h-10 w-10"
                        onClick={() => setOpenCommandDialog(true)}
                    >
                        <Search className="!h-5 !w-5" />
                    </Button>

                    {/* Command Dialog for Search */}
                    <CommandDialog
                        open={openCommandDialog}
                        onOpenChange={setOpenCommandDialog}
                    >
                        <CommandInput placeholder="Tìm kiếm thú cưng và người dùng..." />
                        <CommandList>
                            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
                            <CommandGroup heading="Thú cưng">
                                {pets.map((pet) => (
                                    <CommandItem
                                        key={pet.id}
                                        onSelect={() => {
                                            navigate(`/pets/${pet.id}`);
                                            setOpenCommandDialog(false);
                                        }}
                                    >
                                        <LuDog className="mr-2 h-4 w-4" />
                                        <span>
                                            {pet.name} ({pet.type})
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandGroup heading="Người dùng">
                                {users.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        onSelect={() => {
                                            navigate(`/profile/${user.id}`);
                                            setOpenCommandDialog(false);
                                        }}
                                    >
                                        <User2Icon className="mr-2 h-4 w-4" />
                                        <span>
                                            {user.name} (@{user.username})
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </CommandDialog>

                    {/* Notifications Dropdown */}
                    <DropdownMenu
                        modal={false}
                        open={isNotificationOpen}
                        onOpenChange={setIsNotificationOpen}
                    >
                        <DropdownMenuTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full bg-gray-100 hover:bg-gray-200 h-10 w-10 relative"
                            >
                                <Bell className="!h-5 !w-5" />
                                <div className="absolute top-0 -right-1 ">
                                    <p className="rounded-full px-1.5 !text-[12px] bg-red-600 font-medium text-white pb-0.25">9</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80 mt-2 p-0" align="end">
                            <div className="p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold">Thông báo</h3>
                                    <Button variant="ghost" size="sm">
                                        Đánh dấu đã đọc
                                    </Button>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        <ul className="space-y-2">
                                            {notifications.map(
                                                (notification) => (
                                                    <li
                                                        key={notification.id}
                                                        className="rounded-md p-2 hover:bg-accent cursor-pointer"
                                                    >
                                                        <p className="text-sm">
                                                            {notification.text}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {notification.time}
                                                        </p>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Không có thông báo mới
                                        </p>
                                    )}
                                </div>
                                <div className="mt-2 pt-2 border-t text-center">
                                    <Button variant="link" size="sm">
                                        Xem tất cả
                                    </Button>
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu Dropdown */}
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger>
                            <Button
                                variant="ghost"
                                className="relative flex rounded-full p-0 h-10 w-10"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="" alt="User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        PT
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 -right-1  rounded-full bg-gray-500">
                                    <ChevronDown className="h-3 w-3 text-white" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 mt-2 shadow-md" align="end">
                            <DropdownMenuLabel>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="" alt="User" />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            PT
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">
                                            Phạm Hoàng Trọng
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            nguyenvana@example.com
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    to="/profile/1"
                                    className="cursor-pointer "
                                >
                                    <div className="flex items-center gap-2">
                                        <User2Icon className="h-4 w-4" />
                                        <p>Trang cá nhân</p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    to="/settings/personal-info"
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        <p>Cài đặt</p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <div className="flex items-center gap-2 cursor-pointer">
                                            <LogOut className="h-4 w-4" />
                                            <p>Đăng xuất</p>
                                        </div>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Xác nhận đăng xuất
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bạn có chắc chắn muốn đăng xuất khỏi
                                            hệ thống?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Hủy
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleLogout}
                                        >
                                            Đăng xuất
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
