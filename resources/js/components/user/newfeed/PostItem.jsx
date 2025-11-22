import React, { useState } from 'react';
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
  Reply
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function PostItem({ post }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [customReportReason, setCustomReportReason] = useState('');
  const [editedPostContent, setEditedPostContent] = useState(post.content);
  const [editedTaggedPets, setEditedTaggedPets] = useState(post.pets || []);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [comments, setComments] = useState([
    {
      id: 1,
      user: {
        name: 'Triều Dương',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      content: 'Bài viết rất hay!',
      time: '2 giờ trước',
      likes: 5,
      replies: [
        {
          id: 11,
          user: {
            name: 'Cao Hải Lan',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop'
          },
          content: 'Mình cũng nghĩ vậy',
          time: '1 giờ trước',
          likes: 2,
          replies: []
        }
      ]
    },
    {
      id: 2,
      user: {
        name: 'Lê Văn Linh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      content: 'Cảm ơn bạn đã chia sẻ',
      time: '1 giờ trước',
      likes: 3,
      replies: []
    }
  ]);

  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      // Create new comment object
      const newComment = {
        id: comments.length + 1,
        user: { name: 'Bạn', avatar: '' }, // In a real app, this would be the current user
        content: comment,
        time: 'vừa xong',
        likes: 0,
        replies: []
      };

      // Add new comment to the comments array
      setComments([...comments, newComment]);

      // Clear the comment input
      setComment('');

      // Show comments if they were hidden
      setShowComments(true);
    }
  };

  const handleReplySubmit = (e, parentId) => {
    e.preventDefault();
    if (replyText.trim()) {
      // In a real app, you would add the reply to the backend and update the state
      console.log('Reply submitted:', replyText, 'to comment:', parentId);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText('');
  };

  const renderComment = (comment, isNested = false) => (
    <div key={comment.id} className={`flex gap-3 ${isNested ? 'ml-10 mt-2' : 'mt-2'}`}>
      <Avatar className="!w-9 !h-9">
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback className="bg-black text-white text-xs">
          {comment.user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-[#ececec] rounded-2xl px-3 py-2">
          <p className="font-semibold text-sm">{comment.user.name}</p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
          <button className="hover:underline">Xóa bình luận</button>
          <button
            className="hover:underline"
            onClick={() => handleReplyClick(comment.id)}
          >
            Phản hồi
          </button>
          <span>{comment.time}</span>
        </div>

        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="flex gap-2 mt-2">
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

        {/* Render replies (max 2 levels) */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
      </div>
    </div>
  );

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

  // Function to handle reporting a post
  const handleReportPost = () => {
    const reason = reportReason === 'other' ? customReportReason : reportReason;
    console.log('Post reported:', { postId: post.id, reason });
    toast.success('Báo cáo đã được gửi thành công');
    setIsReportDialogOpen(false);
    setReportReason('');
    setCustomReportReason('');
  };

  // Function to handle editing a post
  const handleEditPost = () => {
    console.log('Post edited:', {
      postId: post.id,
      content: editedPostContent,
      taggedPets: editedTaggedPets
    });
    toast.success('Bài viết đã được cập nhật thành công');
    setIsEditDialogOpen(false);
  };

  // Function to handle hiding a post
  const handleHidePost = () => {
    console.log('Post hidden:', post.id);
    toast.success('Bài viết đã được ẩn thành công');
  };

  return (
    <Card className="w-full mb-4 bg-white !shadow-none gap-2 py-4">
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
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <span className="font-medium ">Chỉnh sửa bài viết</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleHidePost}>
              <span className="font-medium ">Ẩn bài viết</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
              <span className="font-medium text-red-500">Báo cáo bài viết</span>
            </DropdownMenuItem>
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
              className="group transition-all active:scale-105 duration-300 text-[15px] hover:cursor-pointer"
              onClick={handleLike}
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
            <p className='font-medium'>{post.comments}</p>
          </button>
          {/* All pets */}
          <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
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
            <DialogContent className="sm:max-w-[425px]">
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
          />
          <Button
            type="submit"
            className={"w-9 h-9 rounded-full bg-[#91114D] hover:bg-[#91114D]/85"}
            size="sm"
            disabled={!comment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Comments section - initially hidden, shown when user clicks comment button */}
        {showComments && (
          <div className="w-full border-t border-[#e1d6ca] pt-1">
            {comments.map(comment => renderComment(comment))}
          </div>
        )}
      </CardFooter>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={"page-header text-[20px]"}>Báo cáo bài viết</DialogTitle>
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
                  <span>Ngôn từ thù ghét / quấy rối</span>
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
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              onClick={handleReportPost}
              disabled={!reportReason || (reportReason === 'other' && !customReportReason.trim())}
              className="bg-[#91114D] text-white hover:bg-[#91114D]/85"
            >
              Gửi báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Carousel Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent  className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] p-0 overflow-hidden backdrop:blur">
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
        <DialogContent className="sm:max-w-[500px]">
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
            >
              Hủy
            </Button>
            <Button
              onClick={handleEditPost}
              className="bg-[#91114D] text-white hover:bg-[#91114D]/85"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}