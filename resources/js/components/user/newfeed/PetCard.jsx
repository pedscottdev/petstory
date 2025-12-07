import React from 'react';
import { Heart, HeartOff, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, VenetianMask } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const PetCard = ({ pet, onLike, onView, onEdit, onDelete, isMyPet = false, isLoading = false }) => {
  const navigate = useNavigate();
  
  // If isLoading is true, render the skeleton
  if (isLoading) {
    return (
      <Card className="rounded-3xl shadow-none border border-gray-300 pt-3 overflow-hidden gap-y-4">
        <CardHeader className="px-3">
          <div className="relative bg-gradient-to-b from-[#f2eef0] via-[#fffbfd] to-white rounded-xl h-32 pt-12 flex items-center justify-center">
            <Skeleton className="w-28 h-28 rounded-full bg-gray-300" />
            <div className="absolute top-0 right-3 mt-3">
              <Skeleton className="h-5 w-20 rounded-full bg-gray-300" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pb-0 px-6 pt-0">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-8 w-32 bg-gray-300" />
            <Skeleton className="h-6 w-20 rounded-full bg-gray-300" />
          </div>
          <Skeleton className="h-10 w-full mt-3 bg-gray-300" />
          
          {/* Pet information grid */}
          <div className="bg-gray-100 py-3 rounded-lg flex items-center justify-between gap-2 text-center text-sm mt-3 px-6">
            <div className='w-fit text-nowrap'>
              <Skeleton className="h-5 w-16 mx-auto bg-gray-300" />
              <Skeleton className="h-3 w-12 mx-auto mt-1 bg-gray-300" />
            </div>
            <div>
              <Skeleton className="h-5 w-12 mx-auto bg-gray-300" />
              <Skeleton className="h-3 w-16 mx-auto mt-1 bg-gray-300" />
            </div>
            <div>
              <Skeleton className="h-5 w-16 mx-auto bg-gray-300" />
              <Skeleton className="h-3 w-16 mx-auto mt-1 bg-gray-300" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="w-full flex justify-between p-4 py-0 mt-2">
          <div className="w-full grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-full bg-gray-300" />
            <Skeleton className="h-10 rounded-full bg-gray-300" />
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  const handleLike = (petId) => {
    onLike(petId);
    toast.success(pet.isLiked ? 'Bạn đã hủy thích thú cưng' : 'Bạn đã thích thú cưng');
  };

  const handleViewGuardian = (ownerId) => {
    navigate(`/profile/${ownerId}`);
  };

  return (
    <Card key={pet._id} className="rounded-3xl shadow-none border border-gray-300 pt-3 overflow-hidden gap-y-4">
      <CardHeader className="px-3">
        <div className="relative bg-gradient-to-b from-[#f2eef0] via-[#fffbfd] to-white rounded-xl h-32 pt-12 flex items-center justify-center">
          <Avatar className="w-28 h-28   ">
            <AvatarImage src={pet.avatar_url} alt={pet.name} className={"object-cover"}/>
            <AvatarFallback className="text-2xl bg-black text-white">
              {pet.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute top-0 right-3 mt-3 text-sm font-semibold px-2 py-0.5 bg-[#f0d8e4] rounded-lg text-[#bb065a] flex items-center">
            {/* <Heart className="h-4 w-4 mr-1 text-red-500" /> */
            }
            <span>{pet.likeCount} lượt thích</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-0 px-6 pt-0">
        <CardTitle className="flex justify-between items-center">
          <span className='page-header text-[27px] text-[#6c0937]'>{pet.name}</span>
          <span className="text-sm font-medium bg-[#f2ebe5] px-3 py-1 rounded-full">
            {pet.species == "dog" ? "Chó" : pet.species == "cat" ? "Mèo" : "Chim"}
          </span>
        </CardTitle>
        <p className="mt-3 h-10 text-sm text-gray-600 line-clamp-2">
          {pet.description || "Thú cưng này chưa có mô tả"}
        </p>

        {/* Pet information grid similar to user stats in followings page */}
        <div className="bg-gray-100 py-3 rounded-lg flex items-center justify-between gap-2 text-center text-sm mt-3 px-6">
          <div className='w-fit text-nowrap'>
            <div className="font-bold text-[16px]">{pet.breed || 'Chưa xác định'}</div>
            <div className="text-muted-foreground text-xs">Giống</div>
          </div>
          <div>
            <div className="font-bold text-[16px]">{pet.age} tháng</div>
            <div className="text-muted-foreground text-xs">Tuổi</div>
          </div>
          <div>
            <div className="font-bold text-[16px] capitalize">{pet.gender === 'male' ? 'Đực' : 'Cái'}</div>
            <div className="text-muted-foreground text-xs">Giới tính</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="w-full flex justify-between p-4 py-0">
        {isMyPet ? (
          <div className="w-full grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-full active:scale-90 transition-all duration-200"
              onClick={() => onEdit(pet)}
            >
              <Edit className="h-4 w-4" />
              Cập nhật thông tin
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-full active:scale-90 transition-all duration-200"
              onClick={() => onDelete && onDelete(pet._id)}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </Button>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-full active:scale-90 transition-all duration-200"
              onClick={() => handleViewGuardian(pet.owner_id)}
            >
              <User className="h-4 w-4" />
              Xem người giám hộ
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleLike(pet._id)}
              className={`w-full rounded-full active:scale-90 transition-all duration-200 ${pet.isLiked ? "text-red-500 hover:text-red-600" : ""}`}
            >
              {pet.isLiked ? (
                <Heart className="!h-5 !w-5 fill-current" />
              ) : (
                <Heart className="!h-5 !w-5 fill-gray-500 text-gray-500" />
              )}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PetCard;