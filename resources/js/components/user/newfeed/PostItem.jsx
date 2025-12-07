import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Reply,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { IoHeartCircle } from "react-icons/io5";
import { RiPokerHeartsLine } from "react-icons/ri";
import { BiSolidMessage, BiSolidMessageRoundedDots, BiSolidMessageSquareDots } from 'react-icons/bi';
import { AiFillHeart, AiFillMessage } from 'react-icons/ai';
import { BsHeartFill } from 'react-icons/bs';
import { MdPets } from 'react-icons/md';
import { PiCatFill } from 'react-icons/pi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import * as postApi from '@/api/postApi';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/utils/imageUtils';
import ButtonLoader from '@/components/ui/ButtonLoader';

export default function PostItem({ post, onPostDeleted, onPostUpdated }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comment_counts || post.comments_count || post.comments || 0);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteCommentDialogOpen, setIsDeleteCommentDialogOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [customReportReason, setCustomReportReason] = useState('');
  const [editedPostContent, setEditedPostContent] = useState(post.content);
  const [editedTaggedPets, setEditedTaggedPets] = useState(post.pets || []);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isLoadingDeleteComment, setIsLoadingDeleteComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);

  // Check if current user is the post owner
  const isPostOwner = currentUser && post.user && currentUser.id === post.user.id;

  // Check if post content has been modified
  const hasContentChanged = editedPostContent.trim() !== (post.content || '').trim();

  const handleLike = async () => {
    if (isLoadingLike) return;

    // Toggle UI state immediately for better UX
    const newLikedState = !liked;
    const likeCountAdjustment = newLikedState ? 1 : -1;

    // Optimistically update UI
    setLiked(newLikedState);
    setLikesCount(prev => Math.max(0, prev + likeCountAdjustment));

    try {
      setIsLoadingLike(true);
      const postId = post.id || post._id;
      const response = await postApi.togglePostLike(postId);

      if (response.success) {
        const newLikeCount = response.data.like_count;
        const isNowLiked = response.data.action === 'liked';

        // Update with actual server response
        setLiked(isNowLiked);
        setLikesCount(newLikeCount);
        toast.success(response.message || 'Thành công');

        // Update post data immediately with is_liked attribute
        if (onPostUpdated) {
          onPostUpdated({
            ...post,
            is_liked: isNowLiked,
            likes_count: newLikeCount,
            likes: newLikeCount
          });
        }
      } else {
        // Revert optimistic updates on error
        setLiked(!newLikedState);
        setLikesCount(prev => Math.max(0, prev - likeCountAdjustment));
        toast.error(response.message || 'Lỗi khi cập nhật like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic updates on error
      setLiked(!newLikedState);
      setLikesCount(prev => Math.max(0, prev - likeCountAdjustment));
      toast.error('Lỗi khi cập nhật like');
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isLoadingComment) return;

    try {
      setIsLoadingComment(true);
      const postId = post.id || post._id;
      const response = await postApi.addComment(postId, comment);

      if (response.success) {
        const newComment = response.data;
        setComments([...comments, newComment]);
        setComment('');
        setShowComments(true);

        // Update comment count
        const newCommentCount = commentCount + 1;
        setCommentCount(newCommentCount);

        // Update parent component with new comment count
        if (onPostUpdated) {
          onPostUpdated({
            ...post,
            comments_count: newCommentCount,
            comment_counts: newCommentCount,
            comments: newCommentCount
          });
        }

        toast.success('Thêm bình luận thành công');
      } else {
        toast.error(response.message || 'Lỗi khi thêm bình luận');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Lỗi khi thêm bình luận');
    } finally {
      setIsLoadingComment(false);
    }
  };

  const handleReplySubmit = (e, parentId) => {
    e.preventDefault();
    if (replyText.trim()) {
      // In a real app, you would add the reply to the backend and update the state
      console.log('Reply submitted:', replyText, 'to comment:', parentId);
      setReplyText('');
      setReplyingTo(null);
      toast.success('Phản hồi thành công');
    }
  };

  const handleReportPost = async () => {
    if (!reportReason || (reportReason === 'other' && !customReportReason.trim())) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }

    if (isLoadingReport) return;

    try {
      setIsLoadingReport(true);
      const reason = reportReason === 'other' ? customReportReason : reportReason;
      const postId = post.id || post._id;
      const response = await postApi.reportPost(postId, reason);

      if (response.success) {
        toast.success('Báo cáo đã được gửi thành công');
        setIsReportDialogOpen(false);
        setReportReason('');
        setCustomReportReason('');
      } else {
        toast.error(response.message || 'Lỗi khi gửi báo cáo');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Lỗi khi gửi báo cáo');
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleEditPost = async () => {
    if (!editedPostContent.trim() || isLoadingEdit) return;

    try {
      setIsLoadingEdit(true);
      const postId = post.id || post._id;
      const response = await postApi.updatePost(postId, {
        content: editedPostContent,
        tagged_pets: editedTaggedPets.map(pet => pet.id || pet._id)
      });

      if (response.success) {
        toast.success('Bài viết đã được cập nhật thành công');
        setIsEditDialogOpen(false);
        if (onPostUpdated) {
          onPostUpdated(response.data);
        }
      } else {
        toast.error(response.message || 'Lỗi khi cập nhật bài viết');
      }
    } catch (error) {
      console.error('Error editing post:', error);
      toast.error('Lỗi khi cập nhật bài viết');
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (isLoadingDelete) return;

    try {
      setIsLoadingDelete(true);
      const postId = post.id || post._id;
      const response = await postApi.deletePost(postId);

      if (response.success) {
        toast.success('Bài viết đã được xóa thành công');
        setIsDeleteDialogOpen(false);
        if (onPostDeleted) {
          onPostDeleted(postId);
        }
      } else {
        toast.error(response.message || 'Lỗi khi xóa bài viết');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Lỗi khi xóa bài viết');
    } finally {
      setIsLoadingDelete(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setIsLoadingDeleteComment(true);
      const response = await postApi.deleteComment(commentId);

      if (response.success) {
        setComments(comments.filter(c => c.id !== commentId && c._id !== commentId));

        // Update comment count
        const newCommentCount = Math.max(0, commentCount - 1);
        setCommentCount(newCommentCount);

        // Update parent component with new comment count
        if (onPostUpdated) {
          onPostUpdated({
            ...post,
            comments_count: newCommentCount,
            comment_counts: newCommentCount,
            comments: newCommentCount
          });
        }

        toast.success('Xóa bình luận thành công');
        setIsDeleteCommentDialogOpen(false);
        setDeleteCommentId(null);
      } else {
        toast.error(response.message || 'Lỗi khi xóa bình luận');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Lỗi khi xóa bình luận');
    } finally {
      setIsLoadingDeleteComment(false);
    }
  };

  const toggleComments = async () => {
    // If showing comments, just toggle visibility
    if (showComments) {
      setShowComments(false);
      return;
    }

    // If not showing and haven't loaded yet, fetch comments
    if (!hasLoadedComments && !isLoadingComments) {
      try {
        setIsLoadingComments(true);
        const response = await postApi.getPostComments(post.id || post._id);
        if (response.success && Array.isArray(response.data)) {
          setComments(response.data);
        } else {
          setComments([]);
        }
        setHasLoadedComments(true);
        setShowComments(true);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
        toast.error('Lỗi khi tải bình luận');
        setHasLoadedComments(true);
        setShowComments(true);
      } finally {
        setIsLoadingComments(false);
      }
    } else {
      // If already loaded, just show
      setShowComments(true);
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText('');
  };

  const renderComment = (comment, isNested = false) => {
    if (!comment) return null;

    const isCommentOwner = currentUser && comment.user && currentUser.id === comment.user.id;
    const user = comment.user || {};
    const avatarUrl = getImageUrl(user.avatar || user.avatar_url);

    return (
      <div key={comment.id || comment._id} className={`flex gap-3 ${isNested ? 'ml-10 mt-2' : 'mt-2'}`}>
        <Avatar className="!w-9 !h-9">
          <AvatarImage src={avatarUrl} alt={user.name || 'User'} />
          <AvatarFallback className="bg-black text-white text-xs">
            {user.name ? user.name.charAt(0) : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-[#ececec] rounded-2xl px-3 py-2">
            <p className="font-semibold text-sm">{user.name || 'Anonymous'}</p>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
            {isCommentOwner && (
              <button
                className="hover:underline hover:cursor-pointer text-red-500"
                onClick={() => {
                  setDeleteCommentId(comment.id || comment._id);
                  setIsDeleteCommentDialogOpen(true);
                }}
              >
                Xóa bình luận
              </button>
            )}
            <button
              className="hover:underline hover:cursor-pointer"
              onClick={() => handleReplyClick(comment.id || comment._id)}
            >
              Phản hồi
            </button>
            <span>{comment.created_at ? new Date(comment.created_at).toLocaleDateString('vi-VN') : comment.time}</span>
          </div>

          {replyingTo === (comment.id || comment._id) && (
            <form onSubmit={(e) => handleReplySubmit(e, comment.id || comment._id)} className="flex gap-2 mt-2">
              <Input
                placeholder="Viết phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="shadow-none border-[#e1d6ca] flex-1 rounded-full h-8 bg-white text-sm"
              />
              <Button
                type="submit"
                className="h-8 rounded-full bg-[#91114D] hover:bg-[#91114D]/85"
                size="sm"
                disabled={!replyText.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </form>
          )}

          {/* Render replies (max 1 level) */}
          {comment.replies && Array.isArray(comment.replies) && comment.replies.map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  // Determine the number of pets to display
  const petCount = Array.isArray(post.pets) ? post.pets.length : post.pets || 0;

  // Format pet names according to the requirements
  const formatPetNames = () => {
    if (!Array.isArray(post.pets) || post.pets.length === 0) {
      return 'Nina'; // Default name as shown in the original code
    }

    const petNames = post.pets.map(pet => pet.name);

    if (petNames.length === 1) {
      return petNames[0];
    } else if (petNames.length === 2) {
      return `${petNames[0]} và ${petNames[1]}`;
    } else if (petNames.length >= 3) {
      const lastPet = petNames.pop();
      return `${petNames.join(', ')} và ${lastPet}`;
    }

    return 'Nina'; // Fallback
  };

  // Function to navigate to user profile
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <Card className="w-full mb-4 bg-white !shadow-none gap-2 py-4 border border-gray-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
        <div className="flex items-center gap-3">
          <Avatar className={"!w-10 !h-10"}>
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback className={"bg-black text-white"}>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className='text-[16px]'>
              <span
                className='font-semibold cursor-pointer hover:underline'
                onClick={() => handleUserClick(post.user.id)}
              >
                {post.user.name}
              </span> đang ở cùng với <span className='font-semibold'>{formatPetNames()}</span>
            </p>
            <p className="text-xs text-muted-foreground">{post.time}</p>
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger >
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="!h-5 !w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent >
            {isPostOwner ? (
              <>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <span className="font-medium ">Chỉnh sửa bài viết</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  <span className="font-medium text-red-500">Xóa bài viết</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
                <span className="font-medium text-red-500">Báo cáo bài viết</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className={"px-4"}>
        <p className="text-[15px]">{post.content}</p>

        {post.images && post.images.length > 0 ? (
          <div className="mt-3">
            {post.images.length === 1 ? (
              // Single image
              <div className="relative">
                <img
                  src={post.images[0]}
                  alt="Post content"
                  className="w-full rounded-lg object-cover max-h-86 cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(0);
                    setIsImageDialogOpen(true);
                  }}
                />
              </div>
            ) : post.images.length === 2 ? (
              // Two images side by side
              <div className="grid grid-cols-2 gap-2 cursor-pointer">
                {post.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageDialogOpen(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`Post content ${index + 1}`}
                      className="w-full h-full object-cover max-h-86"
                    />
                  </div>
                ))}
              </div>
            ) : post.images.length === 3 ? (
              // Three images - two in first row, one full-width in second row
              <div className="grid grid-cols-1 gap-2 cursor-pointer">
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-lg"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setIsImageDialogOpen(true);
                      }}
                    >
                      <img
                        src={post.images[index]}
                        alt={`Post content ${index + 1}`}
                        className="w-full h-full object-cover max-h-86"
                      />
                    </div>
                  ))}
                </div>
                <div
                  className="aspect-[2/1] overflow-hidden rounded-lg w-full"
                  onClick={() => {
                    setSelectedImageIndex(2);
                    setIsImageDialogOpen(true);
                  }}
                >
                  <img
                    src={post.images[2]}
                    alt="Post content 3"
                    className="w-full h-full object-cover max-h-86"
                  />
                </div>
              </div>
            ) : (
              // Four images - 2x2 grid
              <div className="grid grid-cols-2 gap-2 cursor-pointer">
                {post.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageDialogOpen(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`Post content ${index + 1}`}
                      className="w-full h-full object-cover max-h-86"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : post.image ? (
          // Fallback for single image posts (legacy)
          <div className="mt-3">
            <img
              src={post.image}
              alt="Post content"
              className="w-full rounded-lg object-cover max-h-86 cursor-pointer"
              onClick={() => {
                setSelectedImageIndex(0);
                setIsImageDialogOpen(true);
              }}
            />
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 px-4 pt-1">
        <div className="flex items-centerjustify-start gap-x-6 w-full text-[15px]">
          <div className="flex items-center gap-1 text-gray-600">
            <button
              className="group transition-all active:scale-105 duration-300 text-[15px] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLike}
              disabled={isLoadingLike}
            >
              <AiFillHeart className={`group-active:scale-180 duration-300 transition-all !h-6 !w-6  ${liked ? 'text-[#EF4142]' : 'text-gray-400'}`} />
            </button>
            <p className='font-medium'>{likesCount}</p>
          </div>
          {/* All comments button - when clicked, shows all comments */}
          <button
            className="hover:cursor-pointer flex items-center gap-1 text-gray-600"
            onClick={toggleComments}
          >
            <AiFillMessage className="h-5.5 w-5.5 text-gray-400" />
            <p className='font-medium'>{commentCount}</p>
          </button>
          {/* All pets */}
          <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen} >
            <DialogTrigger asChild>
              <button
                className="hover:cursor-pointer flex items-center gap-1 text-gray-600"
              >
                <span className='p-[2.5px] bg-gray-400 rounded-full'>
                  <MdPets className="h-4 w-4 text-white" />
                </span>
                <p className='font-medium'>{petCount}</p>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className={"page-header text-[20px]"}>Thú cưng được gắn thẻ</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-0">
                {Array.isArray(post.pets) && post.pets.length > 0 ? (
                  post.pets.map((pet) => (
                    <div key={pet.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <Avatar className="!w-12 !h-12">
                        <AvatarImage src={pet.avatar_url || pet.avatar} alt={pet.name} />
                        <AvatarFallback className="bg-black text-white">
                          {pet.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{pet.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          {pet.breed || 'Chưa xác định'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có thú cưng nào được gắn thẻ trong bài viết này.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={handleCommentSubmit} className="flex gap-2 w-full ">
          <Input
            placeholder="Viết bình luận cho bài viết"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="shadow-none border-[#e1d6ca] flex-1 rounded-full h-9 bg-[#F7F7F7]"
            disabled={isLoadingComment}
          />
          <Button
            type="submit"
            className={"w-9 h-9 rounded-full bg-[#91114D] hover:bg-[#91114D]/85"}
            size="sm"
            disabled={!comment.trim() || isLoadingComment}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Comments section - initially hidden, shown when user clicks comment button */}
        {showComments && (
          <div className="w-full border-t border-[#e1d6ca] pt-3">
            {isLoadingComments ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <div className="inline-block animate-spin">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <p className="mt-2">Đang tải bình luận...</p>
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map(comment => renderComment(comment))
            ) : (
              <div className="text-center py-6 text-gray-600 text-sm">
                <MessageCircle className="h-7 w-7 mx-auto mb-2 opacity-30" />
                <div>
                  <p className="font-semibold text-lg text-gray-600">Chưa có bình luận nào.</p>
                  <p className=" text-gray-600">Hãy viết bình luận cho bài viết này</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardFooter>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className={"page-header text-[22px]"}>Báo cáo bài viết</DialogTitle>
          </DialogHeader>
          <div className="py-0">
            <div className="space-y-3">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="reportReason"
                    value="inappropriate"
                    checked={reportReason === 'inappropriate'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="form-radio"
                  />
                  <span>Nội dung phản cảm / bạo lực</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="reportReason"
                    value="spam"
                    checked={reportReason === 'spam'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="form-radio"
                  />
                  <span>Spam hoặc quảng cáo</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="reportReason"
                    value="misinformation"
                    checked={reportReason === 'misinformation'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="form-radio"
                  />
                  <span>Thông tin sai lệch</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="reportReason"
                    value="hate"
                    checked={reportReason === 'hate'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="form-radio"
                  />
                  <span>Nội dung thù ghét / quấy rối</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="reportReason"
                    value="other"
                    checked={reportReason === 'other'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="form-radio"
                  />
                  <span>Khác</span>
                </label>
                {reportReason === 'other' && (
                  <textarea
                    placeholder="Mô tả cụ thể..."
                    value={customReportReason}
                    onChange={(e) => setCustomReportReason(e.target.value)}
                    className="w-full mt-2 p-2 border rounded-lg"
                    rows="3"
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsReportDialogOpen(false);
                setReportReason('');
                setCustomReportReason('');
              }}
              className="rounded-full"
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              onClick={handleReportPost}
              disabled={!reportReason || (reportReason === 'other' && !customReportReason.trim()) || isLoadingReport}
              className="bg-[#91114D] text-white hover:bg-[#91114D]/85 rounded-full disabled:opacity-50"
            >
              {isLoadingReport ? (
                <div className="flex items-center">
                  <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                  <span>Đang thực hiện</span>
                </div>
              ) : 'Gửi báo cáo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Carousel Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] p-0 overflow-hidden backdrop:blur" onInteractOutside={(e) => e.preventDefault()}>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              startIndex: selectedImageIndex
            }}
            className="w-full"
          >
            <CarouselContent>
              {(post.images || [post.image]).map((image, index) => (
                <CarouselItem key={index} className="flex items-center justify-center aspect-video">
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="max-h-[80vh] object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className={"page-header text-[20px]"}>Chỉnh sửa bài viết</DialogTitle>
          </DialogHeader>
          <div className="">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nội dung bài viết</label>
              <textarea
                value={editedPostContent}
                onChange={(e) => setEditedPostContent(e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Thú cưng được gắn thẻ</label>
              {Array.isArray(editedTaggedPets) && editedTaggedPets.length > 0 ? (
                <div className="space-y-2">
                  {editedTaggedPets.map((pet) => (
                    <div key={pet.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      <Avatar className="!w-10 !h-10">
                        <AvatarImage src={pet.avatar_url || pet.avatar} alt={pet.name} />
                        <AvatarFallback className="bg-black text-white">
                          {pet.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{pet.name}</div>
                        <div className="text-sm text-gray-500">{pet.breed || 'Chưa xác định'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có thú cưng nào được gắn thẻ</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              onClick={handleEditPost}
              disabled={isLoadingEdit || !editedPostContent.trim() || !hasContentChanged}
              className="bg-[#91114D] text-white hover:bg-[#91114D]/85 rounded-full disabled:opacity-50"
            >
              {isLoadingEdit ? (
                <div className="flex items-center">
                  <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                  <span>Đang thực hiện</span>
                </div>
              ) : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onInteractOutside={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="page-header text-[22px]">Xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể được hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isLoadingDelete}
              className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full"
            >
              {isLoadingDelete ? (
                <span className="flex items-center justify-center">
                  <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                  Đang xóa
                </span>
              ) : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={isDeleteCommentDialogOpen} onOpenChange={setIsDeleteCommentDialogOpen}>
        <AlertDialogContent onInteractOutside={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể được hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentId && handleDeleteComment(deleteCommentId)}
              disabled={isLoadingDeleteComment}
              className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full"
            >
              {isLoadingDeleteComment ? (
                <div className="flex items-center">
                  <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                  <span>Đang thực hiện</span>
                </div>
              ) : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}