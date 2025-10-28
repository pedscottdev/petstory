import React, { useState } from 'react';
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

export default function PostItem({ post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: { name: 'Nguyễn Văn A', avatar: '' },
      content: 'Bài viết rất hay!',
      time: '2 giờ trước',
      likes: 5,
      replies: [
        {
          id: 11,
          user: { name: 'Trần Thị B', avatar: '' },
          content: 'Mình cũng nghĩ vậy',
          time: '1 giờ trước',
          likes: 2,
          replies: []
        }
      ]
    },
    {
      id: 2,
      user: { name: 'Lê Văn C', avatar: '' },
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
    <div key={comment.id} className={`flex gap-3 ${isNested ? 'ml-10 mt-2' : 'mt-4'}`}>
      <Avatar className="!w-8 !h-8">
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback className="bg-black text-white text-xs">
          {comment.user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-[#E6DDD5] rounded-2xl px-3 py-2">
          <p className="font-semibold text-sm">{comment.user.name}</p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
          <button className="hover:underline">Thích</button>
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

  return (
    <Card className="w-full mb-4 bg-white !shadow-none gap-2 py-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
        <div className="flex items-center gap-2">
          <Avatar className={"!w-11 !h-11"}>
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback className={"bg-black text-white"}>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className='text-[16px]'><span className='font-semibold'>{post.user.name}</span> đang ở cùng với <span className='font-semibold'>Nina</span></p>
            <p className="text-xs text-muted-foreground">{post.time}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="!h-5 !w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent >
            <DropdownMenuItem>
              <span className="text-red-500">Report</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Hide Post</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className={"px-4"}>
        <p className="text-[15px]">{post.content}</p>

        {post.image ? (
          <div className="mt-3">
            <img
              src={post.image}
              alt="Post content"
              className="w-full rounded-lg object-cover max-h-86"
            />
          </div>
        ) : (
          null
        )}
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
          <div className="w-full border-t border-[#e1d6ca] pt-3">
            {comments.map(comment => renderComment(comment))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}