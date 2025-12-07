import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { HiStar } from 'react-icons/hi';
import { AiFillLike } from 'react-icons/ai';
import People from "../../../../../public/images/people.svg"
import { Search } from 'lucide-react';
import { getInitialSuggestionsData, getFollowers, getFollowing, toggleFollow } from '@/api/userApi';
import { AuthContext } from '@/contexts/AuthContext';

// Memoized Loading Skeleton Component
const LoadingSkeleton = React.memo(() => (
  <div className="grid grid-cols-3 gap-4 w-full">
    {[1, 2, 3].map((item) => (
      <Card key={item} className="py-4 pt-6 rounded-2xl flex flex-col shadow-none border border-gray-300 gap-y-4 animate-pulse">
        <CardHeader className="px-4 w-full flex items-start gap-x-4">
          <div className="size-16 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent className="px-4 flex-grow">
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
          </div>
          <div className="bg-gray-100 py-2 rounded-lg grid grid-cols-3 gap-2 text-center text-sm">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="px-4 flex gap-2">
          <div className="h-8 bg-gray-200 rounded-full flex-1"></div>
          <div className="h-8 bg-gray-200 rounded-full flex-1"></div>
        </CardFooter>
      </Card>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized Empty State Component
const EmptyState = React.memo(({ searchTerm }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
      <Search className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
    <p className="text-gray-500 text-center max-w-md">
      {searchTerm
        ? `Không tìm thấy người dùng nào có tên "${searchTerm}". Hãy thử tìm kiếm với từ khóa khác.`
        : "Không có dữ liệu để hiển thị."}
    </p>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Utility function to normalize user data
const normalizeUserData = (user) => ({
  id: user._id || user.id,
  _id: user._id || user.id,
  name: `${user.first_name} ${user.last_name}`,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  avatar: user.avatar_url,
  avatar_url: user.avatar_url,
  posts: user.posts_count || 0,
  followers: user.followers_count || 0,
  following: user.following_count || 0,
  is_followed: user.is_followed || false,
  pets: user.pets || []
});

// Memoized User Card Component
const UserCard = React.memo(({ user, userType, onFollowToggle, onViewProfile }) => {
  const isFollowing = user.is_followed || false;

  return (
    <Card className="py-4 pt-4 rounded-2xl flex flex-col shadow-none border border-gray-300 gap-y-4">
      <CardHeader className="px-4 w-full flex items-start gap-x-4">
        <Avatar className="size-16">
          <AvatarImage className="object-cover" src={user.avatar} alt={user.name} loading="lazy" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-bold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent className="px-4 flex-grow mt-1">
        {user.pets && user.pets.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-600 mb-2">Thú cưng:</p>
            <div className="flex items-center flex-wrap gap-2">
              {user.pets.map(pet => (
                <div key={pet.id} className="flex items-center gap-2 bg-[#F5F3F0] rounded-full px-3 py-1.5 pl-1">
                  <Avatar className="size-5">
                    <AvatarImage className="object-cover" src={pet.avatar_url || pet.avatar} alt={pet.name} loading="lazy" />
                    <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{pet.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-gray-100 py-2 rounded-lg grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-semibold text-[16px]">{user.posts}</div>
            <div className="text-muted-foreground text-sm">Bài viết</div>
          </div>
          <div>
            <div className="font-semibold text-[16px]">{user.followers}</div>
            <div className="text-muted-foreground text-sm">Người theo dõi</div>
          </div>
          <div>
            <div className="font-semibold text-[16px]">{user.following}</div>
            <div className="text-muted-foreground text-sm">Đang theo dõi</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 rounded-full font-semibold"
          onClick={() => onViewProfile(user.id)}
        >
          Xem trang cá nhân
        </Button>
        <Button
          variant={isFollowing ? "outline" : "default"}
          className={`rounded-full flex-1 font-medium ${isFollowing ? "text-[#91114D] hover:text-[#91114D] hover:bg-gray-100" : "bg-[#91114D] hover:bg-[#91114D]/80"}`}
          onClick={() => onFollowToggle(user.id, userType)}
        >
          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </Button>
      </CardFooter>
    </Card>
  );
});

UserCard.displayName = 'UserCard';

export default function FollowingPage() {
  const { user: currentUser } = useContext(AuthContext);
  
  // Consolidated state
  const [users, setUsers] = useState({
    featured: [],
    peopleYouMayKnow: [],
    followers: [],
    following: []
  });

  const [counts, setCounts] = useState({
    followers: 0,
    following: 0
  });

  const [search, setSearch] = useState({
    followers: '',
    following: ''
  });

  const [loading, setLoading] = useState({
    featured: true, // Start with true for initial load
    peopleYouMayKnow: true, // Start with true for initial load
    followers: false,
    following: false
  });

  const [activeTab, setActiveTab] = useState('suggestions');
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  const userId = currentUser?._id || currentUser?.id;

  // Load initial data
  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      if (!userId || !mounted) return;
      
      try {
        // Single API call to get all initial data
        const response = await getInitialSuggestionsData(3, 6);
        
        if (!mounted) return;
        
        if (response.success) {
          const data = response.data;
          
          // Update all state at once
          setCounts({
            followers: data.followers_count || 0,
            following: data.following_count || 0
          });
          
          setUsers({
            featured: (data.prominent_users || []).map(normalizeUserData),
            peopleYouMayKnow: (data.people_you_may_know || []).map(normalizeUserData),
            followers: [],
            following: []
          });
          
          setLoading({
            featured: false,
            peopleYouMayKnow: false,
            followers: false,
            following: false
          });
        }
        
        if (mounted) {
          setHasLoadedInitial(true);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        if (mounted) {
          setLoading({
            featured: false,
            peopleYouMayKnow: false,
            followers: false,
            following: false
          });
          setHasLoadedInitial(true);
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      mounted = false;
    };
  }, [userId]);



  // Load followers
  const loadFollowers = useCallback(async () => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, followers: true }));
    try {
      const response = await getFollowers(userId, 20);
      if (response.success) {
        const normalizedFollowers = response.data.map(normalizeUserData);
        setUsers(prev => ({ ...prev, followers: normalizedFollowers }));
        setCounts(prev => ({ ...prev, followers: normalizedFollowers.length }));
      }
    } catch (error) {
      console.error('Error loading followers:', error);
      toast.error('Không thể tải danh sách người theo dõi');
    } finally {
      setLoading(prev => ({ ...prev, followers: false }));
    }
  }, [userId]);

  // Load following
  const loadFollowing = useCallback(async () => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, following: true }));
    try {
      const response = await getFollowing(userId, 20);
      if (response.success) {
        const normalizedFollowing = response.data.map(user => ({
          ...normalizeUserData(user),
          is_followed: user.is_followed !== undefined ? user.is_followed : true
        }));
        setUsers(prev => ({ ...prev, following: normalizedFollowing }));
        setCounts(prev => ({ ...prev, following: normalizedFollowing.length }));
      }
    } catch (error) {
      console.error('Error loading following:', error);
      toast.error('Không thể tải danh sách đang theo dõi');
    } finally {
      setLoading(prev => ({ ...prev, following: false }));
    }
  }, [userId]);

  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    
    // Load data based on tab if not already loaded
    if (tab === 'followers' && users.followers.length === 0) {
      loadFollowers();
    } else if (tab === 'following' && users.following.length === 0) {
      loadFollowing();
    }
  }, [users.followers.length, users.following.length, loadFollowers, loadFollowing]);

  // Handle follow toggle
  const handleFollowToggle = useCallback(async (targetUserId, userType) => {
    // Optimistic update for better UX
    const updateUserInList = (usersList, isFollowing) => 
      usersList.map(user => 
        user.id === targetUserId 
          ? { ...user, is_followed: isFollowing }
          : user
      );
    
    // Determine current follow state
    let currentFollowState = false;
    if (userType === 'followers') {
      const user = users.followers.find(u => u.id === targetUserId);
      currentFollowState = user?.is_followed || false;
    } else if (userType === 'following') {
      const user = users.following.find(u => u.id === targetUserId);
      currentFollowState = user?.is_followed || false;
    } else {
      const user = users.featured.find(u => u.id === targetUserId) || 
                   users.peopleYouMayKnow.find(u => u.id === targetUserId);
      currentFollowState = user?.is_followed || false;
    }
    
    const newFollowState = !currentFollowState;
    
    // Optimistic update
    if (userType === 'followers') {
      setUsers(prev => ({ ...prev, followers: updateUserInList(prev.followers, newFollowState) }));
      setCounts(prev => ({
        ...prev,
        following: newFollowState ? prev.following + 1 : Math.max(0, prev.following - 1)
      }));
    } else if (userType === 'following') {
      setUsers(prev => ({ ...prev, following: updateUserInList(prev.following, newFollowState) }));
    } else {
      setUsers(prev => ({
        ...prev,
        featured: updateUserInList(prev.featured, newFollowState),
        peopleYouMayKnow: updateUserInList(prev.peopleYouMayKnow, newFollowState)
      }));
      setCounts(prev => ({
        ...prev,
        following: newFollowState ? prev.following + 1 : Math.max(0, prev.following - 1)
      }));
    }
    
    try {
      const response = await toggleFollow(targetUserId);
      
      if (response.success) {
        const isNowFollowing = response.data.followed;
        
        // Update state based on actual response
        if (userType === 'following' && !isNowFollowing) {
          setUsers(prev => {
            const filtered = prev.following.filter(user => user.id !== targetUserId);
            setCounts(prevCounts => ({ ...prevCounts, following: filtered.length }));
            return { ...prev, following: filtered };
          });
        }
        
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Không thể cập nhật trạng thái theo dõi');
      
      // Revert optimistic update on error
      if (userType === 'followers') {
        setUsers(prev => ({ ...prev, followers: updateUserInList(prev.followers, currentFollowState) }));
        setCounts(prev => ({
          ...prev,
          following: currentFollowState ? prev.following + 1 : Math.max(0, prev.following - 1)
        }));
      } else if (userType === 'following') {
        setUsers(prev => ({ ...prev, following: updateUserInList(prev.following, currentFollowState) }));
      } else {
        setUsers(prev => ({
          ...prev,
          featured: updateUserInList(prev.featured, currentFollowState),
          peopleYouMayKnow: updateUserInList(prev.peopleYouMayKnow, currentFollowState)
        }));
        setCounts(prev => ({
          ...prev,
          following: currentFollowState ? prev.following + 1 : Math.max(0, prev.following - 1)
        }));
      }
    }
  }, [users.followers, users.following, users.featured, users.peopleYouMayKnow]);

  // Handle view profile
  const navigate = useNavigate();
  const handleViewProfile = useCallback((targetUserId) => {
    navigate(`/profile/${targetUserId}`);
  }, [navigate]);

  // Memoized filtered lists with optimized search
  const filteredFollowers = useMemo(() => {
    const searchTerm = search.followers.trim().toLowerCase();
    if (!searchTerm) return users.followers;
    return users.followers.filter(user =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }, [users.followers, search.followers]);

  const filteredFollowing = useMemo(() => {
    const searchTerm = search.following.trim().toLowerCase();
    if (!searchTerm) return users.following;
    return users.following.filter(user =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }, [users.following, search.following]);



  return (
    <div className='bg-[#f5f3f0] min-h-screen py-8'>
      <div className='w-full px-32'>
        <div className="flex items-center justify-between">
          <div className="mb-4">
            <h1 className="text-4xl font-black mb-2 page-header">Mọi người</h1>
            <p className="text-gray-600">Khám phá những người bạn xung quanh, những người bạn theo dõi và những người theo dõi bạn.</p>
          </div>
          <img src={People} alt="Logo" className="h-15" />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-[#E6E4E0]">
              <TabsTrigger value="suggestions" className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white">
                Đề xuất cho bạn
              </TabsTrigger>
              <TabsTrigger value="followers" className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white">
                Người theo dõi <span className='!text-xs px-2 pb-0.5 py-0.25 bg-[#c1286f] text-white rounded-full'>{counts.followers}</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white">
                Đang theo dõi <span className='!text-xs px-2 pb-0.5 py-0.25 bg-[#c1286f] text-white rounded-full'>{counts.following}</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === 'followers' && (
              <Input
                placeholder="Tìm kiếm người dùng"
                value={search.followers}
                onChange={(e) => setSearch(prev => ({ ...prev, followers: e.target.value }))}
                className="max-w-sm rounded-lg bg-white"
              />
            )}
            {activeTab === 'following' && (
              <Input
                placeholder="Tìm kiếm người dùng"
                value={search.following}
                onChange={(e) => setSearch(prev => ({ ...prev, following: e.target.value }))}
                className="max-w-sm bg-white"
              />
            )}
          </div>

          <TabsContent value="suggestions" className="mt-0">
            {/* Featured Users */}
            <div className="mb-8 w-full">
              <div className="flex gap-2">
                <HiStar className="h-7 w-7 text-yellow-500" />
                <h2 className="text-2xl page-header mb-3">Người dùng nổi bật</h2>
              </div>

              {loading.featured ? (
                <LoadingSkeleton />
              ) : users.featured.length > 0 ? (
                <div className='grid grid-cols-3 gap-4'>
                  {users.featured.map((user) => (
                    <UserCard 
                      key={`featured-${user.id}`} 
                      user={user} 
                      userType="suggestions"
                      onFollowToggle={handleFollowToggle}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
                </div>
              ) : hasLoadedInitial ? (
                <EmptyState searchTerm="" />
              ) : null}
            </div>

            {/* People You May Know */}
            <div>
              <div className="flex gap-2">
                <AiFillLike className="h-7 w-7 text-green-700" />
                <h2 className="text-2xl page-header mb-3">Có thể bạn quen</h2>
              </div>
              {loading.peopleYouMayKnow ? (
                <div className='space-y-4'>
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                </div>
              ) : users.peopleYouMayKnow.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {users.peopleYouMayKnow.map((user) => (
                    <UserCard 
                      key={`pymk-${user.id}`} 
                      user={user} 
                      userType="suggestions"
                      onFollowToggle={handleFollowToggle}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
                </div>
              ) : hasLoadedInitial ? (
                <EmptyState searchTerm="" />
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="followers" className="mt-0">
            {loading.followers ? (
              <div className='space-y-4'>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </div>
            ) : filteredFollowers.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredFollowers.map((user) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    userType="followers"
                    onFollowToggle={handleFollowToggle}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            ) : (
              <EmptyState searchTerm={search.followers} />
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            {loading.following ? (
              <div className='space-y-4'>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </div>
            ) : filteredFollowing.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredFollowing.map((user) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    userType="following"
                    onFollowToggle={handleFollowToggle}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            ) : (
              <EmptyState searchTerm={search.following} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}