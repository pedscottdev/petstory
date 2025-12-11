import React, { useState, useRef, useEffect } from "react";
import MainLayout from "@/layouts/main-layout";
import {
  PostCreation,
  PostFilter,
  PostItem,
  PostSkeleton,
  PeopleYouMayKnow,
  UserProfile,
} from "@/components/user/newfeed";
import { FloatingCreateButton } from "@/components/user/newfeed";
import { getNewfeedData } from "@/api/userApi";
import { getFilteredFeed } from "@/api/postApi";
import { toast } from "sonner";
import { getImageUrl, getAvatarUrl } from "@/utils/imageUtils";

export default function NewfeedPage() {
  const floatingButtonRef = useRef(null);
  const loadMoreRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [peopleYouMayKnow, setPeopleYouMayKnow] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('latest');
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchNewfeedData();
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loading, loadingMore, hasMore, currentPage, activeFilter]);

  const fetchNewfeedData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNewfeedData(5, 1, 15);

      // Kiểm tra response hợp lệ
      if (!response || !response.success || !response.data) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response format');
      }

      const data = response.data;

      setUserData(data.user);
      setPeopleYouMayKnow(data.people_you_may_know || []);

      // Đảm bảo rawPosts luôn là array
      const rawPosts = Array.isArray(data.posts && data.posts.data)
        ? data.posts.data
        : Array.isArray(data.posts)
          ? data.posts
          : [];

      const transformedPosts = transformPostsData(rawPosts);

      setPosts(transformedPosts);
      setCurrentPage(1);

      // Check if there are more posts
      const totalPages = data.posts?.last_page || 1;
      setHasMore(1 < totalPages);
    } catch (err) {
      console.error('Failed to fetch newfeed data:', err);
      console.error('Error details:', (err && err.response) || err);

      var errorMessage =
        err &&
          err.response &&
          err.response.data &&
          err.response.data.message
          ? err.response.data.message
          : err && err.message
            ? err.message
            : 'Đã có lỗi xảy ra, vui lòng thử lại sau.';

      setError(errorMessage);
      toast.error('Không thể tải dữ liệu trang chủ');
    } finally {
      setLoading(false);
    }
  }


  // Transform posts data helper function
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

  // Format time ago helper function
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

  const handleOpenCreateDialog = () => {
    if (floatingButtonRef.current) {
      floatingButtonRef.current.openDialog();
    }
  };

  // Handle follow/unfollow action to update user's following count
  const handleFollowToggle = (userId, isNowFollowing) => {
    setUserData(prevData => {
      if (!prevData) return prevData;

      return {
        ...prevData,
        following_count: isNowFollowing
          ? (prevData.following_count || 0) + 1
          : Math.max(0, (prevData.following_count || 0) - 1)
      };
    });
  };

  // Handle post updated (e.g., likes, content changes)
  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPost.id ? { ...post, ...updatedPost } : post
      )
    );
  };

  // Handle new post creation
  const handlePostCreated = async (newPost) => {
    try {
      // Refresh the entire feed to get the latest posts including the new one
      await fetchNewfeedData();
    } catch (error) {
      console.error('Failed to refresh feed after post creation:', error);
    }
  };

  // Handle post deleted
  const handlePostDeleted = (postId) => {
    // Remove deleted post from posts list
    setPosts(prevPosts =>
      prevPosts.filter(p => p.id !== postId && p._id !== postId)
    );

    // Update user's posts count
    setUserData(prevData => {
      if (!prevData) return prevData;

      return {
        ...prevData,
        posts_count: Math.max(0, (prevData.posts_count || 0) - 1)
      };
    });
  };

  // Handle filter change
  // Handle filter change
  const handleFilterChange = async (filterType) => {
    if (filterType === activeFilter) return;

    try {
      setActiveFilter(filterType);
      setLoadingPosts(true);

      const response = await getFilteredFeed(filterType, 1, 15);

      if (!response || !response.success || !response.data) {
        throw new Error('Invalid response format');
      }

      const rawPosts = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      const transformedPosts = transformPostsData(rawPosts);

      setPosts(transformedPosts);
      setCurrentPage(1);

      // Check if there are more posts
      const totalPages = response.data?.last_page || 1;
      setHasMore(1 < totalPages);
    } catch (err) {
      console.error('Failed to fetch filtered posts:', err);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load more posts (lazy loading)
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const response = await getFilteredFeed(activeFilter, nextPage, 15);

      if (!response || !response.success || !response.data) {
        throw new Error('Invalid response format');
      }

      const rawPosts = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      const transformedPosts = transformPostsData(rawPosts);

      // Append new posts to existing ones
      setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      setCurrentPage(nextPage);

      // Check if there are more posts
      const totalPages = response.data?.last_page || nextPage;
      setHasMore(nextPage < totalPages);
    } catch (err) {
      console.error('Failed to load more posts:', err);
      toast.error('Không thể tải thêm bài viết');
    } finally {
      setLoadingMore(false);
    }
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="relative bg-[#f5f3f0] min-h-screen py-5">
        <div className="px-26 w-[100%]">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-lg text-gray-700">Không thể hiển thị trang chủ hệ thống, vui lòng load lại trang.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#f5f3f0] min-h-screen py-5">
      <div className="px-26 w-[100%]">
        <div className="grid grid-cols-4 justify-center gap-4">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <UserProfile userData={userData} isLoading={loading} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <PostCreation onOpenDialog={handleOpenCreateDialog} />
            <PostFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />
            {loading || loadingPosts ? (
              <div>
                {[1, 2, 3].map((i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div>
                {posts.map((post) => (
                  <PostItem key={post.id} post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
                ))}
                {posts.length === 0 && (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-500">Chưa có bài viết nào</p>
                  </div>
                )}

                {/* Load more trigger */}
                {hasMore && posts.length > 0 && (
                  <div ref={loadMoreRef} className="py-4 pt-0">
                    {loadingMore && (
                      <div>
                        {[1, 2].map((i) => (
                          <PostSkeleton key={i} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <PeopleYouMayKnow
              people={peopleYouMayKnow}
              isLoading={loading}
              onFollowToggle={handleFollowToggle}
            />
          </div>
        </div>
      </div>
      <FloatingCreateButton ref={floatingButtonRef} onPostCreated={handlePostCreated} userData={userData} />
    </div>
  );
}