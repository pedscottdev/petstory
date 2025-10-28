import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ArrowBigRight } from 'lucide-react';
import { TbArrowNarrowRight } from 'react-icons/tb';
import { LuArrowRight } from 'react-icons/lu';

export default function PeopleYouMayKnow() {
  const [people] = useState([
    { id: 1, name: 'Nguyễn Cao Thảo Nhi', avatar: 'https://i.pravatar.cc/150?img=1', isFollowing: false },
    { id: 2, name: 'Đào Vân Trang', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
    { id: 3, name: 'Nguyễn Hoàng Ngọc', avatar: 'https://i.pravatar.cc/150?img=9', isFollowing: false },
    { id: 4, name: 'Lưu Cường Tâm', avatar: 'https://i.pravatar.cc/150?img=12', isFollowing: false },
    { id: 5, name: 'Ngụy Mộng Thư', avatar: 'https://i.pravatar.cc/150?img=20', isFollowing: true },
  ]);

  const [followingState, setFollowingState] = useState(
    people.reduce((acc, person) => {
      acc[person.id] = person.isFollowing;
      return acc;
    }, {})
  );

  const toggleFollow = (id) => {
    setFollowingState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    toast.success(followingState[id] ? 'Đã hủy theo dõi' : 'Đã theo dõi');
  };

  return (
    <Card className="w-full bg-white border-gray-300 !shadow-none !pt-4 pb-3 gap-2">
      <CardHeader className={"!mb-0 px-4"}>
        <CardTitle className="text-lg font-bold">Có thể bạn biết</CardTitle>
      </CardHeader>
      <CardContent className="px-4 space-y-4 !pt-0">
        {people.map((person) => (
          <div key={person.id} className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-8.5 h-8.5">
                <AvatarImage src={person.avatar} alt={person.name} />
                <AvatarFallback className={"bg-primary text-primary-foreground "}>{person.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className=''>
                <div className="pb-1">
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-muted-foreground">Đề xuất cho bạn</p>
                </div>
              </div>
            </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFollow(person.id)}
                  className={`shadow-none bg-transparent border-none font-semibold rounded-full ${followingState[person.id] ? "text-red-700 hover:text-red-600" : "text-[#91114D] hover:text-[#B10E5A]"}`}
                >
                  {followingState[person.id] ? 'Hủy' : 'Theo dõi'}
                </Button>
          </div>
        ))}
        <button  className='flex items-center gap-2 py-1 px-2 rounded-md text-[15px] font-semibold hover:cursor-pointer hover:bg-gray-50 hover:text-[#B10E5A]'>
          <p>Xem tất cả gợi ý</p>
          <LuArrowRight size={16} />
        </button>
      </CardContent>
    </Card>
  );
}