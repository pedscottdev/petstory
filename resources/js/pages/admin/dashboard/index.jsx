import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, UserPlus, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BiSolidError, BiSolidFile, BiSolidUserAccount, BiSolidUserPlus } from 'react-icons/bi';

export default function AdminDashboardPage() {
  // Sample data - in a real app this would come from an API
  const stats = {
    totalPosts: 1242,
    totalUsers: 5832,
    totalViolations: 42,
    newUsers: 128,
  };

  // Sample data for top users with avatar images
  const topUsers = [
    { 
      id: 1, 
      name: "Nguyễn Văn An", 
      followers: 1250, 
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 2, 
      name: "Trần Thị Bình", 
      followers: 980, 
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 3, 
      name: "Lê Văn Cường", 
      followers: 875, 
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 4, 
      name: "Phạm Thị Dung", 
      followers: 760, 
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 5, 
      name: "Hoàng Văn Em", 
      followers: 650, 
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" 
    },
  ];

  // Sample data for top pets with avatar images
  const topPets = [
    { 
      id: 1, 
      name: "Mít", 
      followers: 2100, 
      avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 2, 
      name: "Đậu", 
      followers: 1850, 
      avatar: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 3, 
      name: "Sen", 
      followers: 1620, 
      avatar: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 4, 
      name: "Mochi", 
      followers: 1430, 
      avatar: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=200&auto=format&fit=crop" 
    },
    { 
      id: 5, 
      name: "Bơ", 
      followers: 1200, 
      avatar: "https://images.unsplash.com/photo-1495360010543-f20fc5d58d4e?q=80&w=200&auto=format&fit=crop" 
    },
  ];

  // Function to get initials from name as fallback
  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] page-header ">Bảng điều khiển</h1>
        <p className="text-muted-foreground text-base ">Tổng quan về hoạt động hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-blue-800">Tổng bài viết</CardTitle>
            <BiSolidFile className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-blue-700">Tăng 12% từ tháng trước</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-green-800">Tổng người dùng</CardTitle>
            <BiSolidUserAccount className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-700">Tăng 8% từ tháng trước</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-red-800">Lượt vi phạm</CardTitle>
            <BiSolidError className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.totalViolations}</div>
            <p className="text-xs text-red-700">Giảm 5% từ tháng trước</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-purple-800">Người dùng mới</CardTitle>
            <BiSolidUserPlus className="h-7 w-7 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.newUsers}</div>
            <p className="text-xs text-purple-700">Tuần này</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Users and Pets */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Users */}
        <Card className="bg-white border-gray-300 shadow-none hover:shadow-lg transition-shadow gap-2 py-5">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-blue-800">Top người dùng có nhiều người theo dõi</CardTitle>
            <CardDescription>Những người dùng có ảnh hưởng nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Rank badge with color coding */}
                  <div className={`flex h-9 w-9 items-center justify-center font-bold text-base rounded-full ${
                    index === 0 ? 'bg-yellow-600 text-yellow-50' : 
                    index === 1 ? 'bg-gray-400 text-gray-50' : 
                    index === 2 ? 'bg-amber-700 text-amber-50' : 
                    'bg-blue-500 text-blue-50'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Avatar with network image */}
                  <div className="ml-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} className={"object-cover"}/>
                      <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.followers.toLocaleString()} người theo dõi
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-green-600">
                    <TrendingUp className="inline mr-1 h-4 w-4" />
                    +{Math.floor(Math.random() * 100)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pets */}
        <Card className="bg-white border-gray-300 shadow-none hover:shadow-lg transition-shadow gap-2 py-5">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-purple-800">Top thú cưng có nhiều người theo dõi</CardTitle>
            <CardDescription>Những thú cưng phổ biến nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPets.map((pet, index) => (
                <div key={pet.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Rank badge with color coding */}
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-base ${
                    index === 0 ? 'bg-yellow-600 text-yellow-50' : 
                    index === 1 ? 'bg-gray-400 text-gray-50' : 
                    index === 2 ? 'bg-amber-700 text-amber-50' : 
                    'bg-purple-500 text-purple-50'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Avatar with network image */}
                  <div className="ml-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={pet.avatar} alt={pet.name} className={"object-cover"}/>
                      <AvatarFallback className="bg-purple-100 text-purple-800 font-medium">
                        {getInitials(pet.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pet.followers.toLocaleString()} người theo dõi
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-green-600">
                    <TrendingUp className="inline mr-1 h-4 w-4" />
                    +{Math.floor(Math.random() * 100)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}