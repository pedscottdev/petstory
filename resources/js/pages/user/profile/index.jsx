import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostCreation from '@/components/user/newfeed/PostCreation';
import PostItem from '@/components/user/newfeed/PostItem';
import PostFilter from '@/components/user/newfeed/PostFilter';

export default function ProfilePage() {
  const { userId } = useParams();
  const isLoggedInUser = !userId; // If no userId in URL, it's the logged-in user's own profile

  // Sample user data - in a real app this would come from an API
  const user = {
    id: userId || 'current-user',
    name: 'Phạm Hoàng Trọng',
    avatar: '',
    bio: 'Yêu thích thú cưng và chia sẻ những khoảnh khắc đáng yêu của chúng 🐾',
    posts: 42,
    followers: 128,
    following: 56,
  };

  // Sample pets data - in a real app this would come from an API
  const pets = [
    { id: 1, name: 'Buddy', type: 'Mèo Anh lông ngắn', avatar: '', breed: 'Mèo Anh lông ngắn' },
    { id: 2, name: 'Whiskers', type: 'Chó Pitbull', avatar: '', breed: 'Chó Pitbull' },
    { id: 3, name: 'Tweety', type: 'Vẹt Nam Mỹ', avatar: '', breed: 'Vẹt Nam Mỹ' },
  ];

  // Sample posts data - in a real app this would come from an API
  const initialPosts = [
    {
      id: 1,
      user: { name: 'Phạm Hoàng Trọng', avatar: '' },
      time: '2 giờ trước',
      content: 'Buddy hôm nay rất ngoan, ăn uống đầy đủ và chơi rất vui vẻ. Các bạn có thú cưng nào giống Buddy không?',
      image: '',
      likes: 24,
      comments: 5,
      pet: pets[0]
    },
    {
      id: 2,
      user: { name: 'Phạm Hoàng Trọng', avatar: '' },
      time: '1 ngày trước',
      content: 'Whiskers đi tiêm phòng về nên hơi ủ rũ. Các bạn có kinh nghiệm chăm sóc thú cưng sau tiêm phòng không?',
      image: '',
      likes: 18,
      comments: 3,
      pet: pets[1]
    },
    {
      id: 3,
      user: { name: 'Phạm Hoàng Trọng', avatar: '' },
      time: '3 ngày trước',
      content: 'Tweety hát hay quá! Mình rất thích nghe nó bắt chước giọng người.',
      image: '',
      likes: 32,
      comments: 7,
      pet: pets[2]
    }
  ];

  const [posts, setPosts] = useState(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState(initialPosts);

  const handlePostCreated = () => {
    // In a real app, this would fetch new posts from the server
    console.log('Post created');
  };

  const handlePetFilter = (petId) => {
    if (petId === 'all') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => post.pet.id === petId);
      setFilteredPosts(filtered);
    }
  };

  return (
    <div className='bg-[#f5f3f0] min-h-screen py-6'>
      <div className="max-w-4xl mx-auto px-4">
        {/* User Profile Section */}
        <Card className="mb-6 bg-white border-[#e1d6ca]">
          <CardHeader className="flex flex-col md:flex-row gap-6 items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl bg-[#91114D] text-white">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {isLoggedInUser ? (
                  <Button className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90">
                    Chỉnh sửa trang cá nhân
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90">
                      Theo dõi
                    </Button>
                    <Button variant="outline" className="rounded-full border-[#91114D] text-[#91114D] hover:bg-[#f0e9e5]">
                      Nhắn tin
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-8 mb-4">
                <div className='flex flex-col'>
                  <span className="font-bold text-center">{user.posts}</span>
                  <span className='text-gray-600'>Bài viết</span> 
                </div>
                <div className='flex flex-col'>
                  <span className="font-bold text-center">{user.followers}</span>
                  <span className='text-gray-600'>Người theo dõi</span> 
                </div>
                <div className='flex flex-col'>
                  <span className="font-bold text-center">{user.following}</span>
                  <span className='text-gray-600'>Đang theo dõi</span> 
                </div>
              </div>
              
              <p className="font-semibold">{user.name}</p>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <h2 className="font-bold text-lg mb-3">Thú cưng</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {pets.map((pet) => (
                <div key={pet.id} className="flex flex-col items-center min-w-[100px]">
                  <Avatar className="w-16 h-16 mb-2">
                    <AvatarImage src={pet.avatar} alt={pet.name} />
                    <AvatarFallback className="bg-[#E6DDD5] text-[#91114D]">{pet.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm text-center">{pet.name}</p>
                  <p className="text-xs text-gray-600 text-center">{pet.breed}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Posts Section */}
        <div className="mb-6">
          {isLoggedInUser && <PostCreation onPostCreated={handlePostCreated} />}
        </div>
        
        {/* Post Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">Bài viết</h2>
            <div className="flex gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-[#91114D] text-[#91114D] hover:bg-[#f0e9e5]"
                onClick={() => handlePetFilter('all')}
              >
                Tất cả
              </Button>
              {pets.map(pet => (
                <Button 
                  key={pet.id}
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-[#91114D] text-[#91114D] hover:bg-[#f0e9e5]"
                  onClick={() => handlePetFilter(pet.id)}
                >
                  {pet.name}
                </Button>
              ))}
            </div>
          </div>
          
          <PostFilter />
        </div>
        
        {/* Posts List */}
        <div>
          {filteredPosts.map(post => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}