import React, { useState } from "react";
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
    // Sample posts data
    const [posts] = useState([
        {
            id: 1,
            user: { name: "Alex Johnson", avatar: "" },
            time: "2 giờ trước",
            content:
                "Hôm nay mình đưa cún Buddy đi công viên. Cậu ấy vui chơi với những chú chó khác rất vui!",
            pet: { name: "Buddy" },
            likes: 24,
            comments: 5,
            image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
        },
        {
            id: 2,
            user: { name: "Maria Garcia", avatar: "" },
            time: "5 giờ trước",
            content:
                "Whiskers đã khỏe hơn nhiều sau khi đi khám bác sĩ thú y. Cảm ơn mọi người đã quan tâm!",
            pet: { name: "Whiskers" },
            likes: 42,
            comments: 8,
            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
        },
        {
            id: 3,
            user: { name: "James Wilson", avatar: "" },
            time: "1 ngày trước",
            content:
                "Vừa nhận nuôi một chú cún con! Hãy gặp Charlie, thành viên mới nhất trong gia đình chúng mình.",
            pet: { name: "Charlie" },
            likes: 128,
            comments: 15,
            image: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800",
        },
        {
            id: 4,
            user: { name: "Nguyễn Minh Anh", avatar: "" },
            time: "3 giờ trước",
            content:
                "Milo của mình vừa học được một trò mới! Giờ cậu ấy có thể bắt tay và ngồi theo lệnh rồi.",
            pet: { name: "Milo" },
            likes: 56,
            comments: 12,
            image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800",
        },
        {
            id: 6,
            user: { name: "Lê Thị Hương", avatar: "" },
            time: "12 giờ trước",
            content:
                "Max vừa tròn 5 tuổi hôm nay! Tổ chức sinh nhật cho cậu ấy với bánh và đồ chơi mới.",
            pet: { name: "Max" },
            likes: 145,
            comments: 23,
            image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
        },
        {
            id: 7,
            user: { name: "Phạm Đức Long", avatar: "" },
            time: "1 ngày trước",
            content:
                "Bella thích ngủ trong hộp giấy hơn là giường mới mình mua cho bé. Mèo thật khó hiểu! 😅",
            pet: { name: "Bella" },
            likes: 73,
            comments: 18,
            image: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800",
        },
        {
            id: 8,
            user: { name: "Võ Thanh Tùng", avatar: "" },
            time: "8 giờ trước",
            content:
                "Đưa Rocky đi tắm và cắt tỉa lông. Bây giờ cậu ấy trông thật đẹp trai và thơm tho!",
            pet: { name: "Rocky" },
            likes: 67,
            comments: 9,
            image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
        },
        {
            id: 9,
            user: { name: "Hoàng Thị Mai", avatar: "" },
            time: "2 ngày trước",
            content:
                "Coco vừa hoàn thành khóa huấn luyện cơ bản! Mình rất tự hào về em bé của mình.",
            pet: { name: "Coco" },
            likes: 112,
            comments: 14,
            image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800",
        },
    ]);

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
                        <PostCreation />
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
            <FloatingCreateButton />
        </div>
    );
}