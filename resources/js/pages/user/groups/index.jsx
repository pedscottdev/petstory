import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, MessageSquare, Heart, Bell, Eye, Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState('discover');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    activity: '',
    memberCount: '',
  });

  // Sample data for groups with specific cover images
  const sampleGroups = [
    {
      id: 1,
      name: "Cộng đồng chó Golden Retriever Việt Nam",
      members: 1250,
      posts: 42,
      activity: "Cao",
      role: "Quản trị",
      coverImage: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Trần Văn Nam",
        content: "Chia sẻ kinh nghiệm chăm sóc Golden Retriever khi thời tiết chuyển mùa...",
        likes: 24,
        comments: 8,
        time: "2 giờ trước"
      }
    },
    {
      id: 2,
      name: "Mèo Anh lông ngắn - British Shorthair",
      members: 890,
      posts: 28,
      activity: "TB",
      role: "Thành viên",
      coverImage: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Nguyễn Thị Mai",
        content: "Giới thiệu chú mèo British Shorthair của mình, tên là Mít Ướt...",
        likes: 15,
        comments: 3,
        time: "5 giờ trước"
      }
    },
    {
      id: 3,
      name: "Chăm sóc thú cưng cho người mới bắt đầu",
      members: 3420,
      posts: 126,
      activity: "Cao",
      role: "Điều hành",
      coverImage: "https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Lê Minh Đức",
        content: "Tổng hợp các lỗi phổ biến khi nuôi thú cưng lần đầu và cách khắc phục...",
        likes: 56,
        comments: 12,
        time: "1 ngày trước"
      }
    }
  ];

  // Filter groups based on selected filters
  const filteredGroups = sampleGroups.filter(group => {
    if (filters.category && !group.name.toLowerCase().includes(filters.category.toLowerCase())) {
      return false;
    }
    if (filters.activity && group.activity !== filters.activity) {
      return false;
    }
    if (filters.memberCount) {
      switch (filters.memberCount) {
        case 'small':
          if (group.members >= 100) return false;
          break;
        case 'medium':
          if (group.members < 100 || group.members >= 1000) return false;
          break;
        case 'large':
          if (group.members < 1000) return false;
          break;
        default:
          break;
      }
    }
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: '',
      activity: '',
      memberCount: '',
    });
  };

  // Handle create group form submission
  const handleCreateGroup = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Creating new group');
    setIsCreateGroupOpen(false);
  };

  return (
    <div className='bg-[#f5f3f0] min-h-screen py-8 pt-8'>
      <div className="w-full px-32">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="mb-4">
            <h1 className="text-4xl font-black  mb-2 page-header">Nhóm và cộng đồng</h1>
            <p className="text-gray-600">Kết nối với những người yêu thú cưng cùng sở thích và chia sẻ kinh nghiệm.</p>
          </div>
          <Button
            className="bg-[#91114D] hover:bg-[#7a0e41] text-white rounded-full text-[16px] px-4 py-2"
            onClick={() => setIsCreateGroupOpen(true)}
            size={"lg"}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo nhóm mới
          </Button>
        </div>


        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <div className="flex justify-between items-center">
            <TabsList className="bg-[#E6E4E0] p-1 rounded-lg">
              <TabsTrigger
                value="discover"
                className="px-4 py-2 data-[state=active]:bg-[#91114D] data-[state=active]:text-white"
              >
                Khám phá
              </TabsTrigger>
              <TabsTrigger
                value="my-groups"
                className="px-4 py-2 data-[state=active]:bg-[#91114D] data-[state=active]:text-white"
              >
                Nhóm của tôi
              </TabsTrigger>
            </TabsList>

            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tạo nhóm mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        Tên nhóm
                      </label>
                      <Input
                        id="name"
                        placeholder="Tên nhóm của bạn"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="description" className="text-right">
                        Mô tả
                      </label>
                      <textarea
                        id="description"
                        placeholder="Mô tả nhóm"
                        className="col-span-3 border rounded-md p-2"
                        rows="3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="category" className="text-right">
                        Danh mục
                      </label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dogs">Chó</SelectItem>
                          <SelectItem value="cats">Mèo</SelectItem>
                          <SelectItem value="birds">Chim</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                      Hủy
                    </Button>
                    <Button type="submit">Tạo nhóm</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Discover Tab Content */}
          <TabsContent value="discover" className="mt-2">
            {/* Filters */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Danh mục</label>
                  <Input
                    placeholder="Tìm theo danh mục..."
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Mức độ hoạt động</label>
                  <Select value={filters.activity} onValueChange={(value) => handleFilterChange('activity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cao">Cao</SelectItem>
                      <SelectItem value="TB">Trung bình</SelectItem>
                      <SelectItem value="Thấp">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Số lượng thành viên</label>
                  <Select value={filters.memberCount} onValueChange={(value) => handleFilterChange('memberCount', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phạm vi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Dưới 100</SelectItem>
                      <SelectItem value="medium">100 - 1000</SelectItem>
                      <SelectItem value="large">Trên 1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Đặt lại
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>

          {/* My Groups Tab Content */}
          <TabsContent value="my-groups" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleGroups.slice(0, 2).map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Group Card Component
function GroupCard({ group }) {
  return (
    <Card className="pt-0 overflow-hidden rounded-xl border border-gray-300 hover:shadow-md transition-shadow">
      {/* Cover Image */}
      <div className="p-4 pb-0 relative">
        <img
          src={group.coverImage}
          alt={group.name}
          className="rounded-lg h-48 w-full object-cover"
          onError={(e) => {
            // Fallback to a default stock image if the provided image fails to load
            e.target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80";
          }}
        />
      </div>

      <CardHeader className="!px-4">
        <CardTitle className="!px-0 text-lg font-semibold line-clamp-2">{group.name}</CardTitle>

        {/* Group Stats */}
        <div className="flex items-center text-sm text-gray-600">
          <div className="flex items-center mr-4">
            <Users className="h-4 w-4 mr-1" />
            <span>{group.members}</span>
          </div>
          <div className="flex items-center mr-4">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{group.posts} bài mới</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span>{group.activity}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Latest Activity */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-start">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="text-xs">{group.latestPost.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{group.latestPost.author} đã đăng bài mới</p>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{group.latestPost.content}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" size="sm" className="rounded-full">
            <Bell className="h-4 w-4 mr-1" />
            Thông báo
          </Button>
          <Button asChild size="sm" className="rounded-full bg-[#91114D] hover:bg-[#7a0e41]">
            <Link to={`/groups/${group.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              Xem chi tiết
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}