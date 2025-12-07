import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { LuArrowRight } from 'react-icons/lu';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toggleFollow as toggleFollowApi } from '@/api/userApi';

export default function PeopleYouMayKnow({ people = [], isLoading, onFollowToggle }) {
  const [followingState, setFollowingState] = useState(
    people.reduce((acc, person) => {
      acc[person.id] = person.is_followed || false;
      return acc;
    }, {})
  );
  const [loadingStates, setLoadingStates] = useState({});

  const handleToggleFollow = async (userId) => {
    // Set loading state for this specific user
    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    
    try {
      const previousState = followingState[userId];
      const newFollowState = !previousState;
      
      // Optimistically update UI
      setFollowingState(prev => ({
        ...prev,
        [userId]: newFollowState
      }));

      await toggleFollowApi(userId);
      
      // Notify parent component to update following count
      if (onFollowToggle) {
        onFollowToggle(userId, newFollowState);
      }
      
      toast.success(previousState ? 'Đã hủy theo dõi' : 'Đã theo dõi');
    } catch (error) {
      // Revert on error
      setFollowingState(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      // Remove loading state
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white border-gray-300 !shadow-none !pt-4 pb-3 gap-2">
        <CardHeader className={"!mb-0 px-4"}>
          <CardTitle className="text-lg font-bold">Có thể bạn biết</CardTitle>
        </CardHeader>
        <CardContent className="px-4 space-y-4 !pt-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8.5 w-8.5 rounded-full" />
                <div className='flex-1'>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!people || people.length === 0) {
    return (
      <Card className="w-full bg-white border-gray-300 !shadow-none !pt-4 pb-3 gap-2">
        <CardHeader className={"!mb-0 px-4"}>
          <CardTitle className="text-lg font-bold">Có thể bạn biết</CardTitle>
        </CardHeader>
        <CardContent className="px-4 !pt-0">
          <p className="text-sm text-gray-500 text-center py-4">Không có gợi ý nào</p>
          <Link to="/followings">
            <button className='flex items-center gap-2 py-1 px-2 rounded-md text-[15px] font-semibold hover:cursor-pointer hover:bg-gray-50 hover:text-[#B10E5A] w-full justify-center'>
              <p>Khám phá mọi người xung quanh</p>
              <LuArrowRight size={16} />
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white border-gray-300 !shadow-none !pt-4 pb-3 gap-2">
      <CardHeader className={"!mb-0 px-4"}>
        <CardTitle className="text-lg font-bold">Có thể bạn biết</CardTitle>
      </CardHeader>
      <CardContent className="px-4 space-y-3.5 !pt-0">
        {people.map((person) => (
          <div key={person.id} className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-8.5 h-8.5">
                <AvatarImage src={person.avatar_url} alt={person.name} />
                <AvatarFallback className={"bg-primary text-primary-foreground "}>{person.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className=''>
                <div className="pb-1">
                  <p className="text-sm font-semibold">{person.last_name + ' ' + person.first_name || "Người dùng không xác định"}</p>
                  <p className="text-xs text-muted-foreground">Đề xuất cho bạn</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleFollow(person.id)}
              disabled={loadingStates[person.id]}
              className={`shadow-none bg-transparent border-none font-semibold rounded-full ${followingState[person.id] ? "text-red-700 hover:text-red-600" : "text-[#91114D] hover:text-[#B10E5A]"} ${loadingStates[person.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loadingStates[person.id] ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Đang tải...
                </span>
              ) : (
                followingState[person.id] ? 'Hủy' : 'Theo dõi'
              )}
            </Button>
          </div>
        ))}
        <Link to="/followings">
          <button className='flex items-center gap-2 py-1 px-2 rounded-md text-[15px] font-semibold hover:cursor-pointer hover:bg-gray-50 hover:text-[#B10E5A]'>
            <p>Khám phá mọi người xung quanh</p>
            <LuArrowRight size={16} />
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}