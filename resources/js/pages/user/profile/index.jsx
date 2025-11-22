import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PostCreation from '@/components/user/newfeed/PostCreation';
import { FloatingCreateButton } from '@/components/user/newfeed';
import PostItem from '@/components/user/newfeed/PostItem';
import PostFilter from '@/components/user/newfeed/PostFilter';
import ProfileCover from "../../../../../public/images/profile-cover.jpg";
import { Check, Eye, Loader2 } from 'lucide-react';
import { BsCheckCircleFill } from 'react-icons/bs';
import { HiBadgeCheck } from 'react-icons/hi';
import { toast } from 'sonner';
import { Heart, Camera } from 'lucide-react';
import defaultAvatar from "../../../../../public/images/special-avatar.png";
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const avatarInputRef = useRef(null);
  const floatingButtonRef = useRef(null);
  const isLoggedInUser = userId;

  // Sample user data - in a real app this would come from an API
  const [user, setUser] = useState({
    id: 1,
    name: 'Phạm Hoàng Trọng',
    avatar: defaultAvatar,
    coverImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80',
    bio: 'Yêu thích thú cưng và chia sẻ những khoảnh khắc đáng yêu của chúng 🐾',
    posts: 42,
    followers: 128,
    following: 56,
  });

  // Update user data when authUser changes
  useEffect(() => {
    if (authUser) {
      setUser(prevUser => ({
        ...prevUser,
        name: authUser.first_name + ' ' + authUser.last_name,
        // In a real app, you would update other user properties as well
      }));
    }
  }, [authUser]);

  // Sample pets data - in a real app this would come from an API
  const [pets, setPets] = useState([
    { id: 1, name: 'Buddy', type: 'Chó Pitbull', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', breed: 'Chó Pitbull', isLiked: false },
    { id: 2, name: 'Whiskers', type: 'Chó Golden Retriever', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', breed: 'Chó Golden Retriever', isLiked: true },
    { id: 3, name: 'Tweety', type: 'Vẹt Nam Mỹ', avatar: 'https://images.unsplash.com/photo-1700048802079-ec47d07f7919?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=907', breed: 'Vẹt Nam Mỹ', isLiked: false },
  ]);

  // Sample followers data
  const [followers, setFollowers] = useState([
    { id: 1, name: 'Nguyễn Văn An', email: 'nguyenvanan@example.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
    { id: 2, name: 'Trần Thị Bình', email: 'tranthibinh@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: false },
    { id: 3, name: 'Lê Văn Cường', email: 'levancuong@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
    { id: 4, name: 'Phạm Thị Dung', email: 'phamthidung@example.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: false },
    { id: 5, name: 'Hoàng Văn Em', email: 'hoangvanem@example.com', avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
  ]);

  // Sample following data
  const [following, setFollowing] = useState([
    { id: 1, name: 'Nguyễn Văn An', email: 'nguyenvanan@example.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
    { id: 2, name: 'Trần Thị Bình', email: 'tranthibinh@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
    { id: 3, name: 'Lê Văn Cường', email: 'levancuong@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
    { id: 4, name: 'Phạm Thị Dung', email: 'phamthidung@example.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
    { id: 5, name: 'Hoàng Văn Em', email: 'hoangvanem@example.com', avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80', isFollowing: true },
  ]);

  // State for search terms
  const [followerSearchTerm, setFollowerSearchTerm] = useState('');
  const [followingSearchTerm, setFollowingSearchTerm] = useState('');

  // State for dialog visibility
  const [isFollowerDialogOpen, setIsFollowerDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);

  // Filtered lists based on search terms
  const filteredFollowers = followers.filter(follower =>
    follower.name.toLowerCase().includes(followerSearchTerm.toLowerCase()) ||
    follower.email.toLowerCase().includes(followerSearchTerm.toLowerCase())
  );

  const filteredFollowing = following.filter(followingUser =>
    followingUser.name.toLowerCase().includes(followingSearchTerm.toLowerCase()) ||
    followingUser.email.toLowerCase().includes(followingSearchTerm.toLowerCase())
  );

  // Sample posts data - in a real app this would come from an API
  const initialPosts = [
    {
      id: 1,
      user: { name: 'Phạm Hoàng Trọng', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
      time: '2 giờ trước',
      content: 'Buddy hôm nay rất ngoan, ăn uống đầy đủ và chơi rất vui vẻ. Các bạn có thú cưng nào giống Buddy không?',
      image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      likes: 24,
      comments: 5,
      pet: pets[0]
    },
    {
      id: 2,
      user: { name: 'Phạm Hoàng Trọng', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
      time: '1 ngày trước',
      content: 'Whiskers đi tiêm phòng về nên hơi ủ rũ. Các bạn có kinh nghiệm chăm sóc thú cưng sau tiêm phòng không?',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      likes: 18,
      comments: 3,
      pet: pets[1]
    },
    {
      id: 3,
      user: { name: 'Phạm Hoàng Trọng', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
      time: '3 ngày trước',
      content: 'Tweety hát hay quá! Mình rất thích nghe nó bắt chước giọng người.',
      image: 'https://images.unsplash.com/photo-1598755257130-c2aaca1f08c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      likes: 32,
      comments: 7,
      pet: pets[2]
    }
  ];

  const [posts, setPosts] = useState(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState(initialPosts);
  const [isFollowingUser, setIsFollowingUser] = useState(false); // For demo purposes
  const [isPetDetailDialogOpen, setIsPetDetailDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  // Add loading state for post filtering
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [activePetFilter, setActivePetFilter] = useState('all');

  // State for avatar upload
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [newAvatar, setNewAvatar] = useState(null);
  const [showAvatarControls, setShowAvatarControls] = useState(false);

  const handlePostCreated = () => {
    // In a real app, this would fetch new posts from the server
    console.log('Post created');
  };

  const handlePetFilter = (petId) => {
    // Set loading state
    setIsFilterLoading(true);
    setActivePetFilter(petId);
    
    // Simulate API call delay
    setTimeout(() => {
      if (petId === 'all') {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter(post => post.pet.id === petId);
        setFilteredPosts(filtered);
      }
      setIsFilterLoading(false);
    }, 500); // Simulate 500ms delay
  };

  const handleFollowToggle = () => {
    setIsFollowingUser(!isFollowingUser);
    toast.success(!isFollowingUser ? 'Đã theo dõi' : 'Đã hủy theo dõi');
  };

  const handlePetLike = (petId) => {
    setPets(prevPets =>
      prevPets.map(pet =>
        pet.id === petId
          ? { ...pet, isLiked: !pet.isLiked }
          : pet
      )
    );

    // Also update the selected pet if it's the same one
    if (selectedPet && selectedPet.id === petId) {
      setSelectedPet(prevPet => ({
        ...prevPet,
        isLiked: !prevPet.isLiked
      }));
    }

    const pet = pets.find(p => p.id === petId);
    if (pet) {
      toast.success(pet.isLiked ? 'Bạn đã hủy thích thú cưng' : 'Bạn đã thích thú cưng');
    }
  };

  const handleNavigateToChats = () => {
    navigate('/chats');
  };

  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error('Chỉ chấp nhận file ảnh');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setNewAvatar(file);
        setShowAvatarControls(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(user.avatar);
    setNewAvatar(null);
    setShowAvatarControls(false);
    toast.success('Đã xóa ảnh đại diện');
  };

  // Save avatar
  const handleSaveAvatar = () => {
    // In a real app, this would send the file to the server
    setUser(prevUser => ({
      ...prevUser,
      avatar: avatarPreview
    }));
    setShowAvatarControls(false);
    toast.success('Đã cập nhật ảnh đại diện');
  };

  // Trigger file input
  const triggerAvatarInput = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  // Handle follow/unfollow for followers list
  const handleFollowerFollowToggle = (userId) => {
    setFollowers(prevFollowers =>
      prevFollowers.map(follower =>
        follower.id === userId
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      )
    );
    
    const follower = followers.find(f => f.id === userId);
    if (follower) {
      toast.success(follower.isFollowing ? 'Đã hủy theo dõi' : 'Đã theo dõi');
    }
  };

  // Handle follow/unfollow for following list
  const handleFollowingFollowToggle = (userId) => {
    setFollowing(prevFollowing =>
      prevFollowing.map(followingUser =>
        followingUser.id === userId
          ? { ...followingUser, isFollowing: !followingUser.isFollowing }
          : followingUser
      )
    );
    
    const followingUser = following.find(f => f.id === userId);
    if (followingUser) {
      toast.success(followingUser.isFollowing ? 'Đã hủy theo dõi' : 'Đã theo dõi');
    }
  };

  const handleOpenCreateDialog = () => {
    if (floatingButtonRef.current) {
      floatingButtonRef.current.openDialog();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top profile cover with h-72 height */}
      <div className="h-81 bg-cover bg-center object-cover " style={{ backgroundImage: `url(${ProfileCover})` }}>
        {/* You can place any content here or keep it as a colored background */}
      </div>

      {/* Bottom background with bg-[#f5f3f0] extending to end of page */}
      <div className="bg-[#f5f3f0] min-h-screen py-6">
        <div className="max-w-5xl mx-auto px-4 -mt-76">
          {/* User Profile Section */}
          <Card className="gap-y-3 mb-6 bg-white border-[#e1d6ca] pt-0 px-8 shadow-none rounded-4xl">
            <CardHeader className="flex flex-col md:flex-row gap-6 items-center pt-10">
              <div className="flex w-full gap-x-16">
                <div className="relative">
                  <Avatar className="h-48 w-48 border-4 border-white">
                    <AvatarImage src={avatarPreview} alt={user.name} className={"object-cover"} />
                    <AvatarFallback className="object-cover text-2xl bg-[#91114D] text-white">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isLoggedInUser && (
                    <>
                      <Button
                        className="absolute top-2 right-3 rounded-full !bg-gray-900 bg-opacity-50 hover:bg-gray-900/80 "
                        onClick={triggerAvatarInput}
                        size={"icon"}
                      >
                        <Camera className="!h-5 !w-5 text-white" />
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      {showAvatarControls && (
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white text-red-500 border-red-500 hover:bg-red-50"
                            onClick={handleRemoveAvatar}
                          >
                            Xóa ảnh
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#91114D] hover:bg-[#91114D]/90"
                            onClick={handleSaveAvatar}
                          >
                            Lưu lại
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-between mb-4">
                  <div className="mb-8">
                    <h1 className="text-4xl page-header">{user.name}
                      <HiBadgeCheck className="text-[#1959d8] inline-block ml-3" />
                    </h1>
                    <p className="text-lg font-medium">trongphamhoang@gmail.com</p>
                  </div>

                  {isLoggedInUser ? (
                    <Button className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90">
                      Chỉnh sửa trang cá nhân
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                        onClick={handleFollowToggle}
                      >
                        {isFollowingUser ? 'Đang theo dõi' : 'Theo dõi'}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full border-[#91114D] text-[#91114D] hover:bg-[#f0e9e5]"
                        onClick={handleNavigateToChats}
                      >
                        Nhắn tin
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-8 my-4">
                    <div className='flex flex-col'>
                      <span className="font-bold text-left text-lg">{user.posts}</span>
                      <span className='text-gray-600 text-base'>Bài viết</span>
                    </div>
                    <div className='flex flex-col cursor-pointer' onClick={() => setIsFollowerDialogOpen(true)}>
                      <span className="font-bold text-left text-lg">{user.followers}</span>
                      <span className='text-gray-600'>Người theo dõi</span>
                    </div>
                    <div className='flex flex-col cursor-pointer' onClick={() => setIsFollowingDialogOpen(true)}>
                      <span className="font-bold text-left text-lg">{user.following}</span>
                      <span className='text-gray-600'>Đang theo dõi</span>
                    </div>
                  </div>

                  <p className="text-gray-700">{user.bio}</p>
                </div>
              </div>

            </CardHeader>

                  {/* Pets Information */}
            <CardContent className={'px-0'}>
              <h2 className="font-bold text-lg mb-3">Thú cưng</h2>
              <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-2">
                {pets.map((pet) => (
                  <div key={pet.id} className="flex flex-col items-start bg-[#F6F1EB] p-4 rounded-xl min-w-[100px]">
                    {/* Name and breed next to avatar */}
                    <div className="flex items-center gap-x-1 w-full mb-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={pet.avatar} alt={pet.name} className={"object-cover rounded-full"} />
                        <AvatarFallback className="object-cover bg-[#E6DDD5] text-[#91114D]">{pet.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col ml-2">
                        <p className="font-bold text-[16px]">{pet.name}</p>
                        <p className="text-xs text-gray-600">{pet.breed}</p>
                      </div>
                    </div>
                    {/* Like and View Details buttons below */}
                    <div className="flex gap-2 mt-2 w-full">
                      <Button
                        variant="outline"
                        size="md"
                        className={`p-1 flex-1 font-semibold rounded-full ${pet.isLiked ? 'text-red-700 hover:text-red-600' : '!text-[#a70f56] !hover:text-[#91114D]'}`}
                        onClick={() => handlePetLike(pet.id)}
                      >
                        {pet.isLiked ? 'Hủy thích' : 'Thích'}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-500"
                        onClick={() => {
                          setSelectedPet(pet);
                          setIsPetDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Follower Dialog */}
          <Dialog open={isFollowerDialogOpen} onOpenChange={setIsFollowerDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Danh sách người theo dõi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={followerSearchTerm}
                  onChange={(e) => setFollowerSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-96 overflow-y-auto">
                  {filteredFollowers.length > 0 ? (
                    filteredFollowers.map((follower) => (
                      <div key={follower.id} className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={follower.avatar} alt={follower.name} />
                            <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{follower.name}</p>
                            <p className="text-sm text-gray-500">{follower.email}</p>
                          </div>
                        </div>
                        <Button
                          variant={follower.isFollowing ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowerFollowToggle(follower.id)}
                        >
                          {follower.isFollowing ? 'Hủy theo dõi' : 'Theo dõi'}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">Không tìm thấy người dùng</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Following Dialog */}
          <Dialog open={isFollowingDialogOpen} onOpenChange={setIsFollowingDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Danh sách đang theo dõi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={followingSearchTerm}
                  onChange={(e) => setFollowingSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-96 overflow-y-auto">
                  {filteredFollowing.length > 0 ? (
                    filteredFollowing.map((followingUser) => (
                      <div key={followingUser.id} className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={followingUser.avatar} alt={followingUser.name} />
                            <AvatarFallback>{followingUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{followingUser.name}</p>
                            <p className="text-sm text-gray-500">{followingUser.email}</p>
                          </div>
                        </div>
                        <Button
                          variant={followingUser.isFollowing ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowingFollowToggle(followingUser.id)}
                        >
                          {followingUser.isFollowing ? 'Hủy theo dõi' : 'Theo dõi'}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">Không tìm thấy người dùng</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Pet Detail Dialog */}
          <Dialog open={isPetDetailDialogOpen} onOpenChange={setIsPetDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              {selectedPet && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                      <span>Chi tiết thú cưng</span>
                      <span className="text-sm font-normal bg-[#E6DDD5] px-2 py-1 rounded">
                        {selectedPet.type}
                      </span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={selectedPet.avatar} alt={selectedPet.name} />
                          <AvatarFallback className="text-3xl bg-[#E6DDD5]">
                            {selectedPet.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">{selectedPet.name}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Loài</Label>
                            <p className="text-gray-700">{selectedPet.type}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Giống</Label>
                            <p className="text-gray-700">{selectedPet.breed || 'Chưa xác định'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handlePetLike(selectedPet.id)}
                            className={`flex items-center ${selectedPet.isLiked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 mr-2 ${selectedPet.isLiked ? 'fill-current' : ''}`} />
                            {selectedPet.isLiked ? 'Bỏ thích' : 'Thích'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Post Filter */}
          <div className="mb-6 px-28">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">Bài viết</h2>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-full !font-semibold border-[#91114D] hover:text-[#91114D] text-[#91114D] hover:bg-[#f0e9e5] ${activePetFilter === 'all' ? 'bg-[#91114D] text-white hover:text-white hover:bg-[#91114D]/90' : ''}`}
                  onClick={() => handlePetFilter('all')}
                >
                  Tất cả
                </Button>
                {pets.map(pet => (
                  <Button
                    key={pet.id}
                    variant="outline"
                    size="sm"
                    className={`rounded-full !font-semibold border-[#91114D] hover:text-[#91114D] text-[#91114D] hover:bg-[#f0e9e5] ${activePetFilter === pet.id ? 'bg-[#91114D] text-white hover:bg-[#91114D]/90' : ''}`}
                    onClick={() => handlePetFilter(pet.id)}
                  >
                    {pet.name}
                  </Button>
                ))}
              </div>
            </div>

          </div>

          {/* Posts Section */}
          <div className="mb-6 px-28">
            {isLoggedInUser && <PostCreation onOpenDialog={handleOpenCreateDialog} />}
          </div>

          {/* Loading indicator */}
          {isFilterLoading && (
            <div className="flex justify-center items-center py-8 px-28">
              <div className="flex items-center gap-2 text-[#91114D]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang tải bài viết...</span>
              </div>
            </div>
          )}

          {/* Posts List */}
          {!isFilterLoading && (
            <div className='px-28'>
              {filteredPosts.map(post => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}

        </div>
      </div>
      <FloatingCreateButton ref={floatingButtonRef} />
    </div>
  );
}