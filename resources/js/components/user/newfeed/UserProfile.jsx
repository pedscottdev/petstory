import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import defaultAvatar from '../../../../../public/images/special-avatar.png';

export default function UserProfile() {
  // Sample user data
  const user = {
    name: 'Phạm Hoàng Trọng',
    avatar: defaultAvatar,
    posts: 42,
    followers: 128,
    following: 56,
  };

  // Sample pets data
  const pets = [
    { id: 1, name: 'Buddy', type: 'Chó Pitbull', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 2, name: 'Whiskers', type: 'Chó Golden Retriever', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 3, name: 'Tweety', type: 'Vẹt Nam Mỹ', avatar: 'https://images.unsplash.com/photo-1700048802079-ec47d07f7919?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=907' },
  ];

  return (
    <Card className={' w-full bg-white border-gray-300 !shadow-none !py-5'}>
      <CardHeader className="w-full gap-3">
        <div className="flex flex-col items-start">
          <div className="p-[2.5px] bg-gradient-to-r from-[#AF0CC6] via-pink-500 to-[#FDA22B] rounded-full">
            <Avatar className="h-16 w-16 rounded-full bg-black">
              <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
              <AvatarFallback className="text-xl bg-black text-white rounded-full">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-lg font-bold pt-2">{user.name}</h3>
        </div>

        <div>
          <div className="flex mt-1 text-[13px] w-full justify-between">
            <div className='flex flex-col pr-3'>
              <span className="text-[17px] font-semibold">{user.posts}</span>
              <span className='text-gray-700'>Bài viết</span>
            </div>
            <div className='flex flex-col px-3'>
              <span className="text-[17px] font-semibold">{user.followers}</span>
              <span className='text-gray-700'>Người theo dõi</span>
            </div>
            <div className='flex flex-col pl-3'>
              <span className="text-[17px] font-semibold">{user.following}</span>
              <span className='text-gray-700'>Đang theo dõi</span>
            </div>
          </div>
        </div>
        <Button className={'w-fit rounded-full bg-[#91114D] text-white'}>Xem trang cá nhân</Button>
      </CardHeader>

      <CardContent className={'px-4 w-full'}>
        <h4 className="text-lg font-bold mb-2">Thú cưng của bạn</h4>
        <div className="flex flex-col gap-3">
          {pets.map((pet) => (
            <div key={pet.id} className="flex items-center space-x-3">
              <Avatar className={'w-10 h-10'}>
                <AvatarImage src={pet.avatar} alt={pet.name} className={'object-cover'} />
                <AvatarFallback className={'text-white bg-black'}>{pet.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="">
                <p className="font-semibold text-sm mt-1">{pet.name}</p>
                <p className="text-xs mt-1">{pet.type}</p>
              </div>

            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}