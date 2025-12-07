import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Search,
    Plus,
    MoreHorizontal,
    Phone,
    Video,
    Paperclip,
    Send,
    Check,
    CheckCheck,
    ChevronDown,
    XIcon,
    UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RiChatNewLine } from "react-icons/ri";
import { LuImage } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import NoMessage from "../../../../../public/images/no-message.svg";
import { PiNotePencilBold } from "react-icons/pi";
import { TbEdit } from "react-icons/tb";
import { getConversations, getSuggestedUsers, getMessages, sendMessage, createConversation, getOrCreateConversation, searchUsers, markAsRead } from "@/api/chatApi";
import authApi from "@/api/authApi";
import echo from "@/lib/echo";
import { getImageUrl, getAvatarUrl } from "@/utils/imageUtils";

// Mock data for conversations with separate message histories
const mockConversations = [];

// Mock data for users
const mockUsers = [];

// Helper function to get full name from first_name and last_name
const getFullName = (user) => {
    if (!user) return "";
    if (user.name) return user.name; // fallback if name field exists
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Người dùng";
};

// Helper function to get the latest message object based on timestamp
const getLatestMessage = (messages) => {
    if (!messages || messages.length === 0) return null;
    return messages.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
    }, messages[0]);
};

// Helper function to get the last message content from a conversation
const getLastMessage = (messages) => {
    const lastMessage = getLatestMessage(messages);
    return lastMessage?.content || lastMessage?.text || "";
};

const formatTimestamp = (date) => {
    if (!date) return "";

    const messageDate = new Date(date);
    const now = new Date();

    // Reset giờ phút giây để so sánh ngày chính xác
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDay = new Date(
        messageDate.getFullYear(), 
        messageDate.getMonth(), 
        messageDate.getDate()
    );

    const diffTime = today.getTime() - messageDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const timeFormat = messageDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false 
    });

    if (diffDays === 0) {
        return timeFormat;
    } 
    
    if (diffDays === 1) {
        return `Hôm qua, ${timeFormat}`;
    } 
    
    if (diffDays >= 2 && diffDays < 7) {
        const dayName = messageDate.toLocaleDateString("vi-VN", { 
            weekday: "long" 
        });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        return `${capitalizedDay}, ${timeFormat}`;
    }

    if (messageDate.getFullYear() === now.getFullYear()) {
        const dateFormat = messageDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit"
        });
        return `${dateFormat}, ${timeFormat}`;
    }
    
    const dateFormat = messageDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
    return `${dateFormat}, ${timeFormat}`;
};

// Helper function to format date header (only date, no time)
const formatDateHeader = (date) => {
    if (!date) return "";

    const messageDate = new Date(date);
    const now = new Date();

    // Reset giờ phút giây để so sánh ngày chính xác
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDay = new Date(
        messageDate.getFullYear(), 
        messageDate.getMonth(), 
        messageDate.getDate()
    );

    const diffTime = today.getTime() - messageDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Hôm nay";
    } 
    
    if (diffDays === 1) {
        return "Hôm qua";
    } 
    
    if (diffDays >= 2 && diffDays < 7) {
        const dayName = messageDate.toLocaleDateString("vi-VN", { 
            weekday: "long" 
        });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        return capitalizedDay;
    }

    if (messageDate.getFullYear() === now.getFullYear()) {
        return messageDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit"
        });
    }
    
    return messageDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

// Helper function to get date key for grouping messages
const getDateKey = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    return `${messageDate.getFullYear()}-${String(messageDate.getMonth() + 1).padStart(2, '0')}-${String(messageDate.getDate()).padStart(2, '0')}`;
};

// Helper function to group messages by date
const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];

    const grouped = {};
    messages.forEach(message => {
        const dateKey = getDateKey(message.created_at);
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(message);
    });

    // Convert to array and sort by date (oldest first)
    return Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b))
        .map(dateKey => ({
            date: dateKey,
            dateLabel: formatDateHeader(grouped[dateKey][0].created_at),
            messages: grouped[dateKey]
        }));
};

// Skeleton components
function ConversationSkeleton() {
    return (
        <div className="flex items-center p-4 border-b border-gray-100">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="ml-3 flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
            </div>
        </div>
    );
}

function MessageSkeleton({ isOwnMessage = false }) {
    return (
        <div className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            {!isOwnMessage && (
                <Skeleton className="h-10 w-10 rounded-full mr-2 self-end" />
            )}
            <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                <Skeleton
                    className={`h-12 rounded-2xl ${isOwnMessage
                        ? "w-40 bg-[#91114D]/20 rounded-br-none"
                        : "w-52 rounded-bl-none"
                        }`}
                />
                <Skeleton className="h-3 w-16 mt-1" />
            </div>
        </div>
    );
}

function ChatHeaderSkeleton() {
    return (
        <div className="flex items-center flex-1">
            <Skeleton className="h-12 w-12 rounded-full mr-3" />
            <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

export default function ChatPage() {
    const { conversationId } = useParams();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false); // New state for suggestions loading
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const [sendingMessage, setSendingMessage] = useState(false);


    // Filter conversations based on search term
    const filteredConversations = conversations.filter(
        (conversation) => {
            // Filter out conversations with no messages
            if (!conversation.messages || conversation.messages.length === 0) {
                return false;
            }

            const otherUser = conversation.users?.find(u => u.id !== currentUser?.id);
            const userName = getFullName(otherUser) || conversation.name || "";
            const lastMsg = getLastMessage(conversation.messages);
            return (
                userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lastMsg.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
    );

    // Filter users based on search term for creating new conversation
    const filteredUsers = userSearchTerm.trim()
        ? searchResults  // Use search results if user typed something
        : suggestedUsers;  // Otherwise use suggested users

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await authApi.getUser();
                setCurrentUser(response.data);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await getConversations();
                setConversations(response.data || []);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // Fetch suggested users for new conversation (only when dialog opens)
    useEffect(() => {
        if (isCreateDialogOpen) {
            const fetchSuggestedUsers = async () => {
                try {
                    setLoadingSuggestions(true); // Set loading state to true
                    const response = await getSuggestedUsers();
                    setSuggestedUsers(response.data || []);
                } catch (error) {
                    console.error('Error fetching suggested users:', error);
                } finally {
                    setLoadingSuggestions(false); // Set loading state to false when done
                }
            };
            fetchSuggestedUsers();
        }
    }, [isCreateDialogOpen]);

    // Search users when user types in search field
    useEffect(() => {
        const searchUsersHandler = async () => {
            if (userSearchTerm.trim() === "") {
                setSearchResults([]);
                return;
            }

            try {
                setSearchingUsers(true);
                const response = await searchUsers(userSearchTerm);
                setSearchResults(response.data.data || []);
            } catch (error) {
                console.error('Error searching users:', error);
                setSearchResults([]);
            } finally {
                setSearchingUsers(false);
            }
        };

        // Debounce search
        const timer = setTimeout(searchUsersHandler, 300);
        return () => clearTimeout(timer);
    }, [userSearchTerm]);

    // Handle conversation selection from URL or click
    useEffect(() => {
        if (conversationId) {
            const conversation = conversations.find(c => c.id == conversationId);
            if (conversation) {
                handleSelectConversation(conversation);
            }
        }
    }, [conversationId, conversations]);

    // Fetch messages for selected conversation
    useEffect(() => {
        if (selectedConversation) {
            const fetchMessages = async () => {
                try {
                    setMessagesLoading(true);
                    const response = await getMessages(selectedConversation.id);
                    setSelectedConversation(prev => ({
                        ...prev,
                        messages: response.data || []
                    }));
                } catch (error) {
                    console.error('Error fetching messages:', error);
                } finally {
                    setMessagesLoading(false);
                }
            };
            fetchMessages();
        }
    }, [selectedConversation?.id]);

    // Subscribe to real-time messages via Echo
    // useEffect(() => {
    //     if (!selectedConversation?.id) return;

    //     const conversationId = String(selectedConversation.id);
    //     const channelName = `chat.${conversationId}`;

    //     const channel = echo.private(channelName);

    //     const messageListener = (event) => {
    //         const messageData = event;

    //         setSelectedConversation(prev => ({
    //             ...prev,
    //             messages: [...(prev?.messages || []), messageData],
    //         }));

    //         setConversations(prevConversations => {
    //             const updated = prevConversations.map(conv => {
    //                 if (String(conv.id) === conversationId) {
    //                     return {
    //                         ...conv,
    //                         messages: [...(conv.messages || []), messageData],
    //                         updated_at: new Date().toISOString(),
    //                     };
    //                 }
    //                 return conv;
    //             });
    //             // Sort theo updated_at giảm dần (mới nhất lên đầu)
    //             return updated.sort((a, b) =>
    //                 new Date(b.updated_at) - new Date(a.updated_at)
    //             );
    //         });
    //     };

    //     channel.listen('.message.sent', messageListener);

    //     return () => {
    //         console.log('Leaving Echo channel:', channelName);
    //         echo.leave(channelName);
    //     };
    // }, [selectedConversation?.id]);
    // Subscribe to real-time messages via Echo
    useEffect(() => {
        if (!selectedConversation?.id || !currentUser?.id) return;

        const conversationId = String(selectedConversation.id);
        const channelName = `chat.${conversationId}`;

        const channel = echo.private(channelName);

        const messageListener = (event) => {
            const messageData = event;

            // ✅ FIX 1: Bỏ qua message từ chính mình (đã được thêm trong handleSendMessage)
            if (String(messageData.sender_id) === String(currentUser?.id)) {
                console.log('Skipping own message from .message.sent broadcast');
                return;
            }

            // ✅ FIX 2: Kiểm tra duplicate trước khi thêm (dựa vào message ID)
            setSelectedConversation(prev => {
                if (!prev) return prev;

                const messageId = messageData._id || messageData.id;
                const isDuplicate = prev.messages?.some(
                    msg => (msg._id || msg.id) === messageId
                );

                if (isDuplicate) {
                    console.log('Skipping duplicate message:', messageId);
                    return prev;
                }

                return {
                    ...prev,
                    messages: [...(prev?.messages || []), messageData],
                };
            });

            setConversations(prevConversations => {
                const updated = prevConversations.map(conv => {
                    if (String(conv.id) === conversationId) {
                        const messageId = messageData._id || messageData.id;
                        const isDuplicate = conv.messages?.some(
                            msg => (msg._id || msg.id) === messageId
                        );

                        if (isDuplicate) return conv;

                        return {
                            ...conv,
                            messages: [...(conv.messages || []), messageData],
                            updated_at: new Date().toISOString(),
                        };
                    }
                    return conv;
                });
                return updated.sort((a, b) =>
                    new Date(b.updated_at) - new Date(a.updated_at)
                );
            });
        };

        channel.listen('.message.sent', messageListener);

        return () => {
            console.log('Leaving Echo channel:', channelName);
            echo.leave(channelName);
        };
    }, [selectedConversation?.id, currentUser?.id]);

    // Subscribe to global user online status changes
    useEffect(() => {
        console.log('Subscribing to users-status channel');

        const channel = echo.channel('users-status');

        const statusListener = (event) => {
            console.log('Received user online status change:', event);
            const { user_id, is_online } = event;

            // Update conversations list with new online status
            setConversations(prevConversations =>
                prevConversations.map(conv => ({
                    ...conv,
                    users: conv.users?.map(u =>
                        String(u.id) === String(user_id) || String(u._id) === String(user_id)
                            ? { ...u, is_online }
                            : u
                    )
                }))
            );

            // Update selected conversation if it involves this user
            setSelectedConversation(prev => {
                if (!prev) return prev;

                const hasUser = prev.users?.some(u =>
                    String(u.id) === String(user_id) || String(u._id) === String(user_id)
                );

                if (hasUser) {
                    return {
                        ...prev,
                        users: prev.users?.map(u =>
                            String(u.id) === String(user_id) || String(u._id) === String(user_id)
                                ? { ...u, is_online }
                                : u
                        )
                    };
                }

                return prev;
            });
        };

        channel.listen('.user.online-status-changed', statusListener);

        return () => {
            console.log('Leaving users-status channel');
            echo.leave('users-status');
        };
    }, []);

    // Subscribe to user's personal channel for new message notifications
    // useEffect(() => {
    //     if (!currentUser?.id) return;

    //     const userId = String(currentUser.id);
    //     const channelName = `user.${userId}`;

    //     console.log('Subscribing to user channel for notifications:', channelName);

    //     const channel = echo.private(channelName);

    //     const notificationListener = (event) => {
    //         console.log('Received new message notification:', event);

    //         const { conversation_id, sender, content_preview, unread_count, created_at, has_image } = event;

    //         // Bỏ qua notification nếu là tin nhắn từ chính mình (đã được thêm trong handleSendMessage)
    //         if (String(sender.id) === String(currentUser?.id)) {
    //             console.log('Skipping notification from self');
    //             return;
    //         }

    //         // Cập nhật conversations list
    //         setConversations(prevConversations => {
    //             const updated = prevConversations.map(conv => {
    //                 if (String(conv.id) === String(conversation_id)) {
    //                     // Tạo last message object từ notification
    //                     const lastMessage = {
    //                         content: has_image && !content_preview ? '[Hình ảnh]' : content_preview,
    //                         sender_id: sender.id,
    //                         created_at: created_at,
    //                     };

    //                     return {
    //                         ...conv,
    //                         messages: [...(conv.messages || []), lastMessage],
    //                         unread_count: unread_count,
    //                         updated_at: created_at,
    //                     };
    //                 }
    //                 return conv;
    //             });

    //             // Sort theo updated_at giảm dần (mới nhất lên đầu)
    //             return updated.sort((a, b) =>
    //                 new Date(b.updated_at) - new Date(a.updated_at)
    //             );
    //         });
    //     };

    //     channel.listen('.new-message-notification', notificationListener);

    //     return () => {
    //         console.log('Leaving user channel:', channelName);
    //         echo.leave(channelName);
    //     };
    // }, [currentUser?.id]);
    // Subscribe to user's personal channel for new message notifications
    useEffect(() => {
        if (!currentUser?.id) return;

        const userId = String(currentUser.id);
        const channelName = `user.${userId}`;

        console.log('Subscribing to user channel for notifications:', channelName);

        const channel = echo.private(channelName);

        const notificationListener = (event) => {
            console.log('Received new message notification:', event);

            const { conversation_id, sender, content_preview, unread_count, created_at, has_image } = event;

            // Bỏ qua notification nếu là tin nhắn từ chính mình
            if (String(sender.id) === String(currentUser?.id)) {
                console.log('Skipping notification from self');
                return;
            }

            // ✅ FIX 3: Chỉ cập nhật unread_count và updated_at
            // KHÔNG thêm message vì .message.sent listener đã xử lý
            setConversations(prevConversations => {
                const updated = prevConversations.map(conv => {
                    if (String(conv.id) === String(conversation_id)) {
                        // Chỉ cập nhật metadata, không thêm message
                        return {
                            ...conv,
                            unread_count: unread_count,
                            updated_at: created_at,
                        };
                    }
                    return conv;
                });
                return updated.sort((a, b) =>
                    new Date(b.updated_at) - new Date(a.updated_at)
                );
            });
        };

        channel.listen('.new-message-notification', notificationListener);

        return () => {
            console.log('Leaving user channel:', channelName);
            echo.leave(channelName);
        };
    }, [currentUser?.id]);

    // Handle scroll events to show/hide scroll to bottom button
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                messagesContainerRef.current;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
            setShowScrollButton(!isAtBottom);
        }
    };

    // Auto scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation]);

    // Add scroll event listener
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, []);

    // Handle sending a new message
    const handleSendMessage = async () => {
        if ((newMessage.trim() === "" && !previewImage) || !selectedConversation) return;

        try {
            setSendingMessage(true);

            // Validate conversation_id
            const conversationId = selectedConversation.id;
            if (!conversationId) {
                console.error('Error: conversation_id is undefined');
                setSendingMessage(false);
                return;
            }

            const formData = new FormData();
            formData.append('conversation_id', String(conversationId));
            formData.append('content', newMessage);

            if (selectedImageFile) {
                formData.append('image', selectedImageFile);
            }

            console.log('Sending message with conversation_id:', conversationId);
            const response = await sendMessage(formData);

            if (response.success) {
                const newMessageData = response.data;

                // Cập nhật messages của conversation đang mở
                setSelectedConversation(prev => ({
                    ...prev,
                    messages: [...(prev?.messages || []), newMessageData],
                    updated_at: new Date().toISOString(),
                }));

                // Cập nhật conversations list và sort theo updated_at
                setConversations(prevConversations => {
                    const updated = prevConversations.map(conv => {
                        if (String(conv.id) === String(conversationId)) {
                            return {
                                ...conv,
                                messages: [...(conv.messages || []), newMessageData],
                                updated_at: new Date().toISOString(),
                            };
                        }
                        return conv;
                    });
                    // Sort theo updated_at giảm dần (mới nhất lên đầu)
                    return updated.sort((a, b) =>
                        new Date(b.updated_at) - new Date(a.updated_at)
                    );
                });

                setNewMessage("");
                setPreviewImage(null);
                setSelectedImageFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                // Scroll to bottom after sending message
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove image preview
    const removeImagePreview = () => {
        setPreviewImage(null);
        setSelectedImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle creating a new conversation
    const handleCreateConversation = async () => {
        if (!selectedUser) return;

        try {
            setConversationLoading(true);

            // Get or create conversation with the selected user
            const response = await getOrCreateConversation(selectedUser.id);

            if (response.success) {
                const conversation = response.data;

                // Navigate to the conversation
                navigate(`/chats/${conversation.id}`);
                handleSelectConversation(conversation);

                // Add conversation to list if it's new
                if (response.message === 'Conversation created successfully.') {
                    setConversations(prev => [conversation, ...prev]);
                }
            }

            setIsCreateDialogOpen(false);
            setSelectedUser(null);
            setUserSearchTerm("");
            setSearchResults([]);
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally {
            setConversationLoading(false);
        }
    };

    // Handle selecting a conversation
    const handleSelectConversation = async (conversation) => {
        navigate(`/chats/${conversation.id}`);
        setSelectedConversation(conversation);

        // Hide scroll button when selecting conversation
        setShowScrollButton(false);

        // Mark messages as read when opening a conversation
        if (conversation.unread_count > 0) {
            try {
                await markAsRead(conversation.id);
                // Update local state to reset unread count
                setConversations(prevConversations =>
                    prevConversations.map(conv =>
                        conv.id === conversation.id
                            ? { ...conv, unread_count: 0 }
                            : conv
                    )
                );
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        }
    };

    // Handle key press for sending message
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] bg-[#f5f3f0] px-24 py-3 gap-x-3">
            {/* Conversations Sidebar */}
            <div className="bg-white w-1/4 border border-gray-300 flex flex-col rounded-xl">
                {/* Header */}
                <div className="p-4 pb-2 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-[24px] page-header">Cuộc trò chuyện</h2>
                        <Button
                            className={"rounded-full bg-[#91114D] text-white"}
                            size="icon"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <TbEdit className="!h-5 !w-5" />
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm cuộc trò chuyện..."
                            className="pl-10 text-[15px] bg-[#F7F7F7] rounded-full shadown-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Create Conversation Button */}
                    <Dialog
                        open={isCreateDialogOpen}
                        onOpenChange={(open) => {
                            setIsCreateDialogOpen(open);
                            // Reset search term when dialog is closed
                            if (!open) {
                                setUserSearchTerm("");
                                setSearchResults([]);
                            }
                        }}
                    >
                        <DialogContent
                            className="max-w-md"
                            onInteractOutside={(event) => {
                                event.preventDefault()
                            }}
                        >
                            <DialogHeader>
                                <DialogTitle className={'page-header text-[22px]'}>
                                    Tạo cuộc trò chuyện mới
                                </DialogTitle>
                            </DialogHeader>

                            {/* User Search */}
                            <div className="relative my-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 " />
                                <Input
                                    placeholder="Tìm kiếm người dùng..."
                                    className="pl-10 rounded-full bg-[#F7F7F7]"
                                    value={userSearchTerm}
                                    onChange={(e) =>
                                        setUserSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            {/* Users List */}
                            <div className="max-h-64 overflow-y-auto">
                                {loadingSuggestions ? (
                                    // Loading state for suggestions
                                    <>
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex items-center p-3 border-b border-gray-100">
                                                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-32 mb-2" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : searchingUsers ? (
                                    // Loading state while searching
                                    <>
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex items-center p-3 border-b border-gray-100">
                                                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-32 mb-2" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : filteredUsers.length > 0 ? (
                                    <>
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className={`flex items-center p-3 rounded-lg cursor-pointer ${selectedUser?.id === user.id
                                                    ? "bg-[#f2ece7]"
                                                    : "hover:bg-gray-100"
                                                    }`}
                                                onClick={() =>
                                                    setSelectedUser(user)
                                                }
                                            >
                                                <Avatar className="h-10 w-10 mr-3">
                                                    <AvatarImage
                                                        src={getAvatarUrl(user.avatar_url || user.avatar, getFullName(user))}
                                                        alt={getFullName(user)}
                                                    />
                                                    <AvatarFallback className={"bg-primary text-primary-foreground"}>
                                                        {getFullName(user).charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {getFullName(user)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email || "Chưa xác định"}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-3 h-3 rounded-full ${user.is_online
                                                        ? "bg-green-500"
                                                        : "bg-gray-300"
                                                        }`}
                                                ></div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center w-full">
                                        <Search className="size-12 mt-3 text-gray-400 p-2 bg-gray-100 rounded-xl" />
                                        <p className="py-3 text-center text-gray-500">Không tìm thấy kết quả phù hợp.</p>
                                    </div>
                                )}
                            </div>

                            {/* Dialog Footer */}
                            <div className="flex justify-end gap-2 mt-1">
                                <Button
                                    variant="outline"
                                    className=" rounded-full"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setUserSearchTerm("");
                                        setSearchResults([]);
                                    }}
                                    disabled={conversationLoading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleCreateConversation}
                                    disabled={!selectedUser || conversationLoading}
                                    className="bg-[#91114D] hover:bg-[#91114D]/90 rounded-full"
                                >
                                    {conversationLoading ? "Đang tạo..." : "Nhắn tin"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        // Loading state with skeletons
                        <>
                            {[...Array(7)].map((_, i) => (
                                <ConversationSkeleton key={i} />
                            ))}
                        </>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <Search className="size-14 text-gray-400 mb-4 p-2 bg-gray-100 rounded-xl" />
                            <h3 className="text-base font-semibold ">
                                {conversations.length === 0
                                    ? "Chưa có cuộc trò chuyện nào"
                                    : "Không tìm thấy cuộc trò chuyện"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {conversations.length === 0
                                    ? "Bắt đầu trò chuyện với bạn bè của bạn"
                                    : "Hãy thử tìm kiếm với từ khóa khác"}
                            </p>
                            {conversations.length === 0 && (
                                <Button
                                    className="bg-[#91114D] hover:bg-[#91114D]/90 rounded-full"
                                    onClick={() => setIsCreateDialogOpen(true)}
                                >
                                    Tạo cuộc trò chuyện mới
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => {
                            const otherUser = conversation.users?.find(u => u.id !== currentUser?.id);
                            const lastMsg = getLastMessage(conversation.messages);
                            const timestamp = formatTimestamp(conversation.updated_at);

                            return (
                                <div
                                    key={conversation.id}
                                    className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-[#f5f3f1] ${selectedConversation?.id === conversation.id
                                        ? "bg-[#f3ede7]"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        handleSelectConversation(conversation)
                                    }
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage
                                                src={getAvatarUrl(otherUser?.avatar_url || otherUser?.avatar, getFullName(otherUser))}
                                                alt={getFullName(otherUser)}
                                            />
                                            <AvatarFallback
                                                className={"bg-black text-white"}
                                            >
                                                {getFullName(otherUser)?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${otherUser?.is_online
                                                ? "bg-green-500"
                                                : "bg-gray-300"
                                                }`}
                                        ></div>
                                    </div>

                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <h4 className="font-bold truncate">
                                                {getFullName(otherUser) || conversation.name}
                                            </h4>
                                            <span className="text-xs text-gray-500">
                                                {timestamp}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500 w-[88%] truncate">
                                                {(() => {
                                                    const latestMsgObj = getLatestMessage(conversation.messages);
                                                    return latestMsgObj && latestMsgObj.sender_id === currentUser?.id
                                                        ? `Bạn: ${lastMsg}`
                                                        : lastMsg;
                                                })()}
                                            </p>
                                            {conversation.unread_count > 0 ? (
                                                <span className="bg-[#91114D] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {conversation.unread_count}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="bg-white flex-1 flex flex-col rounded-xl border border-gray-300">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b rounded-t-xl border-gray-200 p-4 flex items-center justify-between">
                            {messagesLoading ? (
                                <ChatHeaderSkeleton />
                            ) : (
                                <>
                                    <div className="flex items-center">
                                        <Avatar className="h-12 w-12 mr-3">
                                            <AvatarImage
                                                src={getAvatarUrl(
                                                    selectedConversation.users?.find(u => u.id !== currentUser?.id)?.avatar_url ||
                                                    selectedConversation.users?.find(u => u.id !== currentUser?.id)?.avatar,
                                                    getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))
                                                )}
                                                alt={getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))}
                                            />
                                            <AvatarFallback className={"bg-black text-white w-11 h-11"}>
                                                {getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="!text-lg font-bold">
                                                {getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id)) || selectedConversation.name}
                                            </h3>
                                            <p className={`text-sm ${selectedConversation.users?.find(u => u.id !== currentUser?.id)?.is_online ? 'text-green-700' : 'text-gray-500'}`}>
                                                {selectedConversation.users?.find(u => u.id !== currentUser?.id)?.is_online
                                                    ? "Đang hoạt động"
                                                    : "Offline"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="icon" className={"rounded-full"}>
                                            <UserCircle2 className="!h-5 !w-5 text-gray-800" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 dots-background relative"
                            ref={messagesContainerRef}
                        >
                            {messagesLoading ? (
                                // Loading state with message skeletons
                                <>
                                    <MessageSkeleton isOwnMessage={false} />
                                    <MessageSkeleton isOwnMessage={true} />
                                    <MessageSkeleton isOwnMessage={false} />
                                    <MessageSkeleton isOwnMessage={false} />
                                    <MessageSkeleton isOwnMessage={true} />
                                    <MessageSkeleton isOwnMessage={false} />
                                </>
                            ) : !selectedConversation?.messages || selectedConversation.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Avatar className="h-16 w-16 mb-4">
                                        <AvatarImage
                                            src={getAvatarUrl(
                                                selectedConversation.users?.find(u => u.id !== currentUser?.id)?.avatar_url ||
                                                selectedConversation.users?.find(u => u.id !== currentUser?.id)?.avatar,
                                                getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))
                                            )}
                                            alt={getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))}
                                        />
                                        <AvatarFallback className="text-2xl bg-black text-white">
                                            {getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-medium mb-2">
                                        {selectedConversation.users?.find(u => u.id !== currentUser?.id)?.name || selectedConversation.name}
                                    </h3>
                                    <p className="text-gray-500">
                                        Chưa có tin nhắn nào. Hãy bắt đầu cuộc
                                        trò chuyện!
                                    </p>
                                </div>
                            ) : (
                                <>                                    {/* Scroll to bottom button */}
                                    {showScrollButton && (
                                        <Button
                                            className="fixed bottom-24 right-8 rounded-full bg-[#91114D] hover:bg-[#91114D]/90 z-10"
                                            size="icon"
                                            onClick={scrollToBottom}
                                        >
                                            <ChevronDown className="!h-6 !w-6" />
                                        </Button>
                                    )}

                                    {groupMessagesByDate(
                                        selectedConversation.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                                    ).map((dateGroup) => (
                                        <div key={dateGroup.date} className="mb-4">
                                            {/* Date Header */}
                                            <div className="flex items-center justify-center my-4">
                                                <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                                    {dateGroup.dateLabel}
                                                </div>
                                            </div>
                                            
                                            {/* Messages for this date */}
                                            {dateGroup.messages.map((message) => (
                                                <div
                                                    key={message._id || message.id}
                                                    className={`flex mb-4 ${message.sender_id === currentUser?.id
                                                        ? "justify-end"
                                                        : "justify-start"
                                                        }`}
                                                >
                                                    {message.sender_id !== currentUser?.id && (
                                                        <Avatar className="h-10 w-10 mr-2 self-end">
                                                            <AvatarImage
                                                                src={getAvatarUrl(
                                                                    selectedConversation.users?.find(u => u.id !== currentUser?.id)?.avatar_url ||
                                                                    selectedConversation.users?.find(u => u.id !== currentUser?.id)?.avatar,
                                                                    getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))
                                                                )}
                                                                alt={
                                                                    getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))
                                                                }
                                                            />
                                                            <AvatarFallback className={" bg-black text-white"}>
                                                                {getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id))?.charAt(0) || "?"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div
                                                        className={` max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${message.sender_id === currentUser?.id
                                                            ? "bg-[#91114D] text-white rounded-br-none"
                                                            : "bg-gray-300 text-gray-800 rounded-bl-none"
                                                            }`}
                                                    >
                                                        {message.content && <p>{message.content}</p>}
                                                        {message.image_url && (
                                                            <img
                                                                src={message.image_url}
                                                                alt="Message attachment"
                                                                className="mt-2 max-w-full h-32 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <div
                                                            className={`text-xs mt-1 flex justify-end ${message.sender_id === currentUser?.id
                                                                ? "text-[#f0e0d6]"
                                                                : "text-gray-500"
                                                                }`}
                                                        >
                                                            {formatTimestamp(message.created_at)}
                                                            {message.sender_id === currentUser?.id &&
                                                                <CheckCheck className="h-3 w-3 ml-1 text-blue-300" />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t rounded-b-xl border-gray-200 p-4">
                            {/* Image preview */}
                            {previewImage && (
                                <div className="mb-2 relative inline-block">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="h-24 rounded-lg border border-gray-300 object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 bg-red-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                                        onClick={removeImagePreview}
                                    >
                                        <XIcon />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`rounded-full p-1`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <LuImage className="h-6 w-6" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                                <Input
                                    placeholder={`Nhắn tin cho ${getFullName(selectedConversation.users?.find(u => u.id !== currentUser?.id)) || selectedConversation.name || 'người dùng'}...`}
                                    className="mx-2 rounded-full "
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
                                />
                                <Button
                                    size="icon"
                                    disabled={(!newMessage.trim() && !previewImage) || sendingMessage}
                                    onClick={handleSendMessage}
                                    className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                                >
                                    {sendingMessage ? <div className="animate-spin">⏳</div> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty state when no conversation is selected
                    <div className="flex flex-col items-center justify-center h-full">
                        <img src={NoMessage} alt="No Message" className="h-64 mb-2 opacity-85" />
                        <h3 className="text-lg font-semibold mb-1">
                            Hãy chọn một cuộc trò chuyện để bắt đầu.
                        </h3>
                        <p className="text-gray-500">
                            Thông tin cuộc trò chuyện sẽ được hiển thị tại đây.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
