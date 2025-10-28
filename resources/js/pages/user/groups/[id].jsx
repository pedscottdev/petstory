import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Heart, 
  Share, 
  MoreHorizontal, 
  Bell, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  Camera,
  Plus,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GroupDetailPage() {
  const { id } = useParams();
  
  // Sample group data
  const groupData = {
    id: 1,
    name: "Cộng đồng chó Golden Retriever Việt Nam",
    members: 1250,
    posts: 42,
    role: "Quản trị",
    description: "Chào mừng bạn đến với cộng đồng yêu quý Golden Retriever lớn nhất Việt Nam! Chúng tôi là những người yêu mến giống chó thân thiện, trung thành và thông minh này. Hãy chia sẻ kinh nghiệm chăm sóc, huấn luyện và kết nối với những người có cùng sở thích.",
    coverImage: "/placeholder-group-cover.jpg",
    memberImages: [
      "/avatar1.jpg",
      "/avatar2.jpg",
      "/avatar3.jpg",
      "/avatar4.jpg",
      "/avatar5.jpg"
    ]
  };

  // Sample posts data
  const samplePosts = [
    {
      id: 1,
      author: "Trần Văn Nam",
      time: "2 giờ trước",
      content: "Chia sẻ kinh nghiệm chăm sóc Golden Retriever khi thời tiết chuyển mùa. Các bạn nên chú ý bổ sung vitamin và thay đổi chế độ ăn phù hợp để chú cún nhà mình luôn khỏe mạnh nhé!",
      likes: 24,
      comments: 8,
      liked: false,
      images: ["/post-image1.jpg"]
    },
    {
      id: 2,
      author: "Nguyễn Thị Mai",
      time: "5 giờ trước",
      content: "Golden của mình tên là Mít Ướt, nay được 8 tháng tuổi. Bé rất hiếu động và đáng yêu. Có ai có kinh nghiệm huấn luyện Golden cái không? Bé nhà mình hơi bướng :)",
      likes: 15,
      comments: 3,
      liked: true,
      images: ["/post-image2.jpg", "/post-image3.jpg"]
    }
  ];

  const [posts, setPosts] = useState(samplePosts);
  const [newPostContent, setNewPostContent] = useState("");

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } 
        : post
    ));
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        author: "Phạm Hoàng Trọng",
        time: "Vừa xong",
        content: newPostContent,
        likes: 0,
        comments: 0,
        liked: false,
        images: []
      };
      setPosts([newPost, ...posts]);
      setNewPostContent("");
    }
  };

  return (
    <div className='bg-[#f5f3f0] min-h-screen'>
      {/* Group Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {/* Group Info */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-24 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
              {/* Group Avatar */}
              <div className="bg-white p-1 rounded-full">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 md:w-32 md:h-32" />
              </div>
              
              <div className="text-white">
                <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md">{groupData.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{groupData.members} thành viên</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{groupData.posts} bài viết</span>
                  </div>
                  <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {groupData.role}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mb-6">
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm rounded-full">
                <Bell className="h-4 w-4 mr-2" />
                Thông báo
              </Button>
              <Button className="bg-[#91114D] hover:bg-[#7a0e41] rounded-full">
                Tham gia nhóm
              </Button>
              <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Group Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Giới thiệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{groupData.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{groupData.members} thành viên</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Việt Nam</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    <span>golden-retriever.vn</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Members Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Thành viên ({groupData.members})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex -space-x-2">
                  {groupData.memberImages.map((img, index) => (
                    <Avatar key={index} className="border-2 border-white">
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                  <Button size="icon" variant="outline" className="rounded-full border-2 border-white ml-2 h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Middle Column - Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>PT</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input 
                      placeholder="Bạn muốn chia sẻ gì với cộng đồng?" 
                      className="mb-3"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Camera className="h-4 w-4 mr-1" />
                          Hình ảnh
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-[#91114D] hover:bg-[#7a0e41]"
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Đăng
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="mr-3">
                          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.author}</p>
                          <p className="text-sm text-gray-500">{post.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    
                    {post.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {post.images.map((img, index) => (
                          <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <img 
                              src={img} 
                              alt={`Post image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={post.liked ? "text-red-500 hover:text-red-600" : ""}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${post.liked ? "fill-current" : ""}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.comments} bình luận
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4 mr-1" />
                        Chia sẻ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}