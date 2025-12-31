import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Plus,
  Edit,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PostCreation from '@/components/user/newfeed/PostCreation';
import PostItem from '@/components/user/newfeed/PostItem';
import { FloatingCreateButton, PostSkeleton } from '@/components/user/newfeed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getGroupById,
  addGroupMember,
  removeGroupMember,
  updateGroup as updateGroupApi
} from '@/api/groupApi';
import ButtonLoader from '@/components/ui/ButtonLoader';
import { getGroupAvatarUrl, getImageUrl, getAvatarUrl } from '@/utils/imageUtils';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const floatingButtonRef = useRef(null);

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Group data state
  const [groupData, setGroupData] = useState(null);

  // Members data
  const [members, setMembers] = useState([]);

  // State for membership status
  const [isMember, setIsMember] = useState(false);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [isLeaveLoading, setIsLeaveLoading] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState('member');

  // State for member dialog
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedGroup, setEditedGroup] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const editAvatarInputRef = useRef(null);

  // Filtered members based on search term
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Posts data
  const [posts, setPosts] = useState([]);

  // User pets data for post creation
  const [userPets, setUserPets] = useState([]);

  // Transform posts data helper function - similar to NewfeedPage
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

      // Get likes count from likes_count field (from backend) or fallback to likes array
      const likesCount =
        post.likes_count != null
          ? Number(post.likes_count)
          : Array.isArray(post.likes)
            ? post.likes.length
            : 0;

      // Get comments count from comment_counts field (from backend)
      const commentsCount =
        post.comment_counts != null
          ? Number(post.comment_counts)
          : 0;

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
        comments: commentsCount,
        comments_count: commentsCount,
        images: images,
        image: images.length > 0 ? images[0] : null,
        is_liked: post.is_liked || false,
      };
    });
  };

  // Format time ago helper function - similar to NewfeedPage
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

  const handlePostCreated = (createdPost) => {
    // Transform and add the new post to the posts list
    if (createdPost) {
      const transformedPost = transformPostsData([createdPost])[0];
      if (transformedPost) {
        setPosts(prevPosts => [transformedPost, ...prevPosts]);

        // Update group post count
        setGroupData(prev => prev ? { ...prev, posts: (prev.posts || 0) + 1 } : prev);
      }
    }
  };

  // Handle post updated (e.g., likes, content changes)
  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPost.id ? { ...post, ...updatedPost } : post
      )
    );
  };

  // Handle post deleted
  const handlePostDeleted = (postId) => {
    // Remove deleted post from posts list
    setPosts(prevPosts =>
      prevPosts.filter(p => p.id !== postId && p._id !== postId)
    );

    // Update group post count
    setGroupData(prev => prev ? { ...prev, posts: Math.max((prev.posts || 0) - 1, 0) } : prev);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  // Handle join group
  const handleJoinGroup = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tham gia nhóm');
      return;
    }

    setIsJoinLoading(true);
    try {
      const response = await addGroupMember(id, user.id);
      if (response.success || response.data?.success) {
        setIsMember(true);
        toast.success('Đã tham gia nhóm thành công');
        // Reload group data
        await loadGroupData();
      } else {
        toast.error(response.message || 'Không thể tham gia nhóm');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tham gia nhóm');
    } finally {
      setIsJoinLoading(false);
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    if (!user) return;

    setIsLeaveLoading(true);
    try {
      const response = await removeGroupMember(id, user.id);
      if (response.success || response.data?.success) {
        setIsMember(false);
        setIsLeaveDialogOpen(false);
        toast.success('Đã rời nhóm thành công');
        // Reload group data
        await loadGroupData();
      } else {
        toast.error(response.message || 'Không thể rời nhóm');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi rời nhóm');
    } finally {
      setIsLeaveLoading(false);
    }
  };

  // Handle avatar upload for editing group
  const handleEditAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validate file type - only allow png, jpg, jpeg
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh có định dạng .png, .jpg, .jpeg');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }

      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input for editing group
  const triggerEditAvatarInput = () => {
    if (editAvatarInputRef.current) editAvatarInputRef.current.click();
  };

  // Remove avatar for editing group
  const removeEditAvatar = () => {
    setEditAvatarPreview(null);
    setEditAvatarFile(null);
  };

  // Handle update group form submission
  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editedGroup) return;

    // Set loading state
    setIsEditLoading(true);

    // Validate name (required)
    if (!editedGroup.name || editedGroup.name.trim() === '') {
      toast.error('Tên nhóm là bắt buộc');
      setIsEditLoading(false);
      return;
    }

    // Validate description (required)
    if (!editedGroup.description || editedGroup.description.trim() === '') {
      toast.error('Mô tả là bắt buộc');
      setIsEditLoading(false);
      return;
    }

    try {
      const groupData = {
        name: editedGroup.name,
        description: editedGroup.description,
        category: editedGroup.category,
      };

      if (editAvatarFile) {
        groupData.avatar = editAvatarFile;
      }

      const response = await updateGroupApi(id, groupData);
      const isSuccess = response.success || response.data?.success;

      if (isSuccess) {
        setIsEditDialogOpen(false);
        setEditAvatarPreview(null);
        setEditAvatarFile(null);
        toast.success('Đã cập nhật thông tin nhóm thành công');
        // Reload group data
        await loadGroupData();
      } else {
        toast.error(response.message || 'Không thể cập nhật nhóm');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhóm');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Open edit dialog with current group data
  const openEditDialog = () => {
    if (!groupData) return;
    setEditedGroup({ ...groupData });
    setEditAvatarPreview(groupData.avatar || groupData.coverImage);
    setIsEditDialogOpen(true);
  };

  // Load group data
  const loadGroupData = async () => {
    if (!id || !user) return;

    setIsLoading(true);
    try {
      // Fetch all group details with a single API call
      const groupResponse = await getGroupById(id);
      const responseData = groupResponse.data?.data || groupResponse.data;

      if (responseData) {
        // Extract group data
        const groupDataFromApi = responseData.group;

        if (groupDataFromApi) {
          const transformedGroup = {
            id: groupDataFromApi.id || groupDataFromApi._id,
            name: groupDataFromApi.name,
            description: groupDataFromApi.description || '',
            members: groupDataFromApi.member_count || 0,
            posts: groupDataFromApi.post_count || 0,
            category: groupDataFromApi.category || 'all',
            avatar: getGroupAvatarUrl(groupDataFromApi.avatarUrl),
            coverImage: getGroupAvatarUrl(groupDataFromApi.avatarUrl),
            creator_id: groupDataFromApi.creator_id,
          };
          setGroupData(transformedGroup);

          // Extract and set members data
          const membersData = responseData.members || [];
          const transformedMembers = membersData.map(member => ({
            id: member.id,
            name: member.fullname || member.name || 'Unknown',
            avatar: member.avatar_url || member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullname || 'User')}`,
            role: member.role === 'admin' ? 'Quản trị viên' : 'Thành viên',
            email: member.email || ''
          }));
          setMembers(transformedMembers);

          // Set membership status and user role
          const isMemberStatus = responseData.is_member || false;
          const userRoleFromApi = responseData.user_role || 'member';
          setIsMember(isMemberStatus);
          setUserRole(userRoleFromApi);

          // Extract and set posts data - use the same transformation as NewfeedPage
          const postsData = responseData.posts?.data || responseData.posts || [];
          const transformedPosts = transformPostsData(postsData);
          setPosts(transformedPosts);

          // Extract and set user pets data for post creation
          const userPetsData = responseData.user_pets || [];
          setUserPets(userPetsData);
        }
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      toast.error('Không thể tải thông tin nhóm');
      navigate('/groups');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or id/user changes
  useEffect(() => {
    loadGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleOpenCreateDialog = () => {
    if (floatingButtonRef.current) {
      floatingButtonRef.current.openDialog();
    }
  };

  // Skeleton loading component for group header
  const GroupHeaderSkeleton = () => (
    <div className="relative bg-white mx-48 rounded-xl border border-gray-300">
      {/* Cover Image Skeleton */}
      <div className="h-56 rounded-t-xl">
        <Skeleton className="w-full h-full rounded-t-xl bg-gray-300" />
      </div>

      {/* Group Info Skeleton */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between -mt-24 md:-mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
            <div className="pt-20">
              <Skeleton className="h-8 w-64 mb-2 bg-gray-300" />
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Skeleton className="h-4 w-24 bg-gray-300" />
                <Skeleton className="h-4 w-24 bg-gray-300" />
                <Skeleton className="h-6 w-16 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-32 rounded-full bg-gray-300" />
            <Skeleton className="h-10 w-32 rounded-full bg-gray-300" />
            <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );

  // Skeleton loading component for group content
  const GroupContentSkeleton = () => (
    <div className="w-full px-48 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Group Info Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          {/* About Card Skeleton */}
          <Card className="rounded-xl border border-gray-300 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-300" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 bg-gray-300" />
              <Skeleton className="h-4 w-4/5 mb-4 bg-gray-300" />

              <div className="space-y-3">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 bg-gray-300" />
                  <Skeleton className="h-4 w-24 bg-gray-300" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 bg-gray-300" />
                  <Skeleton className="h-4 w-20 bg-gray-300" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 bg-gray-300" />
                  <Skeleton className="h-4 w-32 bg-gray-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Preview Skeleton */}
          <Card className="rounded-xl border border-gray-300 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-300" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1 bg-gray-300" />
                        <Skeleton className="h-3 w-16 bg-gray-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Posts Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post Creation Skeleton */}
          <Card className="shadow-none rounded-xl border border-gray-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
                <Skeleton className="h-10 flex-1 rounded-full bg-gray-300" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24 rounded bg-gray-300" />
                <Skeleton className="h-8 w-24 rounded bg-gray-300" />
                <Skeleton className="h-8 w-24 rounded bg-gray-300" />
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed Skeleton */}
          <div>
            {[1, 2].map((item) => (
              <PostSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className=' bg-[#f5f3f0] min-h-screen pt-6 mx-auto'>
      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={'page-header text-[22px]'}>Xác nhận rời nhóm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời nhóm "<b>{groupData?.name}</b>" không? Sau khi rời nhóm sẽ không thể đăng bài viết trong nhóm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={isLeaveLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full"
              onClick={handleLeaveGroup}
              disabled={isLeaveLoading}
            >
              {isLeaveLoading ? (
                <div className="flex items-center">
                  <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                  <span>Đang thực hiện</span>
                </div>
              ) : 'Rời nhóm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditedGroup(null);
          setEditAvatarPreview(null);
          setEditAvatarFile(null);
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className={'page-header text-[22px]'}>Cập nhật thông tin nhóm</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateGroup}>
            <div className="grid gap-4 py-4">
              {/* Avatar Upload Section */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-avatar" className="text-right">
                  Ảnh đại diện
                </Label>
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="h-16 w-16 rounded overflow-hidden">
                    {editAvatarPreview || editedGroup?.avatar ? (
                      <img
                        src={editAvatarPreview || editedGroup?.avatar}
                        alt="avatar"
                        className="h-16 w-16 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/default-image.png';
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-400">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input ref={editAvatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditAvatarUpload} />
                    <Button type="button" variant="outline" onClick={triggerEditAvatarInput}>Tải ảnh</Button>
                    {(editAvatarPreview || editedGroup?.avatar) && (
                      <Button type="button" variant="ghost" onClick={removeEditAvatar}>Xóa</Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Tên nhóm</Label>
                <Input
                  id="edit-name"
                  value={editedGroup?.name || ''}
                  onChange={(e) => setEditedGroup(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Mô tả
                </Label>
                <Textarea
                  id="edit-description"
                  value={editedGroup?.description || ''}
                  onChange={(e) => setEditedGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả nhóm"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Danh mục</Label>
                <Select value={editedGroup?.category || 'dog'} onValueChange={(value) => setEditedGroup(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="!w-full !col-span-3">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dành cho chó</SelectItem>
                    <SelectItem value="cat">Dành cho mèo</SelectItem>
                    <SelectItem value="bird">Dành cho chim</SelectItem>
                    <SelectItem value="all">Nhóm chung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditedGroup(null);
                  setEditAvatarPreview(null);
                  setEditAvatarFile(null);
                }}
                disabled={isEditLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isEditLoading}>
                {isEditLoading ? (
                  <div className="flex items-center">
                    <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                    <span>Đang thực hiện</span>
                  </div>
                ) : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Danh sách thành viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tìm kiếm thành viên..."
              value={memberSearchTerm}
              onChange={(e) => setMemberSearchTerm(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-96 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={getImageUrl(member.avatar)} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email || 'email@example.com'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/profile/${member.id}`)}
                    >
                      Xem trang cá nhân
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">Không tìm thấy thành viên</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show skeleton while loading */}
      {isLoading ? (
        <>
          <GroupHeaderSkeleton />
          <GroupContentSkeleton />
        </>
      ) : (
        <>
          {groupData ? (
            <>
              {/* Group Header */}
              <div className="relative bg-white mx-48 rounded-xl border border-gray-300">
                {/* Cover Image */}
                <div className="h-56 rounded-t-xl">
                  <img
                    src={groupData.coverImage}
                    alt={groupData.name}
                    className="w-full h-full object-cover rounded-t-xl"
                    onError={(e) => {
                      e.currentTarget.src = '/images/default-image.png';
                    }}
                  />
                </div>

                {/* Back Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-8 -left-8 bg-white backdrop-blur-sm rounded-full active:scale-90  transition-all duration-200 border-gray-300 border size-16"
                  onClick={handleBackClick}
                >
                  <ArrowLeft className="!h-7 !w-7" />
                </Button>

                {/* Category Label */}
                <div className="absolute top-6 right-6 bg-white rounded-full active:scale-90  px-4 py-1 opacity-90">
                  <span className="text-sm font-semibold text-[#91114D]">
                    {groupData.category === 'dog' ? 'Dành cho chó' :
                      groupData.category === 'cat' ? 'Dành cho mèo' :
                        groupData.category === 'bird' ? 'Dành cho chim' : 'Nhóm chung'}
                  </span>
                </div>

                {/* Group Info */}
                <div className="max-w-7xl mx-auto px-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between -mt-24 md:-mt-16 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">

                      <div className="pt-20">
                        <h1 className="text-2xl md:text-3xl font-bold ">{groupData.name}</h1>
                        <div className="flex flex-wrap items-center mt-2 text-sm">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{groupData.members} thành viên</span>
                          </div>
                          <div className="h-1 w-1 rounded-full bg-gray-400 mx-3"></div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{groupData.posts} bài viết</span>
                          </div>
                          {isMember && (
                            <>
                              <div className="h-1 w-1 rounded-full bg-gray-400 mx-3"></div>
                              <div className="bg-white/20 font-medium py-1 rounded-full">
                                {groupData.creator_id === user?.id || userRole === 'admin' ? 'Bạn là Quản trị viên' : 'Bạn là thành viên'}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-6">
                      {(groupData.creator_id === user?.id || userRole === 'admin') && (
                        <Button variant="outline" className="bg-white/80 backdrop-blur-sm rounded-full" onClick={openEditDialog}>
                          <Edit className="h-4 w-4" />
                          Cập nhật thông tin
                        </Button>
                      )}
                      {isMember ? (
                        <Button
                          variant="outline"
                          className="bg-white/80 backdrop-blur-sm rounded-full"
                          onClick={() => setIsLeaveDialogOpen(true)}
                          disabled={isLeaveLoading}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {isLeaveLoading ? (
                            <div className="flex items-center">
                              <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                              <span>Đang thực hiện</span>
                            </div>
                          ) : 'Rời nhóm'}
                        </Button>
                      ) : (
                        <Button
                          className="bg-[#91114D] hover:bg-[#7a0e41] rounded-full"
                          onClick={handleJoinGroup}
                          disabled={isJoinLoading}
                        >
                          {isJoinLoading ? (
                            <div className="flex items-center">
                              <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                              <span>Đang thực hiện</span>
                            </div>
                          ) : 'Tham gia nhóm'}
                        </Button>
                      )}
                      <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full px-48 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column - Group Info */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* About Card */}
                    <Card className={"gap-y-3 rounded-xl border border-gray-300 shadow-none"}>
                      <CardHeader>
                        <CardTitle className={'!text-lg font-bold leading-none'}>
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
                            <span>petstory.vn</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Members Preview */}
                    <Card className={"rounded-xl border gap-y-3 border-gray-300 shadow-none"}>
                      <CardHeader className={''}>
                        <CardTitle className={'text-lg font-bold leading-none'}>Thành viên ({groupData.members})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Sort members to show administrators first, then limit to 6 */}
                          {[...members]
                            .sort((a, b) => {
                              if (a.role === "Quản trị viên" && b.role !== "Quản trị viên") return -1;
                              if (a.role !== "Quản trị viên" && b.role === "Quản trị viên") return 1;
                              return 0;
                            })
                            .slice(0, 6)
                            .map((member) => (
                              <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage src={getImageUrl(member.avatar)} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-[15px]">{member.name}</p>
                                    <p className={`!text-xs ${member.role === "Quản trị viên" ? "text-[#91114D]" : "text-gray-600"}`}>{member.role}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {/* View all members button */}
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              className="w-full rounded-full"
                              onClick={() => setIsMemberDialogOpen(true)}
                            >
                              Xem tất cả
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Middle Column - Posts */}
                  <div className="lg:col-span-2 space-y-4 ">
                    {/* Post Creation - Only shown if user is a member */}
                    {isMember ? (
                      <PostCreation onOpenDialog={handleOpenCreateDialog} />
                    ) : (
                      <Card className="shadow-none rounded-xl border border-gray-300">
                        <CardContent className="p-6 py-3 text-center">
                          <p className="text-xl font-bold text-gray-700">Bạn chưa phải thành viên nhóm</p>
                          <p className="text-gray-700">Hãy tham gia nhóm để đăng bài trong nhóm</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Posts Feed - Using PostItem components */}
                    <div className="space-y-6">
                      {posts.length > 0 ? (
                        posts.map((post) => (
                          <PostItem key={post.id} post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} hideGroupName={true} />
                        ))) : (
                        <Card className="shadow-none rounded-xl border border-gray-300">
                          <CardContent className="p-12 text-center">
                            <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-xl font-bold text-gray-700 mb-2">Nhóm chưa có bài viết nào</p>
                            <p className="text-gray-700">Hãy tạo bài viết đầu tiên trong nhóm</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">Không tìm thấy nhóm</p>
            </div>
          )}
        </>
      )}
      {isMember && <FloatingCreateButton ref={floatingButtonRef} userData={{ pets: userPets }} groupId={id} onPostCreated={handlePostCreated} />}
    </div>
  );
}