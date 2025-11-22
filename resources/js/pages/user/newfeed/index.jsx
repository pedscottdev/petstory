import React, { useState, useRef } from "react";
import MainLayout from "@/layouts/main-layout";
import {
    PostCreation,
    PostFilter,
    PostItem,
    PeopleYouMayKnow,
    UserProfile,
} from "@/components/user/newfeed";
import { FloatingCreateButton } from "@/components/user/newfeed";

export default function NewfeedPage() {
    const floatingButtonRef = useRef(null);
    
    // Sample posts data
    const [posts] = useState([
        {
            id: 1,
            user: { 
                name: "Nguyễn Văn An", 
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
            },
            time: "2 giờ trước",
            content:
                "Hôm nay mình đưa cún Buddy đi công viên. Cậu ấy vui chơi với những chú chó khác rất vui!",
            pets: [
                { id: 101, name: "Buddy", breed: "Labrador" }
            ],
            likes: 24,
            comments: 5,
            images: [
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800"
            ]
        },
        {
            id: 2,
            user: { 
                name: "Trần Thị Bình", 
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
            },
            time: "5 giờ trước",
            content:
                "Whiskers đã khỏe hơn nhiều sau khi đi khám bác sĩ thú y. Cảm ơn mọi người đã quan tâm!",
            pets: [
                { id: 102, name: "Whiskers", breed: "Mèo Anh lông ngắn" },
                { id: 103, name: "Mittens", breed: "Mèo Ba Tư" }
            ],
            likes: 42,
            comments: 8,
            images: [
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
                "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800",
                "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800"
            ]
        },
        {
            id: 3,
            user: { 
                name: "Lê Hoàng Dũng", 
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
            },
            time: "1 ngày trước",
            content:
                "Vừa nhận nuôi một chú cún con! Hãy gặp Charlie, thành viên mới nhất trong gia đình chúng mình.",
            pets: [
                { id: 104, name: "Charlie", breed: "Chó Golden Retriever" },
                { id: 105, name: "Max", breed: "Chó Poodle" },
                { id: 106, name: "Bella", breed: "Chó Anh lông dài" }
            ],
            likes: 128,
            comments: 15,
            images: [
                "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800",
                "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
                "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800",
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800"
            ]
        },
        {
            id: 4,
            user: { 
                name: "Nguyễn Minh Anh", 
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" 
            },
            time: "3 giờ trước",
            content:
                "Milo của mình vừa học được một trò mới! Giờ cậu ấy có thể bắt tay và ngồi theo lệnh rồi.",
            pets: [
                { id: 107, name: "Milo", breed: "Chích chòe" }
            ],
            likes: 56,
            comments: 12,
            image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800",
        },
        {
            id: 6,
            user: { 
                name: "Lê Thị Hương", 
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" 
            },
            time: "12 giờ trước",
            content:
                "Max vừa tròn 5 tuổi hôm nay! Tổ chức sinh nhật cho cậu ấy với bánh và đồ chơi mới.",
            pets: [
                { id: 108, name: "Max", breed: "Pug" },
                { id: 109, name: "Coco", breed: "Hamster" }
            ],
            likes: 145,
            comments: 23,
            image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
        },
        {
            id: 7,
            user: { 
                name: "Phạm Đức Long", 
                avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=100&h=100&fit=crop" 
            },
            time: "1 ngày trước",
            content:
                "Bella thích ngủ trong hộp giấy hơn là giường mới mình mua cho bé. Mèo thật khó hiểu! 😅",
            pets: [
                { id: 110, name: "Bella", breed: "Munchkin" },
                { id: 111, name: "Oscar", breed: "Maine Coon" },
                { id: 112, name: "Luna", breed: "Sphynx" }
            ],
            likes: 73,
            comments: 18,
            image: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800",
        },
        {
            id: 8,
            user: { 
                name: "Võ Thanh Tùng", 
                avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" 
            },
            time: "8 giờ trước",
            content:
                "Đưa Rocky đi tắm và cắt tỉa lông. Bây giờ cậu ấy trông thật đẹp trai và thơm tho!",
            pets: [
                { id: 113, name: "Rocky", breed: "Bulldog" }
            ],
            likes: 67,
            comments: 9,
            image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
        },
        {
            id: 9,
            user: { 
                name: "Hoàng Thị Mai", 
                avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop" 
            },
            time: "2 ngày trước",
            content:
                "Coco vừa hoàn thành khóa huấn luyện cơ bản! Mình rất tự hào về em bé của mình.",
            pets: [
                { id: 114, name: "Coco", breed: "Shiba Inu" },
                { id: 115, name: "Tweety", breed: "Vẹt" }
            ],
            likes: 112,
            comments: 14,
            image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800",
        },
    ]);

    const handleOpenCreateDialog = () => {
        if (floatingButtonRef.current) {
            floatingButtonRef.current.openDialog();
        }
    };

    return (
        <div className="relative bg-[#f5f3f0] min-h-screen py-5">
            <div className="px-26 w-[100%]">
                <div className="grid grid-cols-4 justify-center gap-4">
                    {/* Left sidebar */}
                    <div className="lg:col-span-1">
                        <UserProfile />
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <PostCreation onOpenDialog={handleOpenCreateDialog} />
                        <PostFilter />
                        <div>
                            {posts.map((post) => (
                                <PostItem key={post.id} post={post} />
                            ))}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="lg:col-span-1">
                        <PeopleYouMayKnow />
                    </div>
                </div>
            </div>
            <FloatingCreateButton ref={floatingButtonRef} />
        </div>
    );
}