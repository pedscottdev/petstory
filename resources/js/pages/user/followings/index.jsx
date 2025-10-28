import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function FollowingPage() {
  // Sample data for suggestions
  const [suggestions] = useState([
    { id: 1, name: 'Alex Johnson', avatar: '', posts: 12, followers: 1200, following: 350 },
    { id: 2, name: 'Maria Garcia', avatar: '', posts: 8, followers: 850, following: 220 },
    { id: 3, name: 'James Wilson', avatar: '', posts: 24, followers: 3200, following: 560 },
    { id: 4, name: 'Nguyễn Minh Anh', avatar: '', posts: 15, followers: 1800, following: 420 },
    { id: 5, name: 'Lê Thị Hương', avatar: '', posts: 7, followers: 650, following: 180 },
    { id: 6, name: 'Phạm Đức Long', avatar: '', posts: 32, followers: 4500, following: 780 },
    { id: 7, name: 'Võ Thanh Tùng', avatar: '', posts: 19, followers: 2100, following: 390 },
    { id: 8, name: 'Hoàng Thị Mai', avatar: '', posts: 11, followers: 980, following: 270 },
    { id: 9, name: 'Trần Văn Nam', avatar: '', posts: 26, followers: 3800, following: 620 },
  ]);

  // Sample data for followers and following
  const [followers] = useState([
    { id: 1, name: 'Alex Johnson', avatar: '', isFollowing: true, posts: 12, followers: 1200, following: 350 },
    { id: 2, name: 'Maria Garcia', avatar: '', isFollowing: false, posts: 8, followers: 850, following: 220 },
    { id: 3, name: 'James Wilson', avatar: '', isFollowing: true, posts: 24, followers: 3200, following: 560 },
    { id: 4, name: 'Nguyễn Minh Anh', avatar: '', isFollowing: false, posts: 15, followers: 1800, following: 420 },
    { id: 5, name: 'Lê Thị Hương', avatar: '', isFollowing: true, posts: 7, followers: 650, following: 180 },
  ]);

  const [following] = useState([
    { id: 1, name: 'Phạm Đức Long', avatar: '', isFollowing: true, posts: 32, followers: 4500, following: 780 },
    { id: 2, name: 'Võ Thanh Tùng', avatar: '', isFollowing: true, posts: 19, followers: 2100, following: 390 },
    { id: 3, name: 'Hoàng Thị Mai', avatar: '', isFollowing: true, posts: 11, followers: 980, following: 270 },
    { id: 4, name: 'Trần Văn Nam', avatar: '', isFollowing: true, posts: 26, followers: 3800, following: 620 },
  ]);

  // Search states
  const [searchFollowers, setSearchFollowers] = useState('');
  const [searchFollowing, setSearchFollowing] = useState('');

  const handleFollowToggle = (userId, userType) => {
    // This would be implemented with actual API calls
    console.log(`Toggle follow status for user ${userId} in ${userType}`);
  };

  const handleViewProfile = (userId) => {
    // This would navigate to the user's profile
    console.log(`View profile for user ${userId}`);
  };

  // Filter followers based on search
  const filteredFollowers = followers.filter(user =>
    user.name.toLowerCase().includes(searchFollowers.toLowerCase())
  );

  // Filter following based on search
  const filteredFollowing = following.filter(user =>
    user.name.toLowerCase().includes(searchFollowing.toLowerCase())
  );

  // User card component
  const UserCard = ({ user, userType }) => (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <Avatar className="size-16">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-center mt-2">{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-semibold">{user.posts}</div>
            <div className="text-muted-foreground text-xs">Bài viết</div>
          </div>
          <div>
            <div className="font-semibold">{user.followers}</div>
            <div className="text-muted-foreground text-xs">Người theo dõi</div>
          </div>
          <div>
            <div className="font-semibold">{user.following}</div>
            <div className="text-muted-foreground text-xs">Đang theo dõi</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => handleViewProfile(user.id)}
        >
          Xem trang cá nhân
        </Button>
        <Button 
          variant={user.isFollowing ? "outline" : "default"}
          size="sm"
          className="flex-1"
          onClick={() => handleFollowToggle(user.id, userType)}
        >
          {user.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className='bg-[#f5f3f0] min-h-screen py-10'>
      <div className='w-full px-32'>
        <h1 className='text-4xl page-header mb-6'>Mọi người</h1>
        
        <Tabs defaultValue="suggestions">
          <TabsList className="grid  grid-cols-3 mb-6">
            <TabsTrigger value="suggestions" className="text-base">
              Đề xuất cho bạn
            </TabsTrigger>
            <TabsTrigger value="followers" className="text-base">
              Người theo dõi ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="text-base">
              Đang theo dõi ({following.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              {suggestions.map((user) => (
                <UserCard key={user.id} user={user} userType="suggestions" />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="followers" className="mt-0">
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm người theo dõi..."
                value={searchFollowers}
                onChange={(e) => setSearchFollowers(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {filteredFollowers.map((user) => (
                <UserCard key={user.id} user={user} userType="followers" />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="following" className="mt-0">
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm người đang theo dõi..."
                value={searchFollowing}
                onChange={(e) => setSearchFollowing(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {filteredFollowing.map((user) => (
                <UserCard key={user.id} user={user} userType="following" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}