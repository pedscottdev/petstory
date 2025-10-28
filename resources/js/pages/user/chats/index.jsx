import React, { useState, useEffect, useRef } from "react";
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
import NoMessage from "../../../../../public/images/no-message.svg";

// Mock data for conversations with separate message histories
const mockConversations = [
    {
        id: 1,
        userId: 1,
        userName: "Nguyễn Văn A",
        userAvatar: "",
        isOnline: true,
        timestamp: "5 phút",
        unreadCount: 2,
        isRead: true,
        messages: [
            {
                id: 1,
                senderId: 1,
                text: "Chào bạn! Bạn có nuôi thú cưng không?",
                timestamp: "10:30 AM",
                isRead: true,
            },
            {
                id: 2,
                senderId: 0,
                text: "Chào bạn! Mình có nuôi một chú chó.",
                timestamp: "10:32 AM",
                isRead: true,
            },
            {
                id: 3,
                senderId: 1,
                text: "Thật tuyệt! Bạn nuôi giống gì vậy?",
                timestamp: "10:33 AM",
                isRead: true,
            },
            {
                id: 4,
                senderId: 0,
                text: "Mình nuôi Golden Retriever, rất ngoan và thân thiện.",
                timestamp: "10:35 AM",
                isRead: true,
            },
            {
                id: 5,
                senderId: 1,
                text: "Bạn có thể chia sẻ một vài bức ảnh được không?",
                timestamp: "10:36 AM",
                isRead: false,
            },
        ],
    },
    {
        id: 2,
        userId: 2,
        userName: "Trần Thị B",
        userAvatar: "",
        isOnline: false,
        timestamp: "1 giờ",
        unreadCount: 0,
        isRead: true,
        messages: [
            {
                id: 1,
                senderId: 2,
                text: "Bạn ơi, cảm ơn bạn đã chia sẻ bài viết về chăm sóc mèo!",
                timestamp: "09:15 AM",
                isRead: true,
            },
            {
                id: 2,
                senderId: 0,
                text: "Không có gì! Bạn thấy hữu ích là mình vui rồi.",
                timestamp: "09:20 AM",
                isRead: true,
            },
            {
                id: 3,
                senderId: 2,
                text: "Mình đang muốn tìm cửa hàng phụ kiện cho mèo, bạn có gợi ý nào không?",
                timestamp: "09:25 AM",
                isRead: true,
            },
            {
                id: 4,
                senderId: 0,
                text: "Bạn thử ghé Pet Shop ở đường Nguyễn Trãi xem, chỗ đó có nhiều đồ xinh lắm!",
                timestamp: "09:30 AM",
                isRead: true,
            },
            {
                id: 5,
                senderId: 2,
                text: "Cảm ơn bạn, mình sẽ ghé thử!",
                timestamp: "09:35 AM",
                isRead: true,
            },
        ],
    },
    {
        id: 3,
        userId: 3,
        userName: "Phạm Văn C",
        userAvatar: "",
        isOnline: true,
        timestamp: "13-10",
        unreadCount: 5,
        isRead: false,
        messages: [
            {
                id: 1,
                senderId: 3,
                text: "Chào bạn! Mình thấy bạn cũng nuôi mèo giống mình nè!",
                timestamp: "Yesterday",
                isRead: true,
            },
            {
                id: 2,
                senderId: 0,
                text: "Chào bạn! Đúng rồi, mình nuôi mèo từ khi nó còn nhỏ.",
                timestamp: "Yesterday",
                isRead: true,
            },
            {
                id: 3,
                senderId: 3,
                text: "Bạn cho mình hỏi, bạn tắm cho mèo bao nhiêu lần 1 tháng vậy?",
                timestamp: "Yesterday",
                isRead: true,
            },
            {
                id: 4,
                senderId: 0,
                text: "Mình tầm 2-3 tuần tắm 1 lần, tùy theo mùa và hoạt động của mèo.",
                timestamp: "Yesterday",
                isRead: true,
            },
            {
                id: 5,
                senderId: 3,
                text: "Ồ, mình cứ nghĩ phải mỗi tuần 1 lần, học hỏi được thêm!",
                timestamp: "Yesterday",
                isRead: false,
            },
        ],
    },
    {
        id: 4,
        userId: 4,
        userName: "Lê Thị D",
        userAvatar: "",
        isOnline: false,
        timestamp: "12-10",
        unreadCount: 0,
        isRead: true,
        messages: [
            {
                id: 1,
                senderId: 4,
                text: "Bạn ơi, hình như bạn đang ở TP.HCM đúng không?",
                timestamp: "Oct 12",
                isRead: true,
            },
            {
                id: 2,
                senderId: 0,
                text: "Đúng vậy, mình đang ở Q.1, còn bạn?",
                timestamp: "Oct 12",
                isRead: true,
            },
            {
                id: 3,
                senderId: 4,
                text: "Mình ở Q.Bình Thạnh, gần nhau ghê!",
                timestamp: "Oct 12",
                isRead: true,
            },
        ],
    },
    {
        id: 5,
        userId: 5,
        userName: "Hoàng Văn E",
        userAvatar: "",
        isOnline: true,
        timestamp: "11-10",
        unreadCount: 1,
        isRead: false,
        messages: [
            {
                id: 1,
                senderId: 5,
                text: "Chào bạn, mình đang tìm cửa hàng thú cưng uy tín ở HN, bạn có thể giới thiệu được không?",
                timestamp: "Oct 11",
                isRead: true,
            },
            {
                id: 2,
                senderId: 0,
                text: "Bạn thử tìm Pet Mart ở Cầu Giấy xem, mình thấy khá ổn.",
                timestamp: "Oct 11",
                isRead: true,
            },
            {
                id: 3,
                senderId: 5,
                text: "Cảm ơn bạn, mình sẽ ghé thử!",
                timestamp: "Oct 11",
                isRead: false,
            },
        ],
    },
];

// Mock data for users
const mockUsers = [
    { id: 1, name: "Nguyễn Văn A", avatar: "", isOnline: true },
    { id: 2, name: "Trần Thị B", avatar: "", isOnline: false },
    { id: 3, name: "Phạm Văn C", avatar: "", isOnline: true },
    { id: 4, name: "Lê Thị D", avatar: "", isOnline: false },
    { id: 5, name: "Hoàng Văn E", avatar: "", isOnline: true },
    { id: 6, name: "Vũ Thị F", avatar: "", isOnline: true },
    { id: 7, name: "Đặng Văn G", avatar: "", isOnline: false },
];

// Helper function to get the last message from a conversation
const getLastMessage = (messages) => {
    if (!messages || messages.length === 0) return "";
    // Find the message with the highest ID
    const lastMessage = messages.reduce((latest, current) =>
        current.id > latest.id ? current : latest
    );
    return lastMessage.text;
};

export default function ChatPage() {
    const [conversations, setConversations] = useState(mockConversations);
    const [users, setUsers] = useState(mockUsers);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Filter conversations based on search term
    const filteredConversations = conversations.filter(
        (conversation) =>
            conversation.userName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            getLastMessage(conversation.messages)
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    // Filter users based on search term
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

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
    const handleSendMessage = () => {
        if (newMessage.trim() === "" || !selectedConversation) return;

        const newMsgId =
            selectedConversation.messages.length > 0
                ? Math.max(...selectedConversation.messages.map((m) => m.id)) +
                  1
                : 1;

        const newMsg = {
            id: newMsgId,
            senderId: 0, // Current user (0 represents current user)
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            isRead: false,
        };

        // Update conversation with new message
        const updatedConversations = conversations.map((conv) => {
            if (conv.id === selectedConversation.id) {
                const updatedMessages = [...conv.messages, newMsg];
                return {
                    ...conv,
                    messages: updatedMessages,
                    timestamp: "Vừa xong",
                    isRead: true,
                };
            }
            return conv;
        });

        setConversations(updatedConversations);
        setSelectedConversation({
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMsg],
            timestamp: "Vừa xong",
            isRead: true,
        });
        setNewMessage("");

        // Scroll to bottom after sending message
        setTimeout(scrollToBottom, 100);
    };

    // Handle creating a new conversation
    const handleCreateConversation = () => {
        if (!selectedUser) return;

        // Check if conversation already exists
        const existingConversation = conversations.find(
            (conv) => conv.userId === selectedUser.id
        );

        if (existingConversation) {
            setSelectedConversation(existingConversation);
        } else {
            // Create new conversation
            const greetingText = `Chào bạn! Mình là ${selectedUser.name}`;
            const newConversation = {
                id: conversations.length + 1,
                userId: selectedUser.id,
                userName: selectedUser.name,
                userAvatar: selectedUser.avatar,
                isOnline: selectedUser.isOnline,
                timestamp: "Vừa xong",
                unreadCount: 0,
                isRead: true,
                messages: [
                    {
                        id: 1,
                        senderId: selectedUser.id,
                        text: greetingText,
                        timestamp: "Vừa xong",
                        isRead: false,
                    },
                ],
            };

            const updatedConversations = [newConversation, ...conversations];
            setConversations(updatedConversations);
            setSelectedConversation(newConversation);
        }

        setIsCreateDialogOpen(false);
        setSelectedUser(null);
        setUserSearchTerm("");
    };

    // Handle selecting a conversation
    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);

        // Mark as read
        const updatedConversations = conversations.map((conv) => {
            if (conv.id === conversation.id) {
                return { ...conv, unreadCount: 0, isRead: true };
            }
            return conv;
        });
        setConversations(updatedConversations);

        // Hide scroll button when selecting conversation
        setShowScrollButton(false);
    };

    // Handle key press for sending message
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] bg-[#f5f3f0] px-26 py-3 gap-x-3">
            {/* Conversations Sidebar */}
            <div className="bg-white w-1/4 border border-gray-300 flex flex-col rounded-xl">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[24px] page-header">Cuộc trò chuyện</h2>
                        <Button
                            className={"rounded-full bg-[#91114D] text-white"}
                            size="icon"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <RiChatNewLine className="h-5 w-5" />
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
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Tạo cuộc trò chuyện mới
                                </DialogTitle>
                            </DialogHeader>

                            {/* User Search */}
                            <div className="relative my-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm người dùng..."
                                    className="pl-10"
                                    value={userSearchTerm}
                                    onChange={(e) =>
                                        setUserSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            {/* Users List */}
                            <div className="max-h-64 overflow-y-auto">
                                {filteredUsers.length > 0 ? (
                                    <>
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className={`flex items-center p-3 rounded-lg cursor-pointer ${
                                                    selectedUser?.id === user.id
                                                        ? "bg-[#E6DDD5]"
                                                        : "hover:bg-gray-100"
                                                }`}
                                                onClick={() =>
                                                    setSelectedUser(user)
                                                }
                                            >
                                                <Avatar className="h-10 w-10 mr-3">
                                                    <AvatarImage
                                                        src={user.avatar}
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback className={"bg-primary text-primary-foreground"}>
                                                        {user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {user.name}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-3 h-3 rounded-full ${
                                                        user.isOnline
                                                            ? "bg-green-500"
                                                            : "bg-gray-300"
                                                    }`}
                                                ></div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="mx-auto w-full">
                                        <p className="py-3 text-center text-gray-500">Không tìm thấy kết quả phù hợp.</p>
                                    </div>
                                )}
                            </div>

                            {/* Dialog Footer */}
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleCreateConversation}
                                    disabled={!selectedUser}
                                    className="bg-[#91114D] hover:bg-[#91114D]/90"
                                >
                                    Tạo
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                Chưa có cuộc trò chuyện nào
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Bắt đầu trò chuyện với bạn bè của bạn
                            </p>
                            <DialogTrigger asChild>
                                <Button className="bg-[#91114D] hover:bg-[#91114D]/90">
                                    Tạo cuộc trò chuyện mới
                                </Button>
                            </DialogTrigger>
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                    selectedConversation?.id === conversation.id
                                        ? "bg-[#E6DDD5]"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleSelectConversation(conversation)
                                }
                            >
                                <div className="relative">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={conversation.userAvatar}
                                            alt={conversation.userName}
                                        />
                                        <AvatarFallback
                                            className={"bg-black text-white"}
                                        >
                                            {conversation.userName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                            conversation.isOnline
                                                ? "bg-green-500"
                                                : "bg-gray-300"
                                        }`}
                                    ></div>
                                </div>

                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold truncate">
                                            {conversation.userName}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {conversation.timestamp}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-sm text-gray-500 truncate">
                                            {getLastMessage(
                                                conversation.messages
                                            )}
                                        </p>
                                        {conversation.unreadCount > 0 ? (
                                            <span className="bg-[#91114D] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {conversation.unreadCount}
                                            </span>
                                        ) : conversation.isRead ? (
                                            <CheckCheck className="h-4 w-4 text-blue-500" />
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="bg-white flex-1 flex flex-col rounded-xl border border-gray-300">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b rounded-t-xl border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                    <AvatarImage
                                        src={selectedConversation.userAvatar}
                                        alt={selectedConversation.userName}
                                    />
                                    <AvatarFallback className={"bg-black text-white w-11 h-11"}>
                                        {selectedConversation.userName.charAt(
                                            0
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold">
                                        {selectedConversation.userName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedConversation.isOnline
                                            ? "Đang hoạt động"
                                            : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="ghost" size="icon">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 bg-[#F7F7F7] relative"
                            ref={messagesContainerRef}
                        >
                            {selectedConversation.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Avatar className="h-16 w-16 mb-4">
                                        <AvatarImage
                                            src={
                                                selectedConversation.userAvatar
                                            }
                                            alt={selectedConversation.userName}
                                        />
                                        <AvatarFallback className="text-2xl">
                                            {selectedConversation.userName.charAt(
                                                0
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-medium mb-2">
                                        {selectedConversation.userName}
                                    </h3>
                                    <p className="text-gray-500">
                                        Chưa có tin nhắn nào. Hãy bắt đầu cuộc
                                        trò chuyện!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Scroll to bottom button */}
                                    {showScrollButton && (
                                        <Button
                                            className="fixed bottom-24 right-8 rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                                            size="icon"
                                            onClick={scrollToBottom}
                                        >
                                            <ChevronDown className="h-5 w-5" />
                                        </Button>
                                    )}

                                    {selectedConversation.messages.map(
                                        (message) => (
                                            <div
                                                key={message.id}
                                                className={`flex mb-4 ${
                                                    message.senderId === 0
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                {message.senderId !== 0 && (
                                                    <Avatar className="h-8 w-8 mr-2 self-end">
                                                        <AvatarImage
                                                            src={
                                                                selectedConversation.userAvatar
                                                            }
                                                            alt={
                                                                selectedConversation.userName
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {selectedConversation.userName.charAt(
                                                                0
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div
                                                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${
                                                        message.senderId === 0
                                                            ? "bg-[#91114D] text-white rounded-br-none"
                                                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                                                    }`}
                                                >
                                                    <p>{message.text}</p>
                                                    <div
                                                        className={`text-xs mt-1 flex justify-end ${
                                                            message.senderId ===
                                                            0
                                                                ? "text-[#f0e0d6]"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {message.timestamp}
                                                        {message.senderId ===
                                                            0 &&
                                                            (message.isRead ? (
                                                                <CheckCheck className="h-3 w-3 ml-1 text-blue-300" />
                                                            ) : (
                                                                <Check className="h-3 w-3 ml-1" />
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t rounded-b-xl border-gray-200 p-4">
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`rounded-full p-1`}
                                >
                                    <LuImage className="h-6 w-6" />
                                </Button>
                                <Input
                                    placeholder={`Nhắn tin cho ${selectedConversation.userName}...`}
                                    className="mx-2 rounded-full "
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
                                />
                                <Button
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                    onClick={handleSendMessage}
                                    className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                                >
                                    <Send className="h-5 w-5" />
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
