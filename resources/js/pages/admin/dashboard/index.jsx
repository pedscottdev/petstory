import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BiSolidError, BiSolidFile, BiSolidUserAccount, BiSolidUserPlus } from 'react-icons/bi';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats } from '@/api/adminApi';
import { getImageUrl } from '@/utils/imageUtils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [topPets, setTopPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await getDashboardStats();
        if (response.success) {
          setStats(response.data.stats);
          setTopUsers(response.data.topUsers || []);
          setTopPets(response.data.topPets || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Không thể tải dữ liệu bảng điều khiển');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to get initials from name as fallback
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Function to render percentage change with icon
  const renderPercentChange = (percent, isPositiveGood = true) => {
    const isPositive = percent >= 0;
    const isGood = isPositiveGood ? isPositive : !isPositive;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isGood ? 'text-green-600' : 'text-red-600';

    return (
      <span className={`inline-flex items-center ${colorClass}`}>
        <Icon className="h-3 w-3 mr-1" />
        {isPositive ? '+' : ''}{percent}%
      </span>
    );
  };

  // Skeleton loading component for stats cards
  const StatsCardSkeleton = () => (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  // Skeleton loading component for top list cards
  const TopListSkeleton = () => (
    <Card className="bg-white border-gray-300 shadow-none gap-2 py-5">
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center p-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full ml-3" />
              <div className="ml-4 space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-12 ml-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-[28px] page-header">Bảng điều khiển</h1>
          <p className="text-muted-foreground text-base">Tổng quan về hoạt động hệ thống</p>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] page-header ">Bảng điều khiển</h1>
        <p className="text-muted-foreground text-base ">Tổng quan về hoạt động hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-blue-800">Tổng bài viết</CardTitle>
                <BiSolidFile className="h-6 w-6 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats?.totalPosts?.toLocaleString() || 0}</div>
                <p className="text-xs text-blue-700">
                  {renderPercentChange(stats?.postsPercentChange || 0)} từ tháng trước
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-green-800">Tổng người dùng</CardTitle>
                <BiSolidUserAccount className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{stats?.totalUsers?.toLocaleString() || 0}</div>
                <p className="text-xs text-green-700">
                  {renderPercentChange(stats?.usersPercentChange || 0)} từ tháng trước
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-red-800">Lượt vi phạm</CardTitle>
                <BiSolidError className="h-6 w-6 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{stats?.violationsThisMonth || 0}</div>
                <p className="text-xs text-red-700">
                  {renderPercentChange(stats?.violationsPercentChange || 0, false)} từ tháng trước
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-purple-800">Người dùng mới</CardTitle>
                <BiSolidUserPlus className="h-7 w-7 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{stats?.newUsersThisMonth || 0}</div>
                <p className="text-xs text-purple-700">
                  {renderPercentChange(stats?.newUsersPercentChange || 0)} từ tháng trước
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Top Users and Pets */}
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <>
            <TopListSkeleton />
            <TopListSkeleton />
          </>
        ) : (
          <>
            {/* Top Users */}
            <Card className="bg-white border-gray-300 shadow-none hover:shadow-lg transition-shadow gap-2 py-5">
              <CardHeader>
                <CardTitle className="font-bold text-xl text-blue-800">Top người dùng có nhiều người theo dõi</CardTitle>
                <CardDescription>Những người dùng có ảnh hưởng nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers.length > 0 ? (
                    topUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        {/* Rank badge with color coding */}
                        <div className={`flex h-9 w-9 items-center justify-center font-bold text-base rounded-full ${index === 0 ? 'bg-yellow-600 text-yellow-50' :
                          index === 1 ? 'bg-gray-400 text-gray-50' :
                            index === 2 ? 'bg-amber-700 text-amber-50' :
                              'bg-blue-500 text-blue-50'
                          }`}>
                          {index + 1}
                        </div>

                        {/* Avatar with network image */}
                        <div className="ml-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(user.avatar)} alt={user.name} className={"object-cover"} />
                            <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="ml-4 space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.followers?.toLocaleString() || 0} người theo dõi
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Pets */}
            <Card className="bg-white border-gray-300 shadow-none hover:shadow-lg transition-shadow gap-2 py-5">
              <CardHeader>
                <CardTitle className="font-bold text-xl text-purple-800">Top thú cưng có nhiều lượt thích</CardTitle>
                <CardDescription>Những thú cưng phổ biến nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPets.length > 0 ? (
                    topPets.map((pet, index) => (
                      <div key={pet.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        {/* Rank badge with color coding */}
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-base ${index === 0 ? 'bg-yellow-600 text-yellow-50' :
                          index === 1 ? 'bg-gray-400 text-gray-50' :
                            index === 2 ? 'bg-amber-700 text-amber-50' :
                              'bg-purple-500 text-purple-50'
                          }`}>
                          {index + 1}
                        </div>

                        {/* Avatar with network image */}
                        <div className="ml-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={getImageUrl(pet.avatar)} alt={pet.name} className={"object-cover"} />
                            <AvatarFallback className="bg-purple-100 text-purple-800 font-medium">
                              {getInitials(pet.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="ml-4 space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">{pet.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pet.likes?.toLocaleString() || 0} lượt thích
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}