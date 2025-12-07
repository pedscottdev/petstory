import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import PostCreation from '@/components/user/newfeed/PostCreation';
import { FloatingCreateButton, PostSkeleton } from '@/components/user/newfeed';
import PostItem from '@/components/user/newfeed/PostItem';
import PostFilter from '@/components/user/newfeed/PostFilter';
import ProfileCover from "../../../../../public/images/profile-cover.jpg";
import { Check, Eye, AlertCircle } from 'lucide-react';
import ButtonLoader from '@/components/ui/ButtonLoader';
import { BsCheckCircleFill } from 'react-icons/bs';
import { HiBadgeCheck } from 'react-icons/hi';
import { toast } from 'sonner';
import { Heart, Camera } from 'lucide-react';
import defaultAvatar from "../../../../../public/images/special-avatar.png";
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getFollowers, getFollowing, toggleFollow, updateUserProfile } from '@/api/userApi';
import { getUserPets, togglePetLike, getPetById, getPetLikeCount, updatePet } from '@/api/petApi';
import { getUserPosts, getUserPostsByPet } from '@/api/postApi';
import { useImageUpload } from '@/hooks/useImageUpload';
import { getImageUrl, getAvatarUrl } from '@/utils/imageUtils';
import NoPostsImage from '../../../../../public/images/no-posts.svg';

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const avatarInputRef = useRef(null);
  const floatingButtonRef = useRef(null);
  const isLoggedInUser = userId === authUser?.id || !userId;

  // ============ State Management ============
  // User data
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Loading states
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

  // Error states
  const [error, setError] = useState(null);
  const [followerError, setFollowerError] = useState(null);
  const [followingError, setFollowingError] = useState(null);

  // UI states
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [loadingFollowerId, setLoadingFollowerId] = useState(null);
  const [loadingFollowingId, setLoadingFollowingId] = useState(null);
  const [isPetDetailDialogOpen, setIsPetDetailDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activePetFilter, setActivePetFilter] = useState('all');
  const [isFollowerDialogOpen, setIsFollowerDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);
  const [followerSearchTerm, setFollowerSearchTerm] = useState('');
  const [followingSearchTerm, setFollowingSearchTerm] = useState('');

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [newAvatar, setNewAvatar] = useState(null);
  const [showAvatarControls, setShowAvatarControls] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Pet view states
  const [isLoadingPetDetail, setIsLoadingPetDetail] = useState(false);
  const [isEditPetDialogOpen, setIsEditPetDialogOpen] = useState(false);
  const [likeLoadingPetId, setLikeLoadingPetId] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [editingPetAvatarPreview, setEditingPetAvatarPreview] = useState(null);
  const [editingPetNewAvatar, setEditingPetNewAvatar] = useState(null);
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);
  const [petLikeCount, setPetLikeCount] = useState(0);

  // Profile update states
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    first_name: '',
    last_name: '',
    bio: ''
  });
  const [profileFormModified, setProfileFormModified] = useState(false);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Hook for image upload
  const { uploadUserAvatar, uploadPetAvatar } = useImageUpload();

  // Reference for pet avatar input
  const petAvatarInputRef = useRef(null);

  // ============ Helper Functions ============
  /**
   * Format time ago for posts
   */
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

  /**
   * Transform posts data to match PostItem component expectations
   */
  const transformPostsData = (rawPosts) => {
    return rawPosts.map(post => {
      const author = post.author || {};
      const firstName = author.first_name || '';
      const lastName = author.last_name || '';

      const fullName =
        firstName || lastName
          ? (lastName + ' ' + firstName).trim()
          : 'Unknown';

      // Use getAvatarUrl helper to properly handle avatar with fallback
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
        comments_count: post.comment_counts ?? commentsCount,
        images: images,
        image: images.length > 0 ? images[0] : null,
        is_liked: post.is_liked || false,
      };
    });
  };

  // ============ Computed Properties ============
  const filteredFollowers = followers.filter(follower =>
    follower?.name.toLowerCase().includes(followerSearchTerm.toLowerCase()) ||
    follower?.email.toLowerCase().includes(followerSearchTerm.toLowerCase())
  );

  const filteredFollowing = following.filter(followingUser =>
    followingUser.name.toLowerCase().includes(followingSearchTerm.toLowerCase()) ||
    followingUser.email.toLowerCase().includes(followingSearchTerm.toLowerCase())
  );

  // ============ API Functions ============
  /**
   * Fetch user profile, pets, and posts data from API (combined)
   */
  const fetchUserProfile = async (petId = null) => {
    try {
      setError(null);
      const response = await getUserProfile(userId || authUser?.id);
      console.log("User profile data:", response.data);

      const profileData = response.data;
      const userData = profileData.user || {};

      setUser({
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        full_name: `${userData.last_name} ${userData.first_name}`,
        avatar: userData.avatar_url || defaultAvatar,
        email: userData.email,
        bio: userData.bio || '',
        posts: profileData.posts_pagination?.total || 0,
        followers: profileData.followers_count || 0,
        following: profileData.following_count || 0,
      });

      // Set pets from response
      const userPets = userData.pets || [];
      setPets(userPets);

      // Transform posts data using the same format as newfeed
      const rawPosts = profileData.posts || [];
      const transformedPosts = transformPostsData(rawPosts);

      setPosts(transformedPosts);
      setFilteredPosts(transformedPosts);

      setAvatarPreview(userData.avatar_url || defaultAvatar);
      setIsFollowingUser(profileData.is_following || false);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Không thể tải thông tin người dùng');
      toast.error('Lỗi: Không thể tải thông tin người dùng');
    }
  };

  /**
   * Fetch user's pets from API
   */
  const fetchUserPets = async () => {
    try {
      const response = await getUserPets(userId || authUser?.id);
      setPets(response.data || []);
    } catch (err) {
      console.error('Failed to fetch pets:', err);
      // Don't show error if pets list is empty, it's normal
    }
  };

  /**
   * Fetch user's posts from API
   */
  const fetchUserPosts = async (petId = null) => {
    try {
      const response = petId
        ? await getUserPostsByPet(userId || authUser?.id, petId)
        : await getUserPosts(userId || authUser?.id);

      setPosts(response.data || []);
      setFilteredPosts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      // Don't show error if posts list is empty, it's normal
    }
  };

  /**
   * Fetch followers list from API
   */
  const fetchFollowers = async () => {
    try {
      setIsLoadingFollowers(true);
      setFollowerError(null);
      const response = await getFollowers(userId || authUser?.id);
      setFollowers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch followers:', err);
      setFollowerError('Không thể tải danh sách người theo dõi');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  /**
   * Fetch following list from API
   */
  const fetchFollowing = async () => {
    try {
      setIsLoadingFollowing(true);
      setFollowingError(null);
      const response = await getFollowing(userId || authUser?.id);
      setFollowing(response.data || []);
    } catch (err) {
      console.error('Failed to fetch following:', err);
      setFollowingError('Không thể tải danh sách đang theo dõi');
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  // ============ Effects ============
  /**
   * Fetch all profile data on component mount or when userId changes
   */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsPageLoading(true);
        // Now using combined API call that returns user, pets, and posts
        await fetchUserProfile();
      } finally {
        setIsPageLoading(false);
      }
    };

    if (userId || authUser?.id) {
      fetchAllData();
    }
  }, [userId, authUser?.id]);

  // ============ Event Handlers ============
  const handlePostCreated = () => {
    // Refresh profile data (which includes posts) when new post is created
    fetchUserProfile();
  };

  const handlePostDeleted = (postId) => {
    // Remove deleted post from filtered posts list
    setFilteredPosts(prevPosts =>
      prevPosts.filter(p => p.id !== postId && p._id !== postId)
    );

    // Remove deleted post from all posts list
    setPosts(prevPosts =>
      prevPosts.filter(p => p.id !== postId && p._id !== postId)
    );

    // Update user post count
    setUser(prevUser => ({
      ...prevUser,
      posts: Math.max(0, (prevUser?.posts || 0) - 1)
    }));
  };

  const handlePetFilter = async (petId) => {
    setIsFilterLoading(true);
    setActivePetFilter(petId);

    try {
      if (petId === 'all') {
        // Show all posts without filtering
        setFilteredPosts(posts);
      } else {
        // Fetch posts filtered by pet_id from API
        const response = await getUserPostsByPet(userId || authUser?.id, petId);
        const rawPosts = response.data?.data || [];
        const transformedPosts = transformPostsData(rawPosts);
        setFilteredPosts(transformedPosts);
      }
    } catch (err) {
      console.error('Error filtering posts:', err);
      toast.error('Lỗi khi lọc bài viết');
      // Fallback to showing all posts on error
      setFilteredPosts(posts);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setIsFollowingLoading(true);
      await toggleFollow(userId);
      setIsFollowingUser(!isFollowingUser);

      // Refresh user profile to get updated follower/following counts
      // The combined API will return updated counts
      await fetchUserProfile();

      toast.success(!isFollowingUser ? 'Đã theo dõi' : 'Đã hủy theo dõi');
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      toast.error('Lỗi khi theo dõi người dùng');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleNavigateToChats = () => {
    navigate('/chats');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error('Chỉ chấp nhận file ảnh');
        return;
      }

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

  const handleRemoveAvatar = () => {
    setAvatarPreview(user?.avatar || defaultAvatar);
    setNewAvatar(null);
    setShowAvatarControls(false);
    toast.success('Đã xóa ảnh đại diện');
  };

  const handleSaveAvatar = async () => {
    if (!newAvatar) {
      setShowAvatarControls(false);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploadResult = await uploadUserAvatar(newAvatar);
      // Use the relative path returned from the API
      const avatarPath = uploadResult?.path;

      // Update user data with new avatar path
      setUser(prevUser => ({
        ...prevUser,
        avatar: avatarPath
      }));

      // Update global auth user data with path
      setAuthUser(prevAuthUser => ({
        ...prevAuthUser,
        avatar_url: avatarPath
      }));

      // Update preview
      setAvatarPreview(avatarPath);
      setNewAvatar(null);
      setShowAvatarControls(false);
      toast.success('Đã cập nhật ảnh đại diện');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Lỗi khi tải lên ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const triggerAvatarInput = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const openProfileEditDialog = () => {
    if (user) {
      setProfileFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || ''
      });
      setProfileFormModified(false);
      setIsProfileEditDialogOpen(true);
    }
  };

  const handleProfileFormChange = (field, value) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setProfileFormModified(true);
  };

  const handleCancelProfileEdit = () => {
    if (profileFormModified) {
      setShowDiscardConfirmation(true);
    } else {
      setIsProfileEditDialogOpen(false);
    }
  };

  const handleConfirmDiscardChanges = () => {
    setShowDiscardConfirmation(false);
    setIsProfileEditDialogOpen(false);
    setProfileFormModified(false);
  };

  const handleSaveProfileChanges = async () => {
    setIsSubmittingProfile(true);
    try {
      const response = await updateUserProfile({
        first_name: profileFormData.first_name,
        last_name: profileFormData.last_name,
        bio: profileFormData.bio
      });

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        first_name: profileFormData.first_name,
        last_name: profileFormData.last_name,
        full_name: `${profileFormData.last_name} ${profileFormData.first_name}`,
        bio: profileFormData.bio
      }));

      // Update global auth user data
      setAuthUser(prevAuthUser => ({
        ...prevAuthUser,
        first_name: profileFormData.first_name,
        last_name: profileFormData.last_name,
        bio: profileFormData.bio
      }));

      setProfileFormModified(false);
      setIsProfileEditDialogOpen(false);
      toast.success('Cập nhật thông tin cá nhân thành công');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Lỗi khi cập nhật thông tin cá nhân');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleFollowerFollowToggle = async (followerId) => {
    try {
      setLoadingFollowerId(followerId);
      await toggleFollow(followerId);
      setFollowers(prevFollowers =>
        prevFollowers.map(follower =>
          follower.id === followerId
            ? { ...follower, is_following: !follower.is_following }
            : follower
        )
      );
      const follower = followers.find(f => f.id === followerId);
      if (follower) {
        toast.success(follower.is_followed ? 'Đã hủy theo dõi' : 'Đã theo dõi');
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      toast.error('Lỗi khi theo dõi');
    } finally {
      setLoadingFollowerId(null);
    }
  };

  const handleFollowingFollowToggle = async (followingId) => {
    try {
      setLoadingFollowingId(followingId);
      await toggleFollow(followingId);
      setFollowing(prevFollowing =>
        prevFollowing.map(followingUser =>
          followingUser.id === followingId
            ? { ...followingUser, is_followed: !followingUser.is_followed }
            : followingUser
        )
      );
      const followingUser = following.find(f => f.id === followingId);
      if (followingUser) {
        toast.success(followingUser.is_followed ? 'Đã hủy theo dõi' : 'Đã theo dõi');
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      toast.error('Lỗi khi theo dõi');
    } finally {
      setLoadingFollowingId(null);
    }
  };

  const handlePetLike = async (petId) => {
    try {
      setLikeLoadingPetId(petId);
      const response = await togglePetLike(petId);

      if (response.data) {
        const likeData = response.data;
        setPets(prevPets =>
          prevPets.map(pet =>
            pet.id === petId || pet._id === petId
              ? { ...pet, is_liked: likeData.liked }
              : pet
          )
        );

        if (selectedPet && (selectedPet.id === petId || selectedPet._id === petId)) {
          setSelectedPet(prevPet => ({
            ...prevPet,
            is_liked: likeData.liked
          }));

          // Fetch updated like count for selected pet
          try {
            const likeCountResponse = await getPetLikeCount(petId);
            if (likeCountResponse.data && likeCountResponse.data.like_count !== undefined) {
              setPetLikeCount(likeCountResponse.data.like_count);
            }
          } catch (err) {
            console.error('Error fetching updated like count:', err);
          }
        }

        toast.success(likeData.action === 'liked' ? 'Bạn đã thích thú cưng' : 'Bạn đã hủy thích thú cưng');
      }
    } catch (err) {
      console.error('Error toggling pet like:', err);
      toast.error('Lỗi khi cập nhật trạng thái thích');
    } finally {
      setLikeLoadingPetId(null);
    }
  };

  const handleOpenCreateDialog = () => {
    if (floatingButtonRef.current) {
      floatingButtonRef.current.openDialog();
    }
  };

  const handleOpenFollowerDialog = async () => {
    try {
      setIsFollowerDialogOpen(true);
      // Only fetch if followers list is empty and not already loading
      if (followers.length === 0 && !isLoadingFollowers) {
        await fetchFollowers();
      }
    } catch (err) {
      console.error('Error opening follower dialog:', err);
    }
  };

  const handleOpenFollowingDialog = async () => {
    try {
      setIsFollowingDialogOpen(true);
      // Only fetch if following list is empty and not already loading
      if (following.length === 0 && !isLoadingFollowing) {
        await fetchFollowing();
      }
    } catch (err) {
      console.error('Error opening following dialog:', err);
    }
  };

  const handleOpenPetViewDialog = async (pet) => {
    try {
      // Open dialog immediately
      setSelectedPet(pet);
      setIsPetDetailDialogOpen(true);

      // Start loading
      setIsLoadingPetDetail(true);

      // Fetch pet like count
      const likeCountResponse = await getPetLikeCount(pet.id || pet._id);
      if (likeCountResponse.data && likeCountResponse.data.like_count !== undefined) {
        setPetLikeCount(likeCountResponse.data.like_count);
      }

      // Stop loading on success
      setIsLoadingPetDetail(false);
    } catch (err) {
      console.error('Error fetching pet details:', err);
      // Close dialog and show error toast
      setIsPetDetailDialogOpen(false);
      toast.error('Lỗi khi lấy dữ liệu thú cưng');
      setIsLoadingPetDetail(false);
    }
  };

  const handleOpenPetEditDialog = (pet) => {
    setEditingPet({
      id: pet.id || pet._id,
      name: pet.name,
      species: pet.type || pet.species,
      breed: pet.breed || '',
      gender: pet.gender || 'male',
      age: pet.age || 0,
      description: pet.description || '',
      avatar_url: pet.avatar_url || defaultAvatar
    });
    setEditingPetAvatarPreview(pet.avatar_url || defaultAvatar);
    setEditingPetNewAvatar(null);
    setIsEditPetDialogOpen(true);
  };

  const triggerEditingPetAvatarInput = () => {
    if (petAvatarInputRef.current) {
      petAvatarInputRef.current.click();
    }
  };

  const handleEditingPetAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error('Chỉ chấp nhận file ảnh');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPetAvatarPreview(reader.result);
        setEditingPetNewAvatar(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditingPetAvatar = () => {
    setEditingPetAvatarPreview(editingPet?.avatar_url || defaultAvatar);
    setEditingPetNewAvatar(null);
    toast.success('Đã xóa ảnh đại diện');
  };

  const handleUpdatePet = async () => {
    if (!editingPet.name.trim()) {
      toast.error('Vui lòng nhập tên thú cưng');
      return;
    }

    setIsSubmittingPet(true);
    try {
      let avatarUrl = editingPet.avatar_url;

      // Upload new avatar if selected
      if (editingPetNewAvatar) {
        const uploadResult = await uploadPetAvatar(editingPetNewAvatar, editingPet.id);
        if (uploadResult && uploadResult.path) {
          avatarUrl = uploadResult.path;
        }
      }

      // Update pet data
      const updateData = {
        name: editingPet.name,
        species: editingPet.species,
        breed: editingPet.breed,
        gender: editingPet.gender,
        age: parseInt(editingPet.age),
        description: editingPet.description,
        avatar_url: avatarUrl
      };

      const response = await updatePet(editingPet.id, updateData);

      if (response.success || response.data) {
        // Update pets list
        setPets(prevPets =>
          prevPets.map(pet =>
            (pet.id === editingPet.id || pet._id === editingPet.id)
              ? {
                ...pet,
                ...updateData
              }
              : pet
          )
        );

        // Update selected pet if it's currently displayed
        if (selectedPet && (selectedPet.id === editingPet.id || selectedPet._id === editingPet.id)) {
          setSelectedPet(prev => ({
            ...prev,
            ...updateData
          }));
        }

        setIsEditPetDialogOpen(false);
        toast.success('Cập nhật thông tin thú cưng thành công');
      }
    } catch (err) {
      console.error('Error updating pet:', err);
      toast.error('Lỗi khi cập nhật thông tin thú cưng');
    } finally {
      setIsSubmittingPet(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top profile cover with h-72 height */}
      <div className="h-81 bg-cover bg-center object-cover " style={{ backgroundImage: `url(${ProfileCover})` }}>
        {/* You can place any content here or keep it as a colored background */}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bottom background with bg-[#f5f3f0] extending to end of page */}
      <div className="bg-[#f5f3f0] min-h-screen py-6">
        <div className="max-w-5xl mx-auto px-4 -mt-76">
          {/* User Profile Section */}
          <Card className="gap-y-3 mb-6 bg-white border-[#e1d6ca] pt-0 px-8 shadow-none rounded-4xl">
            <CardHeader className="flex flex-col md:flex-row gap-6 items-center pt-10">
              <div className="flex w-full gap-x-16">
                <div className="relative">
                  {isPageLoading ? (
                    <Skeleton className="h-48 w-48 rounded-full" />
                  ) : user ? (
                    <Avatar className="h-48 w-48 border-4 border-white">
                      <AvatarImage src={getImageUrl(avatarPreview)} alt={user.first_name} className={"object-cover"} />
                      <AvatarFallback className="object-cover text-2xl bg-[#91114D] text-white">{user.first_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-48 w-48 rounded-full bg-gray-300 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
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
                            disabled={isUploadingAvatar}
                          >
                            {isUploadingAvatar ? (
                              <>
                                <ButtonLoader className="h-4 w-4 mr-2" />
                                Đang tải...
                              </>
                            ) : (
                              'Lưu lại'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-between mb-4">
                  {isPageLoading ? (
                    <>
                      <div className="mb-8">
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-6 w-48" />
                      </div>
                      <Skeleton className="h-10 w-48 rounded-full" />
                      <div className="flex gap-12 my-4">
                        <div className='flex flex-col'>
                          <Skeleton className="h-7 w-12 mb-1" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className='flex flex-col'>
                          <Skeleton className="h-7 w-12 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div className='flex flex-col'>
                          <Skeleton className="h-7 w-12 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-full" />
                    </>
                  ) : user ? (
                    <>
                      <div className="mb-8">
                        <h1 className="text-4xl page-header">{user.full_name || "Người dùng không xác định"}
                          <HiBadgeCheck className="text-[#1959d8] inline-block ml-3" />
                        </h1>
                        <p className="text-lg font-medium">{user.email || "Email chưa xác định"}</p>
                      </div>

                      {isLoggedInUser ? (
                        <Button
                          className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                          onClick={openProfileEditDialog}
                        >
                          Chỉnh sửa trang cá nhân
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                            onClick={handleFollowToggle}
                            disabled={isFollowingLoading}
                          >
                            {isFollowingLoading ? (
                              <>
                                <ButtonLoader className="h-4 w-4 mr-2" />
                                Đang xử lý...
                              </>
                            ) : (
                              isFollowingUser ? 'Hủy theo dõi' : 'Theo dõi'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full border-[#91114D] text-[#91114D] hover:bg-[#f0e9e5]"
                            onClick={handleNavigateToChats}
                            disabled={isFollowingLoading}
                          >
                            Nhắn tin
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-12 my-4">
                        <div className='flex flex-col'>
                          <span className="font-bold text-left text-lg">{user.posts}</span>
                          <span className='text-gray-600 text-base'>Bài viết</span>
                        </div>
                        <div className='flex flex-col cursor-pointer' onClick={handleOpenFollowerDialog}>
                          <span className="font-bold text-left text-lg">{user.followers}</span>
                          <span className='text-gray-600'>Người theo dõi</span>
                        </div>
                        <div className='flex flex-col cursor-pointer' onClick={handleOpenFollowingDialog}>
                          <span className="font-bold text-left text-lg">{user.following}</span>
                          <span className='text-gray-600'>Đang theo dõi</span>
                        </div>
                      </div>

                      <p className="text-gray-700">{user.bio || "Chưa có thông tin"}</p>
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

            {/* Pets Information */}
            <CardContent className={'px-0'}>
              <h2 className="font-bold text-lg mb-3">Thú cưng</h2>
              <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-2">
                {isPageLoading ? (
                  // Loading skeleton for pets
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-start bg-[#F6F1EB] p-4 rounded-xl">
                      <div className="flex items-center gap-x-1 w-full mb-2">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col ml-2 flex-1">
                          <Skeleton className="h-5 w-20 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 w-full">
                        <Skeleton className="h-8 flex-1 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  ))
                ) : (
                  pets.map((pet) => {
                    const isPetOwner = isLoggedInUser;
                    return (
                      <div key={pet.id} className="flex flex-col items-start bg-[#F6F1EB] p-4 rounded-xl min-w-[100px]">
                        {/* Name and breed next to avatar */}
                        <div className="flex items-center gap-x-1 w-full mb-2">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={getImageUrl(pet.avatar_url)} alt={pet.name} className={"object-cover rounded-full"} />
                            <AvatarFallback className="object-cover bg-[#E6DDD5] text-[#91114D]">{pet.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col ml-2">
                            <p className="font-bold text-[16px]">{pet.name}</p>
                            <p className="text-xs text-gray-600">{pet.breed}</p>
                          </div>
                        </div>
                        {/* Conditional buttons based on ownership */}
                        <div className="flex gap-2 mt-2 w-full">
                          {isPetOwner ? (
                            <>
                              <Button
                                variant="outline"
                                size="md"
                                className="p-1 flex-1 font-semibold rounded-full !text-[#91114D] !hover:text-[#91114D] border-[#91114D] hover:bg-[#f0e9e5]"
                                onClick={() => handleOpenPetViewDialog(pet)}
                              >
                                Xem
                              </Button>
                              <Button
                                variant="outline"
                                size="md"
                                className="p-1 flex-1 font-semibold rounded-full !text-[#91114D] !hover:text-[#91114D] border-[#91114D] hover:bg-[#f0e9e5]"
                                onClick={() => handleOpenPetEditDialog(pet)}
                              >
                                Chỉnh sửa
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="md"
                                className={`p-1 flex-1 font-semibold rounded-full ${pet.is_liked ? 'text-red-700 hover:text-red-600' : '!text-[#a70f56] !hover:text-[#91114D]'}`}
                                onClick={() => handlePetLike(pet.id || pet._id)}
                                disabled={likeLoadingPetId === (pet.id || pet._id)}
                              >
                                {likeLoadingPetId === (pet.id || pet._id) ? (
                                  <>
                                    <ButtonLoader className="h-4 w-4 mr-1" />
                                    Đang tải...
                                  </>
                                ) : (
                                  pet.is_liked ? 'Hủy thích' : 'Thích'
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full p-1 text-gray-400 hover:text-gray-500"
                                onClick={() => handleOpenPetViewDialog(pet)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Follower Dialog */}
          <Dialog open={isFollowerDialogOpen} onOpenChange={(open) => {
            if (open && followers.length === 0 && !isLoadingFollowers) {
              fetchFollowers();
            }
            setIsFollowerDialogOpen(open);
          }}>
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
                  disabled={isLoadingFollowers}
                />
                <div className="max-h-96 overflow-y-auto">
                  {isLoadingFollowers ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-3">
                          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : followerError ? (
                    <div className="flex items-center gap-2 py-4 text-red-600">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{followerError}</span>
                    </div>
                  ) : filteredFollowers.length > 0 ? (
                    filteredFollowers.map((follower) => (
                      <div key={follower.id} className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={getImageUrl(follower.avatar_url || follower.avatar)} alt={follower?.name} />
                            <AvatarFallback>{follower?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{follower.name}</p>
                            <p className="text-sm text-gray-500">{follower.email}</p>
                          </div>
                        </div>
                        <Button
                          variant={follower.is_followed ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowerFollowToggle(follower.id)}
                          disabled={loadingFollowerId === follower.id}
                        >
                          {loadingFollowerId === follower.id ? (
                            <>
                              <ButtonLoader className="h-4 w-4 mr-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            follower.is_followed ? 'Hủy theo dõi' : 'Theo dõi'
                          )}
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
          <Dialog open={isFollowingDialogOpen} onOpenChange={(open) => {
            if (open && following.length === 0 && !isLoadingFollowing) {
              fetchFollowing();
            }
            setIsFollowingDialogOpen(open);
          }}>
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
                  disabled={isLoadingFollowing}
                />
                <div className="max-h-96 overflow-y-auto">
                  {isLoadingFollowing ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-3">
                          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : followingError ? (
                    <div className="flex items-center gap-2 py-4 text-red-600">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{followingError}</span>
                    </div>
                  ) : filteredFollowing.length > 0 ? (
                    filteredFollowing.map((followingUser) => (
                      <div key={followingUser.id} className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={getImageUrl(followingUser.avatar_url || followingUser.avatar)} alt={followingUser.name} />
                            <AvatarFallback>{followingUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{followingUser.name}</p>
                            <p className="text-sm text-gray-500">{followingUser.email}</p>
                          </div>
                        </div>
                        <Button
                          variant={followingUser.is_followed ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowingFollowToggle(followingUser.id)}
                          disabled={loadingFollowingId === followingUser.id}
                        >
                          {loadingFollowingId === followingUser.id ? (
                            <>
                              <ButtonLoader className="h-4 w-4 mr-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            followingUser.is_followed ? 'Hủy theo dõi' : 'Theo dõi'
                          )}
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

          {/* Profile Edit Dialog */}
          <Dialog open={isProfileEditDialogOpen} onOpenChange={(open) => {
            if (!open) {
              if (profileFormModified) {
                setShowDiscardConfirmation(true);
              } else {
                setIsProfileEditDialogOpen(false);
              }
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="page-header text-[22px]">Chỉnh sửa thông tin cá nhân</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Họ và tên đệm</Label>
                    <Input
                      id="last-name"
                      value={profileFormData.last_name}
                      onChange={(e) => handleProfileFormChange('last_name', e.target.value)}
                      placeholder="Nhập họ của bạn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Tên</Label>
                    <Input
                      id="first-name"
                      value={profileFormData.first_name}
                      onChange={(e) => handleProfileFormChange('first_name', e.target.value)}
                      placeholder="Nhập tên của bạn"
                    />
                  </div>

                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Mô tả</Label>
                  <Textarea
                    id="bio"
                    value={profileFormData.bio}
                    onChange={(e) => handleProfileFormChange('bio', e.target.value)}
                    placeholder="Nhập mô tả của bạn"
                    maxLength={1000}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleCancelProfileEdit}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-[#91114D] hover:bg-[#91114D]/90 rounded-full"
                  onClick={handleSaveProfileChanges}
                  disabled={isSubmittingProfile}
                >
                  {isSubmittingProfile ? (
                    <>
                      <ButtonLoader className="h-4 w-4 mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu lại'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Discard Changes Confirmation Dialog */}
          <AlertDialog open={showDiscardConfirmation} onOpenChange={setShowDiscardConfirmation}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận hủy bỏ thay đổi</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn hủy bỏ tất cả thay đổi?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full"
                  onClick={handleConfirmDiscardChanges}
                >
                  Hủy bỏ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Pet Detail Dialog - View Only */}
          <Dialog open={isPetDetailDialogOpen} onOpenChange={setIsPetDetailDialogOpen}>
            <DialogContent className="rounded-3xl shadow-none border border-gray-300">
              {isLoadingPetDetail ? (
                // Loading skeleton state
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="h-28 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-40 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <div className="bg-gray-100 py-3 rounded-lg space-y-2 px-6">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
              ) : selectedPet ? (
                // Success state - display pet data
                <>
                  <div className="relative bg-gradient-to-b from-[#f2eef0] via-[#fffbfd] to-white rounded-xl h-32 pt-12 flex items-center justify-center -mx-6 -mt-6 px-6">
                    <Avatar className="w-28 h-28">
                      <AvatarImage src={getImageUrl(selectedPet.avatar_url)} alt={selectedPet.name} className="object-cover" />
                      <AvatarFallback className="text-2xl bg-black text-white">
                        {selectedPet.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute top-3 right-6 mt-3 text-sm font-semibold px-2 py-0.5 bg-[#f0d8e4] rounded-lg text-[#bb065a]">
                      <span>{petLikeCount} lượt thích</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[27px] font-bold text-[#6c0937]">{selectedPet.name}</h3>
                      <span className="text-sm font-medium bg-[#f2ebe5] px-3 py-1 rounded-full">
                        {selectedPet.species === 'dog' ? 'Chó' : selectedPet.species === 'cat' ? 'Mèo' : 'Chim'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {selectedPet.description || 'Thú cưng này chưa có mô tả'}
                    </p>

                    <div className="bg-gray-100 py-3 rounded-lg flex items-center justify-between gap-2 text-center text-sm px-6">
                      <div className="w-fit text-nowrap">
                        <div className="font-bold text-[16px]">{selectedPet.breed || 'Chưa xác định'}</div>
                        <div className="text-muted-foreground text-xs">Giống</div>
                      </div>
                      <div>
                        <div className="font-bold text-[16px]">{selectedPet.age || 0} tháng</div>
                        <div className="text-muted-foreground text-xs">Tuổi</div>
                      </div>
                      <div>
                        <div className="font-bold text-[16px] capitalize">{selectedPet.gender === 'male' ? 'Đực' : 'Cái'}</div>
                        <div className="text-muted-foreground text-xs">Giới tính</div>
                      </div>
                    </div>

                    {!isLoggedInUser && (
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => handlePetLike(selectedPet.id || selectedPet._id)}
                          disabled={likeLoadingPetId === (selectedPet.id || selectedPet._id)}
                          className={`flex items-center flex-1 ${selectedPet.is_liked ? 'text-red-500 border-red-500' : ''
                            }`}
                        >
                          {likeLoadingPetId === (selectedPet.id || selectedPet._id) ? (
                            <>
                              <ButtonLoader className="h-4 w-4 mr-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Heart
                                className={`h-4 w-4 mr-2 ${selectedPet.is_liked ? 'fill-current' : ''
                                  }`}
                              />
                              {selectedPet.is_liked ? 'Bỏ thích' : 'Thích'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </DialogContent>
          </Dialog>

          {/* Pet Edit Dialog */}
          <Dialog open={isEditPetDialogOpen} onOpenChange={setIsEditPetDialogOpen}>
            <DialogContent className="min-w-xl">
              {editingPet && (
                <>
                  <DialogHeader>
                    <DialogTitle className="page-header text-[22px]">Chỉnh sửa thông tin thú cưng</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Avatar Upload Section */}
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="edit-avatar" className="text-right">
                        Ảnh đại diện
                      </Label>
                      <div className="col-span-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={getImageUrl(editingPetAvatarPreview || editingPet.avatar_url)} alt="Pet preview" />
                            <AvatarFallback className="bg-[#E6DDD5]">
                              {editingPet.name ? editingPet.name.charAt(0) : 'Pet'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex gap-3">
                            <Button variant="outline" size="sm" onClick={triggerEditingPetAvatarInput}>
                              Chọn ảnh
                            </Button>
                            {(editingPetAvatarPreview || editingPet.avatar_url) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={removeEditingPetAvatar}
                                className="flex items-center gap-1"
                              >
                                Xóa
                              </Button>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              ref={petAvatarInputRef}
                              className="hidden"
                              onChange={handleEditingPetAvatarUpload}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Định dạng JPG, PNG. Kích thước tối đa 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="edit-name" className="text-right">
                        Tên
                      </Label>
                      <Input
                        id="edit-name"
                        value={editingPet.name}
                        onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                        className="col-span-3"
                        placeholder="Tên thú cưng"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="edit-species" className="text-right">
                        Loài
                      </Label>
                      <Select value={editingPet.species} onValueChange={(value) => setEditingPet({ ...editingPet, species: value })}>
                        <SelectTrigger className="col-span-3 w-full">
                          <SelectValue placeholder="Chọn loài" />
                        </SelectTrigger>
                        <SelectContent className={'w-full'}>
                          <SelectItem value="dog">Chó</SelectItem>
                          <SelectItem value="cat">Mèo</SelectItem>
                          <SelectItem value="bird">Chim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="edit-breed" className="text-right">
                        Giống
                      </Label>
                      <Input
                        id="edit-breed"
                        value={editingPet.breed}
                        onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                        className="col-span-3"
                        placeholder="Giống của thú cưng"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="edit-gender" className="text-right">
                        Giới tính
                      </Label>
                      <div className="col-span-3 flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="edit-gender"
                            value="male"
                            checked={editingPet.gender === 'male'}
                            onChange={(e) => setEditingPet({ ...editingPet, gender: e.target.value })}
                            className="mr-2"
                          />
                          Đực
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="edit-gender"
                            value="female"
                            checked={editingPet.gender === 'female'}
                            onChange={(e) => setEditingPet({ ...editingPet, gender: e.target.value })}
                            className="mr-2"
                          />
                          Cái
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="edit-age" className="text-right">
                        Tuổi
                      </Label>
                      <Input
                        id="edit-age"
                        type="number"
                        value={editingPet.age}
                        onChange={(e) => setEditingPet({ ...editingPet, age: e.target.value })}
                        className="col-span-3"
                        placeholder="Tuổi"
                        min="0"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="edit-description" className="text-right">
                        Mô tả
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={editingPet.description}
                        onChange={(e) => setEditingPet({ ...editingPet, description: e.target.value })}
                        className="col-span-3"
                        placeholder="Mô tả về thú cưng"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button className="rounded-full" variant="outline" onClick={() => setIsEditPetDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button
                      onClick={handleUpdatePet}
                      className="bg-[#91114D] hover:bg-[#91114D]/90 rounded-full"
                      disabled={isSubmittingPet}
                    >
                      {isSubmittingPet ? (
                        <>
                          <ButtonLoader className="h-4 w-4 mr-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Cập nhật'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Post Filter */}
          <div className="mb-4 px-36">
            {isPageLoading ? (
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-7 w-24" />
                <div className="flex gap-2 ml-4">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ) : (
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
            )}

          </div>

          {/* Posts Section */}
          <div className="mb-4 px-36">
            {isPageLoading ? (
              <Skeleton className="h-0 w-full rounded-xl" />
            ) : (
              isLoggedInUser && <PostCreation onOpenDialog={handleOpenCreateDialog} />
            )}
          </div>

          {isPageLoading || isFilterLoading ? (
            <div className='px-36'>
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className='px-36'>
              {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostItem key={post.id} post={post} onPostDeleted={handlePostDeleted} onPostUpdated={(updatedPost) => {
                    setFilteredPosts(prevPosts =>
                      prevPosts.map(p =>
                        p.id === updatedPost.id ? { ...p, ...updatedPost } : p
                      )
                    );
                  }} />
                ))
              ) : (
                <div className="text-center py-8 pb-12 text-gray-500">
                  <img src={NoPostsImage} alt="No Post" className="mx-auto h-72 mb-1" />
                  <p>Không có bài viết nào để hiển thị.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      {isLoggedInUser && (
        <FloatingCreateButton ref={floatingButtonRef} onPostCreated={handlePostCreated} userData={{ pets }} />
      )}
    </div>
  );
}