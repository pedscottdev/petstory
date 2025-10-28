import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, UserPlus, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  // Sample data - in a real app this would come from an API
  const stats = {
    totalPosts: 1242,
    totalUsers: 5832,
    totalViolations: 42,
    newUsers: 128,
  };

  // Sample data for top users
  const topUsers = [
    { id: 1, name: "Nguyễn Văn A", followers: 1250 },
    { id: 2, name: "Trần Thị B", followers: 980 },
    { id: 3, name: "Lê Văn C", followers: 875 },
    { id: 4, name: "Phạm Thị D", followers: 760 },
    { id: 5, name: "Hoàng Văn E", followers: 650 },
  ];

  // Sample data for top pets
  const topPets = [
    { id: 1, name: "Mít", followers: 2100 },
    { id: 2, name: "Đậu", followers: 1850 },
    { id: 3, name: "Sen", followers: 1620 },
    { id: 4, name: "Mochi", followers: 1430 },
    { id: 5, name: "Bơ", followers: 1200 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        <p className="text-muted-foreground">Tổng quan về hoạt động hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tăng 12% từ tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tăng 8% từ tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt vi phạm</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViolations}</div>
            <p className="text-xs text-muted-foreground">Giảm 5% từ tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsers}</div>
            <p className="text-xs text-muted-foreground">Tuần này</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Users and Pets */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top người dùng có nhiều người theo dõi</CardTitle>
            <CardDescription>Những người dùng có ảnh hưởng nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.followers.toLocaleString()} người theo dõi
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <TrendingUp className="inline mr-1 h-4 w-4" />
                    +{Math.floor(Math.random() * 100)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pets */}
        <Card>
          <CardHeader>
            <CardTitle>Top thú cưng có nhiều người theo dõi</CardTitle>
            <CardDescription>Những thú cưng phổ biến nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPets.map((pet, index) => (
                <div key={pet.id} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pet.followers.toLocaleString()} người theo dõi
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
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