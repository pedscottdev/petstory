import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { HiBadgeCheck } from 'react-icons/hi';
import ProfileCover from "../../../../../public/images/profile-cover.jpg";
import defaultAvatar from "../../../../../public/images/special-avatar.png";
import NoPostsImage from '../../../../../public/images/no-posts.svg';
import { getUserProfile } from '@/api/userApi';
import { getImageUrl, getAvatarUrl } from '@/utils/imageUtils';

export default function AdminViewProfilePage() {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  // ============ State Management ============
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============ Helper Functions ============
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Vừa xong';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Vừa xong';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;

    const years = Math.floor(months / 12);
    return `${years} năm trước`;
  };

  const transformPostsData = (rawPosts) => {
    return rawPosts.map(post => {
      const author = post.author || {};
      const firstName = author.first_name || '';
      const lastName = author.last_name || '';

      const fullName =
        firstName || lastName
          ? (lastName + ' ' + firstName).trim()
          : 'Unknown';

      const avatar = getAvatarUrl(author.avatar_url, fullName);

      const multimedia = Array.isArray(post.multimedia) ? post.multimedia : [];
      const images = multimedia
        .filter(m => (m.media_type === 'image' || m.type === 'image'))
        .map(m => getImageUrl(m.media_url || m.file_url));

      const likesCount =
        post.likes_count != null
          ? Number(post.likes_count)
          : Array.isArray(post.likes)
            ? post.likes.length
            : 0;

      const commentsCount =
        post.comments_count != null ? Number(post.comments_count) : 0;

      return {
        id: post.id || post._id,
        user: {
          id: author.id || author._id,
          name: fullName,
          avatar: avatar,
        },
        time: formatTimeAgo(post.created_at),
        content: post.content || '',
        pets: post.taggedPets || post.tagged_pets || [],
        likes: likesCount,
        comments: post.comment_counts ?? commentsCount,
        images: images,
        image: images.length > 0 ? images[0] : null,
      };
    });
  };

  // ============ Fetch User Profile ============
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsPageLoading(true);
        setError(null);

        const response = await getUserProfile(userId);
        const profileData = response.data;

        if (!profileData.success) {
          setError('Không thể tải thông tin người dùng');
          return;
        }

        const userData = profileData.data?.user || profileData.user || {};

        setUser({
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.last_name || ''} ${userData.first_name || ''}`.trim(),
          avatar: userData.avatar_url || defaultAvatar,
          email: userData.email,
          bio: userData.bio || '',
          posts: profileData.data?.posts_pagination?.total || profileData.posts_pagination?.total || 0,
          followers: profileData.data?.followers_count || profileData.followers_count || 0,
          following: profileData.data?.following_count || profileData.following_count || 0,
          is_active: userData.is_active ?? true,
        });

        const userPets = userData.pets || [];
        setPets(userPets);

        const rawPosts = profileData.data?.posts || profileData.posts || [];
        const transformedPosts = transformPostsData(rawPosts);
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Không thể tải thông tin người dùng');
        toast.error('Lỗi: Không thể tải thông tin người dùng');
      } finally {
        setIsPageLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </div>

      {/* Top profile cover */}
      <div className="h-48 bg-cover bg-center object-cover" style={{ backgroundImage: `url(${ProfileCover})` }}>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-24">
        {/* User Profile Card */}
        <Card className="gap-y-3 mb-6 bg-white border-[#e1d6ca] pt-0 px-8 shadow-none rounded-4xl">
          <CardHeader className="flex flex-col md:flex-row gap-6 items-center pt-6">
            <div className="flex w-full gap-x-12">
              {/* Avatar */}
              <div className="relative">
                {isPageLoading ? (
                  <Skeleton className="h-36 w-36 rounded-full" />
                ) : user ? (
                  <Avatar className="h-36 w-36 border-4 border-white">
                    <AvatarImage src={getImageUrl(user.avatar)} alt={user.first_name} className="object-cover" />
                    <AvatarFallback className="object-cover text-2xl bg-[#91114D] text-white">
                      {user.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-36 w-36 rounded-full bg-gray-300 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex flex-col justify-between mb-4 flex-1">
                {isPageLoading ? (
                  <>
                    <div className="mb-6">
                      <Skeleton className="h-8 w-64 mb-2" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex gap-12 my-4">
                      <div className='flex flex-col'>
                        <Skeleton className="h-6 w-12 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className='flex flex-col'>
                        <Skeleton className="h-6 w-12 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className='flex flex-col'>
                        <Skeleton className="h-6 w-12 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </>
                ) : user ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold">{user.full_name || "Người dùng không xác định"}</h1>
                        <HiBadgeCheck className="text-[#1959d8] text-2xl" />
                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {user.is_active ? 'Hoạt động' : 'Bị chặn'}
                        </span>
                      </div>
                      <p className="text-base text-gray-600">{user.email || "Email chưa xác định"}</p>
                    </div>

                    <div className="flex gap-10 my-3">
                      <div className='flex flex-col'>
                        <span className="font-bold text-left text-lg">{user.posts}</span>
                        <span className='text-gray-600 text-sm'>Bài viết</span>
                      </div>
                      <div className='flex flex-col'>
                        <span className="font-bold text-left text-lg">{user.followers}</span>
                        <span className='text-gray-600 text-sm'>Người theo dõi</span>
                      </div>
                      <div className='flex flex-col'>
                        <span className="font-bold text-left text-lg">{user.following}</span>
                        <span className='text-gray-600 text-sm'>Đang theo dõi</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm">{user.bio || "Chưa có thông tin"}</p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">Không thể tải thông tin người dùng</p>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Pets Section */}
          <CardContent className="px-0 pb-6">
            <h2 className="font-bold text-lg mb-3">Thú cưng</h2>
            <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-2">
              {isPageLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-start bg-[#F6F1EB] p-4 rounded-xl">
                    <div className="flex items-center gap-x-1 w-full mb-2">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex flex-col ml-2 flex-1">
                        <Skeleton className="h-5 w-20 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))
              ) : pets.length > 0 ? (
                pets.map((pet) => (
                  <div key={pet.id || pet._id} className="flex flex-col items-start bg-[#F6F1EB] p-4 rounded-xl min-w-[100px]">
                    <div className="flex items-center gap-x-1 w-full">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getImageUrl(pet.avatar_url)} alt={pet.name} className="object-cover rounded-full" />
                        <AvatarFallback className="object-cover bg-[#E6DDD5] text-[#91114D]">{pet.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col ml-2">
                        <p className="font-bold text-[15px]">{pet.name}</p>
                        <p className="text-xs text-gray-600">{pet.breed || 'Chưa xác định'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-4 text-gray-500">
                  Chưa có thú cưng nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Bài viết</h2>

          {isPageLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <Card key={post.id} className="p-4 bg-white">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.user.avatar} alt={post.user.name} />
                      <AvatarFallback className="bg-[#91114D] text-white">{post.user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.user.name}</p>
                      <p className="text-xs text-gray-500">{post.time}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-[15px] whitespace-pre-line mb-3">{post.content}</p>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="mt-3">
                      {post.images.length === 1 ? (
                        <div className="relative">
                          <img
                            src={post.images[0]}
                            alt="Post content"
                            className="w-full rounded-lg object-cover max-h-96"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.slice(0, 4).map((image, index) => (
                            <div key={index} className="aspect-square overflow-hidden rounded-lg">
                              <img
                                src={image}
                                alt={`Post content ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center gap-6 pt-3 mt-3 border-t text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-red-500">❤️</span>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 pb-12 text-gray-500">
              <img src={NoPostsImage} alt="No Post" className="mx-auto h-48 mb-2" />
              <p>Không có bài viết nào để hiển thị.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}