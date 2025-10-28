import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';

export default function AdminPostsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - in a real app this would come from an API
  const posts = [
    { id: 1, title: "Chia sẻ kinh nghiệm nuôi mèo", author: "Nguyễn Văn A", date: "2023-05-15", status: "Published", reports: 0 },
    { id: 2, title: "Hướng dẫn chăm sóc chó cảnh", author: "Trần Thị B", date: "2023-05-18", status: "Published", reports: 2 },
    { id: 3, title: "Các giống mèo phổ biến tại Việt Nam", author: "Lê Văn C", date: "2023-05-20", status: "Draft", reports: 0 },
    { id: 4, title: "Dinh dưỡng cho thú cưng", author: "Phạm Thị D", date: "2023-05-22", status: "Published", reports: 5 },
    { id: 5, title: "Cách huấn luyện chó con", author: "Hoàng Văn E", date: "2023-05-25", status: "Published", reports: 1 },
  ];

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bài viết</h1>
          <p className="text-muted-foreground">Quản lý và giám sát bài viết trong hệ thống</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm bài viết
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Lọc</Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tiêu đề</th>
                  <th className="text-left py-3 px-4">Tác giả</th>
                  <th className="text-left py-3 px-4">Ngày đăng</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Báo cáo
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium max-w-xs truncate">{post.title}</td>
                    <td className="py-3 px-4">{post.author}</td>
                    <td className="py-3 px-4">{post.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'Published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.reports > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {post.reports}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}