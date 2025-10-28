import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Trash2, Check, X } from 'lucide-react';

export default function AdminReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - in a real app this would come from an API
  const reports = [
    { id: 1, reporter: "Nguyễn Văn A", targetType: "Bài viết", targetTitle: "Chia sẻ kinh nghiệm nuôi mèo", reason: "Nội dung không phù hợp", date: "2023-05-15", status: "Pending" },
    { id: 2, reporter: "Trần Thị B", targetType: "Người dùng", targetTitle: "Lê Văn C", reason: "Ngôn ngữ gây hại", date: "2023-05-18", status: "Resolved" },
    { id: 3, reporter: "Phạm Thị D", targetType: "Bài viết", targetTitle: "Dinh dưỡng cho thú cưng", reason: "Thông tin sai lệch", date: "2023-05-20", status: "Pending" },
    { id: 4, reporter: "Hoàng Văn E", targetType: "Bình luận", targetTitle: "Bài viết về chăm sóc chó", reason: "Spam", date: "2023-05-22", status: "Pending" },
  ];

  const filteredReports = reports.filter(report => 
    report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResolve = (id) => {
    // In a real app, this would make an API call
    console.log(`Resolved report ${id}`);
  };

  const handleDismiss = (id) => {
    // In a real app, this would make an API call
    console.log(`Dismissed report ${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý báo cáo</h1>
        <p className="text-muted-foreground">Quản lý và xử lý các báo cáo từ người dùng</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm báo cáo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Lọc</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Người báo cáo</th>
                  <th className="text-left py-3 px-4">Loại</th>
                  <th className="text-left py-3 px-4">Đối tượng</th>
                  <th className="text-left py-3 px-4">Lý do</th>
                  <th className="text-left py-3 px-4">Ngày</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{report.reporter}</td>
                    <td className="py-3 px-4">{report.targetType}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{report.targetTitle}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{report.reason}</td>
                    <td className="py-3 px-4">{report.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {report.status === 'Pending' ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleResolve(report.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDismiss(report.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
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