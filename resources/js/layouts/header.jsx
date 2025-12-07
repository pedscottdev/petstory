import React, { useState, useEffect, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import NoNotification from "../../../public/images/no-notifications.svg";
import { RiGroup3Fill, RiGroup3Line } from "react-icons/ri";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl } from "@/utils/imageUtils";
import { getConversations } from "@/api/chatApi";
import echo from "@/lib/echo";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    markNotificationsAsReceived,
    getUnreceivedCount,
} from "@/api/notificationApi";
import {
    searchUsersAndPets,
    getSearchSuggestions,
} from "@/api/searchApi";
import { formatRelativeTime } from "@/utils/timeUtils";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [openCommandDialog, setOpenCommandDialog] = useState(false);
    // Search states
    const [searchPets, setSearchPets] = useState([]);
    const [searchUsers, setSearchUsers] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    // State để theo dõi số lượng tin nhắn chưa đọc
    const [unreadMessages, setUnreadMessages] = useState(0);
    // State để theo dõi thông báo đã đọc/chưa đọc
    const [notifications, setNotifications] = useState([]);
    // State để theo dõi số lượng thông báo chưa received (hiển thị badge)
    const [unreceivedCount, setUnreceivedCount] = useState(0);
    // State để theo dõi pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    // State để theo dõi nếu đang tải thông báo lần đầu
    const [loading, setLoading] = useState(false);
    // State để theo dõi nếu đang tải thêm thông báo
    const [loadingMore, setLoadingMore] = useState(false);
    // Ref for notification list container for scroll detection
    const notificationListRef = useRef(null);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isNotificationOpen && isAuthenticated && user) {
            loadNotifications(1);
            // Mark as received when opening dropdown
            markNotificationsAsReceived()
                .then(() => {
                    setUnreceivedCount(0);
                })
                .catch((err) => {
                    console.error(
                        "Error marking notifications as received:",
                        err
                    );
                });
        }
    }, [isNotificationOpen, isAuthenticated, user]);

    // Load unreceived count on mount
    useEffect(() => {
        if (isAuthenticated && user) {
            getUnreceivedCount()
                .then((response) => {
                    if (response.success) {
                        setUnreceivedCount(response.data.count || 0);
                    }
                })
                .catch((err) => {
                    console.error("Error loading unreceived count:", err);
                });
        }
    }, [isAuthenticated, user]);

    // Subscribe to real-time notifications via WebSocket
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const userId = user._id || user.id;
        if (!userId) return;

        const channelName = `user.${userId}`;
        console.log(
            "Header: Subscribing to notification channel:",
            channelName
        );

        const channel = echo.private(channelName);

        const notificationListener = (event) => {
            console.log("Header: Received new notification:", event);
            // Add notification to the beginning of the list
            const formattedNotification = {
                id: event.id || event._id,
                type: event.type,
                user: event.user || event.actor,
                text: event.text,
                postTitle: event.postTitle,
                petName: event.petName,
                isRead: event.isRead || event.is_read || false,
                time: formatRelativeTime(event.created_at),
                created_at: event.created_at,
            };
            setNotifications((prev) => [formattedNotification, ...prev]);
            // Increase unreceived count
            setUnreceivedCount((prev) => prev + 1);
        };

        channel.listen(".notification.created", notificationListener);

        // Also listen for message notifications
        const messageNotificationListener = (event) => {
            console.log("Header: Received new message notification:", event);
            setUnreadMessages((prev) => prev + 1);
        };

        channel.listen(
            ".new-message-notification",
            messageNotificationListener
        );

        return () => {
            console.log("Header: Leaving notification channel:", channelName);
            echo.leave(channelName);
        };
    }, [isAuthenticated, user]);

    // Auto-load more notifications when scrolling to bottom
    useEffect(() => {
        const list = notificationListRef.current;
        if (!list || !isNotificationOpen) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = list;
            // Load more when within 50px of bottom
            if (
                scrollHeight - scrollTop <= clientHeight + 50 &&
                hasMore &&
                !loadingMore
            ) {
                loadMoreNotifications();
            }
        };

        list.addEventListener("scroll", handleScroll);
        return () => list.removeEventListener("scroll", handleScroll);
    }, [hasMore, loadingMore, isNotificationOpen]);

    // Fetch unread messages count
    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const response = await getConversations();
                if (response.success) {
                    const conversations = response.data || [];
                    const totalUnread = conversations.reduce(
                        (sum, conv) => sum + (conv.unread_count || 0),
                        0
                    );
                    setUnreadMessages(totalUnread);
                }
            } catch (error) {
                console.error("Error fetching unread messages:", error);
            }
        };

        if (isAuthenticated && user) {
            fetchUnreadMessages();
            // Refresh unread count every 30 seconds
            const interval = setInterval(fetchUnreadMessages, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, user]);

    // Load search suggestions
    const loadSearchSuggestions = async () => {
        try {
            setSearchLoading(true);
            const response = await getSearchSuggestions();
            if (response.success) {
                setSearchPets(response.data.pets || []);
                setSearchUsers(response.data.users || []);
            }
        } catch (error) {
            console.error("Error loading search suggestions:", error);
            setSearchPets([]);
            setSearchUsers([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Load search suggestions when dialog opens
    useEffect(() => {
        if (openCommandDialog && isAuthenticated && user && searchQuery.trim().length === 0) {
            loadSearchSuggestions();
        }
    }, [openCommandDialog, isAuthenticated, user]);

    // Search users and pets when query changes
    useEffect(() => {
        if (!openCommandDialog) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                performSearch(searchQuery.trim());
            } else {
                // Reset to suggestions when query is empty
                loadSearchSuggestions();
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [searchQuery, openCommandDialog]);

    // Perform search
    const performSearch = async (query) => {
        if (!query || query.trim().length === 0) {
            return;
        }

        try {
            setSearchLoading(true);
            const response = await searchUsersAndPets(query);
            if (response.success) {
                setSearchPets(response.data.pets || []);
                setSearchUsers(response.data.users || []);
            }
        } catch (error) {
            console.error("Error searching:", error);
            setSearchPets([]);
            setSearchUsers([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle search dialog open/close
    const handleSearchDialogChange = (open) => {
        setOpenCommandDialog(open);
        if (!open) {
            // Reset search state when closing
            setSearchQuery("");
            setSearchPets([]);
            setSearchUsers([]);
            setSearchLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            // Navigate to login page
            navigate("/login");
            // Show success toast
            toast.success("Đăng xuất thành công");
        } catch (error) {
            // Even if there's an error, still navigate to login page
            console.error("Logout error:", error);
            navigate("/login");
            toast.success("Đăng xuất thành công");
        }
    };

    // Load notifications from API
    const loadNotifications = async (page = 1) => {
        try {
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            const response = await getNotifications(page, 5);
            if (response.success) {
                const formattedNotifications = (response.data.data || []).map(
                    (notification) => ({
                        ...notification,
                        time: formatRelativeTime(notification.created_at),
                        isRead:
                            notification.isRead ||
                            notification.is_read ||
                            false,
                    })
                );

                if (page === 1) {
                    setNotifications(formattedNotifications);
                } else {
                    setNotifications((prev) => [
                        ...prev,
                        ...formattedNotifications,
                    ]);
                }
                setHasMore(
                    response.data.current_page < response.data.last_page
                );
                setCurrentPage(page);
            }
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            if (page === 1) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    // Hàm đánh dấu tất cả thông báo là đã đọc
    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, is_read: true }))
            );
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // Hàm đánh dấu một thông báo là đã đọc
    const markAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, isRead: true, is_read: true } : n
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Hàm tải thêm thông báo
    const loadMoreNotifications = () => {
        if (!loadingMore && hasMore) {
            loadNotifications(currentPage + 1);
        }
    };

    // Hàm reset số lượng thông báo hiển thị khi đóng dropdown
    const handleNotificationOpenChange = (open) => {
        setIsNotificationOpen(open);
        if (!open) {
            // Reset pagination when closing
            setCurrentPage(1);
            setHasMore(true);
            setLoading(false);
        }
    };

    // Component skeleton cho notification item
    const NotificationSkeleton = () => (
        <li className="rounded-md px-2 py-2.5 flex items-start gap-3">
            {/* Avatar skeleton */}
            <div className="relative flex-shrink-0">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full" />
            </div>
            {/* Content skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
            </div>
        </li>
    );

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
                        onOpenChange={handleSearchDialogChange}
                    >
                        <CommandInput
                            placeholder="Tìm kiếm thú cưng và người dùng..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            {searchLoading ? (
                                <>
                                    {/* Skeleton loading */}
                                    <CommandGroup heading="Thú cưng">
                                        {[1, 2, 3].map((i) => (
                                            <CommandItem key={i} disabled>
                                                <Skeleton className="h-8 w-8 mr-3 rounded-full" />
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-4 w-81" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandGroup heading="Người dùng">
                                        {[1, 2, 3].map((i) => (
                                            <CommandItem key={i} disabled>
                                                <Skeleton className="h-8 w-8 mr-3 rounded-full" />
                                                <div className="flex flex-col gap-1">
                                                    <Skeleton className="h-4 w-81" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            ) : (
                                <>
                                    {searchPets.length === 0 && searchUsers.length === 0 ? (
                                        <CommandEmpty>
                                            {searchQuery.trim().length > 0
                                                ? "Không tìm thấy kết quả tương ứng"
                                                : "Nhập từ khóa để tìm kiếm"}
                                        </CommandEmpty>
                                    ) : (
                                        <>
                                            {searchPets.length > 0 && (
                                                <CommandGroup heading="Thú cưng">
                                                    {searchPets.map((pet) => (
                                                        <CommandItem
                                                            key={pet.id}
                                                            onSelect={() => {
                                                                // Navigate to owner's profile page
                                                                navigate(`/profile/${pet.owner_id}`);
                                                                setOpenCommandDialog(false);
                                                            }}
                                                            className="flex items-center gap-3 py-1.5"
                                                        >
                                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                                <AvatarImage
                                                                    src={getImageUrl(pet.avatar_url)}
                                                                    alt={pet.name}
                                                                    className="object-cover"
                                                                />
                                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                                    <LuDog className="h-4 w-4" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-sm font-medium truncate">
                                                                    {pet.name}
                                                                    {pet.owner_fullname && (
                                                                        <span className="text-muted-foreground font-normal">
                                                                            {" "}(thú cưng của <b>{pet.owner_fullname}</b>)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                {pet.breed && (
                                                                    <span className="text-xs text-muted-foreground truncate">
                                                                        {pet.breed}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            )}
                                            {searchUsers.length > 0 && (
                                                <CommandGroup heading="Người dùng">
                                                    {searchUsers.map((user) => (
                                                        <CommandItem
                                                            key={user.id}
                                                            onSelect={() => {
                                                                navigate(`/profile/${user.id}`);
                                                                setOpenCommandDialog(false);
                                                            }}
                                                            className="flex items-center gap-3 py-2"
                                                        >
                                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                                <AvatarImage
                                                                    src={getImageUrl(user.avatar_url)}
                                                                    alt={user.fullname}
                                                                    className="object-cover"
                                                                />
                                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                                    {user.fullname.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-sm font-medium truncate">
                                                                    {user.fullname}
                                                                </span>
                                                                {user.email && (
                                                                    <span className="text-xs text-muted-foreground truncate">
                                                                        {user.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
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
                                    {unreceivedCount > 0 && (
                                        <p className="rounded-full px-1.5 !text-[12px] bg-red-600 font-medium text-white pb-0.25">
                                            {unreceivedCount}
                                        </p>
                                    )}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-96 mt-2 p-0"
                            align="end"
                        >
                            <div className="">
                                <div className="mb-2 flex items-center justify-between px-4 pt-4">
                                    <h3 className="text-xl page-header">
                                        Thông báo
                                    </h3>
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
                                <div
                                    className=" min-h-96 max-h-108 overflow-y-auto px-2"
                                    ref={notificationListRef}
                                >
                                    {loading ? (
                                        <ul className="space-y-1">
                                            {[1, 2, 3, 4, 5].map((index) => (
                                                <NotificationSkeleton key={index} />
                                            ))}
                                        </ul>
                                    ) : notifications.length > 0 ? (
                                        <>
                                            <ul className="space-y-1">
                                                {notifications.map(
                                                    (notification) => (
                                                        <li
                                                            key={
                                                                notification.id ||
                                                                notification._id
                                                            }
                                                            className="rounded-md px-2 py-2.5
                                                             hover:bg-accent cursor-pointer flex items-start gap-3"
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id ||
                                                                    notification._id
                                                                )
                                                            }
                                                        >
                                                            {/* User Avatar */}
                                                            <div className="relative flex-shrink-0">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage
                                                                        src={getImageUrl(
                                                                            notification
                                                                                .user
                                                                                ?.avatar ||
                                                                            notification
                                                                                .user
                                                                                ?.avatar_url
                                                                        )}
                                                                        alt={
                                                                            notification
                                                                                .user
                                                                                ?.name ||
                                                                            ""
                                                                        }
                                                                        className="object-cover"
                                                                    />
                                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                                        {(
                                                                            notification
                                                                                .user
                                                                                ?.name ||
                                                                            ""
                                                                        ).charAt(
                                                                            0
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {/* Notification Type Icon */}
                                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                                    {notification.type ===
                                                                        "follow" && (
                                                                            <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                                                                        )}
                                                                    {notification.type ===
                                                                        "like_post" && (
                                                                            <Heart className="h-3.5 w-3.5 text-red-500" />
                                                                        )}
                                                                    {notification.type ===
                                                                        "comment" && (
                                                                            <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                                                                        )}
                                                                    {notification.type ===
                                                                        "like_pet" && (
                                                                            <Heart className="h-3.5 w-3.5 text-red-500" />
                                                                        )}
                                                                </div>
                                                            </div>

                                                            {/* Notification Content */}
                                                            <div className="flex-1 flex flex-col justify-start min-w-0">
                                                                <p className="text-sm max-h-10">
                                                                    <span className="font-semibold">
                                                                        {notification
                                                                            .user
                                                                            ?.name ||
                                                                            ""}
                                                                    </span>{" "}
                                                                    {
                                                                        notification.text
                                                                    }
                                                                    {notification.postTitle && (
                                                                        <>
                                                                            {" "}
                                                                            "
                                                                            <span className="font-semibold leading-0.5">
                                                                                {
                                                                                    notification.postTitle
                                                                                }
                                                                            </span>
                                                                            "
                                                                        </>
                                                                    )}
                                                                    <b>
                                                                        {notification.petName &&
                                                                            notification.type ===
                                                                            "like_pet" && (
                                                                                <>
                                                                                    {" "}
                                                                                    {
                                                                                        notification.petName
                                                                                    }
                                                                                </>
                                                                            )}
                                                                    </b>
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {notification.time ||
                                                                        formatRelativeTime(
                                                                            notification.created_at
                                                                        )}
                                                                </p>
                                                            </div>

                                                            {/* Unread indicator */}
                                                            {!(
                                                                notification.isRead ||
                                                                notification.is_read
                                                            ) && (
                                                                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                                )}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                            {hasMore && (
                                                <div className="py-2  text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={
                                                            loadMoreNotifications
                                                        }
                                                        disabled={loadingMore}
                                                    >
                                                        {loadingMore
                                                            ? "Đang tải thông báo..."
                                                            : "Xem thêm thông báo"}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center h-full ">
                                            <div className="text-center py-8 pt-12">
                                                <img
                                                    src={NoNotification}
                                                    alt="No Notification"
                                                    className="h-36 mx-auto"
                                                />
                                                <h3 className="mt-0 font-semibold text-gray-700">
                                                    Không có thông báo
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Bạn sẽ nhận được thông báo
                                                    khi có hoạt động.
                                                </p>
                                            </div>
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
                                    <AvatarImage
                                        src={getImageUrl(user.avatar_url)}
                                        alt="User"
                                    />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user.first_name.charAt(0) +
                                            user.last_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 -right-1  rounded-full bg-gray-500">
                                    <ChevronDown className="h-3 w-3 text-white" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-60 mt-2 shadow-md"
                            align="end"
                        >
                            <DropdownMenuLabel>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={getImageUrl(user.avatar_url)}
                                            alt="User"
                                            className={"object-cover"}
                                        />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {user.first_name.charAt(0) +
                                                user.last_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">
                                            {user.last_name +
                                                " " +
                                                user.first_name ||
                                                "Không xác định"}
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
                                    to={`/profile/${user?._id || user?.id}`}
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
                                        <AlertDialogTitle
                                            className={
                                                "page-header text-[22px]"
                                            }
                                        >
                                            Xác nhận đăng xuất
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bạn có chắc chắn muốn đăng xuất khỏi
                                            hệ thống?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-full">
                                            Hủy
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full"
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
