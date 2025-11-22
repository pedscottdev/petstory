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
    CheckCheck,
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
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [openCommandDialog, setOpenCommandDialog] = useState(false);
    // State để theo dõi số lượng tin nhắn chưa đọc
    const [unreadMessages, setUnreadMessages] = useState(3);
    // State để theo dõi thông báo đã đọc/chưa đọc
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "follow",
            user: {
                name: "Nguyễn Văn An",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            text: "đã bắt đầu theo dõi bạn",
            time: "5 phút trước",
            isRead: false
        },
        {
            id: 2,
            type: "like_post",
            user: {
                name: "Trần Thái Bình",
                avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            text: "đã thích bài viết",
            postTitle: "Hôm nay mình đưa cún Buddy...",
            time: "10 phút trước",
            isRead: false
        },
        {
            id: 3,
            type: "comment",
            user: {
                name: "Lê Văn Cường",
                avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            postTitle: "Whiskers đã khỏe hơn nhiều...",
            text: "đã bình luận về bài viết",
            time: "20 phút trước",
            isRead: false
        },
        {
            id: 4,
            type: "like_pet",
            user: {
                name: "Phạm Thị Dung",
                avatar: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            text: "đã thích thú cưng của bạn",
            time: "30 phút trước",
            isRead: false
        },
        {
            id: 5,
            type: "follow",
            user: {
                name: "Hoàng Văn Em",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            text: "đã bắt đầu theo dõi bạn",
            time: "1 giờ trước",
            isRead: false
        },
        {
            id: 6,
            type: "like_post",
            user: {
                name: "Vũ Thị Hoa",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            text: "đã thích bài viết",
            postTitle: "Chia sẻ kinh nghiệm nuôi chó",
            time: "2 giờ trước",
            isRead: true
        },
        {
            id: 7,
            type: "comment",
            user: {
                name: "Đỗ Văn Hải",
                avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            postTitle: "Chia sẻ kinh nghiệm nuôi chó",
            text: "đã bình luận về bài viết",
            time: "3 giờ trước",
            isRead: true
        },
        {
            id: 8,
            type: "like_pet",
            user: {
                name: "Nguyễn Văn Hưng",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
            },
            text: "đã thích thú cưng của bạn",
            time: "4 giờ trước",
            isRead: true
        },
    ]);

    // State để theo dõi số lượng thông báo hiển thị
    const [visibleNotifications, setVisibleNotifications] = useState(5);

    // State để theo dõi nếu đang tải thêm thông báo
    const [loadingMore, setLoadingMore] = useState(false);

    // Sample data for pets and users search
    const pets = [
        { id: 1, name: "Buddy", type: "Dog" },
        { id: 2, name: "Whiskers", type: "Cat" },
        { id: 3, name: "Rex", type: "Dog" },
        { id: 4, name: "Luna", type: "Cat" },
    ];

    const users = [
        { id: 1, name: "Nguyễn Văn An", username: "nguyenvanan" },
        { id: 2, name: "Trần Thị Bình", username: "tranthibinh" },
        { id: 3, name: "Phạm Văn Cường", username: "phamvancuong" },
        { id: 4, name: "Lê Thị Dung", username: "lethidung" },
    ];

    const handleLogout = async () => {
        await logout();
        // Navigate to login page
        navigate("/login");
        // Show success toast
        toast.success("Đăng xuất thành công");
    };

    // Hàm đánh dấu tất cả thông báo là đã đọc
    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification => ({
                ...notification,
                isRead: true
            }))
        );
    };

    // Hàm đánh dấu một thông báo là đã đọc
    const markAsRead = (id) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === id ? { ...notification, isRead: true } : notification
            )
        );
    };

    // Hàm tải thêm thông báo
    const loadMoreNotifications = () => {
        setLoadingMore(true);
        // Simulate API call delay
        setTimeout(() => {
            setVisibleNotifications(prev => prev + 5);
            setLoadingMore(false);
        }, 500);
    };

    // Hàm reset số lượng thông báo hiển thị khi đóng dropdown
    const handleNotificationOpenChange = (open) => {
        setIsNotificationOpen(open);
        if (!open) {
            // Reset to show only 5 notifications when closing
            setVisibleNotifications(5);
        }
    };

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

    // Hàm xử lý khi người dùng click vào mục Tin nhắn
    const handleChatsClick = () => {
        // Đánh dấu tất cả tin nhắn là đã đọc
        setUnreadMessages(0);
        // Chuyển hướng đến trang tin nhắn
        navigate("/chats");
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

                            // Kiểm tra nếu là mục Tin nhắn
                            const isChatsItem = item.name === "Tin nhắn";

                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        {isChatsItem ? (
                                            <button
                                                onClick={handleChatsClick}
                                                className="cursor-pointer"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`relative h-12 w-26 rounded-lg transition-colors hover:text-gray-600 ${isActive
                                                            ? "text-[#91114D] hover:text-[#9114D] hover:bg-transparent"
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

                                                    {/* Hiển thị label số lượng tin nhắn mới */}
                                                    {unreadMessages > 0 && (
                                                        <div className="absolute top-1 right-7 ">
                                                            <p className="rounded-full px-1.5 !text-[12px] bg-red-600 font-medium text-white pb-0.25">
                                                                {unreadMessages}
                                                            </p>
                                                        </div>
                                                    )}
                                                </Button>
                                            </button>
                                        ) : (
                                            <Link to={item.path}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`relative h-12 w-26 rounded-lg transition-colors hover:text-gray-600 ${isActive
                                                            ? "text-[#91114D] hover:text-[#9114D] hover:bg-transparent"
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
                                        )}
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
                        onOpenChange={handleNotificationOpenChange}
                    >
                        <DropdownMenuTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full bg-gray-100 hover:bg-gray-200 h-10 w-10 relative"
                            >
                                <Bell className="!h-5 !w-5" />
                                <div className="absolute top-0 -right-1 ">
                                    {notifications.filter(n => !n.isRead).length > 0 && (
                                        <p className="rounded-full px-1.5 !text-[12px] bg-red-600 font-medium text-white pb-0.25">
                                            {notifications.filter(n => !n.isRead).length}
                                        </p>
                                    )}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-96 mt-2 p-0" align="end">
                            <div className="">
                                <div className="mb-2 flex items-center justify-between px-4 pt-4">
                                    <h3 className="text-xl page-header">Thông báo</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={"hover:text-[#91114D]"}
                                        onClick={markAllAsRead}
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                        Đánh dấu đã đọc
                                    </Button>
                                </div>
                                <div className="max-h-108 overflow-y-auto px-2">
                                    {notifications.length > 0 ? (
                                        <>
                                            <ul className="space-y-1">
                                                {notifications.slice(0, visibleNotifications).map(
                                                    (notification) => (
                                                        <li
                                                            key={notification.id}
                                                            className="rounded-md px-2 py-2.5
                                                             hover:bg-accent cursor-pointer flex items-start gap-3"
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            {/* User Avatar */}
                                                            <div className="relative flex-shrink-0">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage src={notification.user.avatar} alt={notification.user.name} className="object-cover" />
                                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                                        {notification.user.name.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {/* Notification Type Icon */}
                                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                                    {notification.type === "follow" && (
                                                                        <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                                                                    )}
                                                                    {notification.type === "like_post" && (
                                                                        <Heart className="h-3.5 w-3.5 text-red-500" />
                                                                    )}
                                                                    {notification.type === "comment" && (
                                                                        <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                                                                    )}
                                                                    {notification.type === "like_pet" && (
                                                                        <Heart className="h-3.5 w-3.5 text-red-500" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Notification Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm">
                                                                    <span className="font-semibold">{notification.user.name}</span>{" "}
                                                                    {notification.text}
                                                                    {notification.postTitle && (
                                                                        <>
                                                                            {" "}"<span className="font-semibold truncate">{notification.postTitle}</span>"
                                                                        </>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {notification.time}
                                                                </p>
                                                            </div>

                                                            {/* Unread indicator */}
                                                            {!notification.isRead && (
                                                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                            )}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                            {visibleNotifications < notifications.length && (
                                                <div className="py-2 border-t text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={loadMoreNotifications}
                                                        disabled={loadingMore}
                                                    >
                                                        {loadingMore ? "Đang tải..." : "Xem thêm thông báo"}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bell className="h-12 w-12 mx-auto text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông báo</h3>
                                            <p className="mt-1 text-sm text-gray-500">Bạn sẽ nhận được thông báo khi có hoạt động.</p>
                                        </div>
                                    )}
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
                                    <AvatarImage src={user.avatar_url} alt="User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user.first_name.charAt(0) + user.last_name.charAt(0)}
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
                                    <AvatarImage src={user.avatar_url} alt="User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user.first_name.charAt(0) + user.last_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">
                                            {user.last_name + " " + user.first_name || "Không xác định"} 
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {user.email || "Không có email"}
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
                                        <AlertDialogTitle className={"page-header text-[22px]"}>
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
