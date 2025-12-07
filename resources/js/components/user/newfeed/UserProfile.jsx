import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import defaultAvatar from '../../../../../public/images/special-avatar.png';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/utils/imageUtils';

export default function UserProfile({ userData, isLoading }) {
  const { user: authUser } = useAuth();

  if (isLoading) {
    return (
      <Card className={'w-full bg-white border-gray-300 !shadow-none !py-5'}>
        <CardHeader className="w-full gap-3">
          <div className="flex flex-col items-start">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-32 mt-2" />
          </div>
          <div>
            <div className="flex mt-1 text-[13px] w-full justify-between">
              <div className='flex flex-col pr-3'>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
              <div className='flex flex-col px-3'>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-20 mt-1" />
              </div>
              <div className='flex flex-col pl-3'>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-20 mt-1" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </CardHeader>
        <CardContent className={'px-4 w-full'}>
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const user = userData || {};
  const pets = user.pets || [];

  return (
    <Card className={' w-full bg-white border-gray-300 !shadow-none !py-5'}>
      <CardHeader className="w-full gap-3">
        <div className="flex flex-col items-start">
          <div className="p-[2.5px] bg-gradient-to-r from-[#AF0CC6] via-pink-500 to-[#FDA22B] rounded-full">
            <Avatar className="h-16 w-16 rounded-full bg-black">
              <AvatarImage src={getImageUrl(user.avatar_url) || defaultAvatar} alt={user.name} className="rounded-full object-cover" />
              <AvatarFallback className="text-xl bg-black text-white rounded-full">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-lg font-bold pt-2">{user.name || 'Người dùng không xác định'}</h3>
        </div>

        <div>
          <div className="flex mt-1 text-[13px] w-full justify-between">
            <div className='flex flex-col pr-3'>
              <span className="text-[17px] font-semibold">{user.posts_count || 0}</span>
              <span className='text-gray-700'>Bài viết</span>
            </div>
            <div className='flex flex-col px-3'>
              <span className="text-[17px] font-semibold">{user.followers_count || 0}</span>
              <span className='text-gray-700'>Người theo dõi</span>
            </div>
            <div className='flex flex-col pl-3'>
              <span className="text-[17px] font-semibold">{user.following_count || 0}</span>
              <span className='text-gray-700'>Đang theo dõi</span>
            </div>
          </div>
        </div>
        <Link to={`/profile/${authUser?.id}`}>
          <Button className={'w-fit rounded-full bg-[#91114D] text-white hover:bg-[#B10E5A]'}>Xem trang cá nhân</Button>
        </Link>
      </CardHeader>

      <CardContent className={'px-4 w-full'}>
        <h4 className="text-lg font-bold mb-2">Thú cưng của bạn</h4>
        {pets.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pets.map((pet) => (
              <div key={pet.id} className="flex items-center space-x-3">
                <Avatar className={'w-10 h-10'}>
                  <AvatarImage src={getImageUrl(pet.avatar_url)} alt={pet.name} className={'object-cover'} />
                  <AvatarFallback className={'text-white bg-black'}>{pet.name?.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <div className="">
                  <p className="font-semibold  mt-1">{pet.name}</p>
                  <p className="text-xs">{pet.breed || pet.species || 'Chưa xác định'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có thú cưng nào</p>
        )}
      </CardContent>
    </Card>
  );
}