"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Eye, Check, X } from "lucide-react"
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from 'lucide-react'

// Sample data - in a real app this would come from an API
const initialReports = [
  { id: 1, reporter: "Nguyễn Văn A", targetType: "Bài viết", targetTitle: "Chia sẻ kinh nghiệm nuôi mèo", reason: "Nội dung không phù hợp", date: "2023-05-15", status: "Pending" },
  { id: 2, reporter: "Trần Thị B", targetType: "Người dùng", targetTitle: "Lê Văn C", reason: "Ngôn ngữ gây hại", date: "2023-05-18", status: "Resolved" },
  { id: 3, reporter: "Phạm Thị D", targetType: "Bài viết", targetTitle: "Dinh dưỡng cho thú cưng", reason: "Thông tin sai lệch", date: "2023-05-20", status: "Pending" },
  { id: 4, reporter: "Hoàng Văn E", targetType: "Bài viết", targetTitle: "Chăm sóc mèo", reason: "Spam", date: "2023-05-22", status: "Pending" },
  { id: 5, reporter: "Vũ Thị Hoa", targetType: "Bài viết", targetTitle: "Cách huấn luyện chó", reason: "Thông tin sai lệch", date: "2023-05-25", status: "Resolved" },
  { id: 6, reporter: "Đỗ Văn Giang", targetType: "Người dùng", targetTitle: "Ngô Thị Hằng", reason: "Ngôn ngữ gây hại", date: "2023-05-28", status: "Pending" },
  { id: 7, reporter: "Lý Văn Khánh", targetType: "Bài viết", targetTitle: "Thức ăn cho thú cưng", reason: "Nội dung không phù hợp", date: "2023-06-01", status: "Pending" },
  { id: 8, reporter: "Phan Thị Lan", targetType: "Bài viết", targetTitle: "Chăm sóc chó cảnh", reason: "Thông tin sai lệch", date: "2023-06-03", status: "Resolved" },
]

// Sample post data for detail view
const samplePosts = [
  { 
    id: 1, 
    title: "Chia sẻ kinh nghiệm nuôi mèo", 
    author: "Nguyễn Văn A", 
    email: "nguyenvana@example.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    date: "2023-05-15", 
    status: "Published", 
    reports: 0,
    blocked: false,
    content: "Chia sẻ kinh nghiệm nuôi mèo cảnh tại nhà. Đây là một trải nghiệm tuyệt vời khi nuôi mèo cảnh. Chúng rất đáng yêu và thân thiện với con người.",
    user: {
      name: "Nguyễn Văn A",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
    },
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=400&auto=format&fit=crop"
    ],
    pets: [
      { id: 1, name: "Mít", breed: "Mèo Anh lông ngắn", avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop" },
      { id: 2, name: "Đậu", breed: "Mèo ta", avatar: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=200&auto=format&fit=crop" }
    ],
    likes: 24,
    comments: 8
  },
  { 
    id: 2, 
    title: "Hướng dẫn chăm sóc chó cảnh", 
    author: "Trần Thị B", 
    email: "tranthib@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    date: "2023-05-18", 
    status: "Published", 
    reports: 2,
    blocked: true,
    content: "Hướng dẫn chi tiết cách chăm sóc chó cảnh đúng cách. Từ việc tắm rửa, cho ăn đến dắt đi dạo.",
    user: {
      name: "Trần Thị B",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
    },
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&auto=format&fit=crop"
    ],
    pets: [
      { id: 3, name: "Vàng", breed: "Golden Retriever", avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop" }
    ],
    likes: 42,
    comments: 15
  },
  { 
    id: 3, 
    title: "Dinh dưỡng cho thú cưng", 
    author: "Phạm Thị D", 
    email: "phamthid@example.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    date: "2023-05-22", 
    status: "Published", 
    reports: 5,
    blocked: false,
    content: "Chế độ dinh dưỡng hợp lý cho thú cưng. Cách chọn thực phẩm phù hợp với từng loại vật nuôi.",
    user: {
      name: "Phạm Thị D",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
    },
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583337241124-45506a8f2c74?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583336663277-620dc1996580?q=80&w=400&auto=format&fit=crop"
    ],
    pets: [
      { id: 4, name: "Bơ", breed: "Hedgehog", avatar: "https://images.unsplash.com/photo-1583336663277-620dc1996580?q=80&w=200&auto=format&fit=crop" }
    ],
    likes: 18,
    comments: 3
  },
  { 
    id: 4, 
    title: "Cách huấn luyện chó con", 
    author: "Hoàng Văn E", 
    email: "hoangvane@example.com",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
    date: "2023-05-25", 
    status: "Published", 
    reports: 1,
    blocked: false,
    content: "Những phương pháp huấn luyện chó con hiệu quả. Hướng dẫn từng bước cụ thể để huấn luyện chó.",
    user: {
      name: "Hoàng Văn E",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
    },
    images: [],
    pets: [],
    likes: 31,
    comments: 12
  },
]

export default function AdminReportsPage() {
  const [reports, setReports] = React.useState(initialReports)
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [selectedPost, setSelectedPost] = React.useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)

  // Function to resolve a report
  const handleResolve = (id) => {
    setReports(prevReports =>
      prevReports.map(report => {
        if (report.id === id) {
          toast.success(`Báo cáo từ ${report.reporter} đã được xử lý thành công`)
          return { ...report, status: "Resolved" }
        }
        return report
      })
    )
  }

  // Function to dismiss a report
  const handleDismiss = (id) => {
    setReports(prevReports =>
      prevReports.map(report => {
        if (report.id === id) {
          toast.success(`Báo cáo từ ${report.reporter} đã được bỏ qua`)
          return { ...report, status: "Dismissed" }
        }
        return report
      })
    )
  }

  // Function to view post details
  const handleViewPostDetail = (postTitle) => {
    const post = samplePosts.find(p => p.title === postTitle);
    if (post) {
      setSelectedPost(post);
      setIsViewDialogOpen(true);
    }
  }

  // Function to view user profile
  const handleViewUserProfile = (userName) => {
    // In a real app, you would find the user ID by userName
    // For now, we'll just open a new tab with a placeholder URL
    window.open(`/profile/${userName}`, '_blank');
  }

  // Define columns for the table
  const columns = [
    {
      accessorKey: "reporter",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Người báo cáo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("reporter")}</div>,
    },
    {
      accessorKey: "targetType",
      header: "Loại",
      cell: ({ row }) => <div>{row.getValue("targetType")}</div>,
    },
    {
      accessorKey: "targetTitle",
      header: "Đối tượng",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.getValue("targetTitle")}
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Lý do",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.getValue("reason")}
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ngày
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="capitalize">
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.original.status === 'Pending' 
              ? 'bg-yellow-100 text-yellow-800' 
              : row.original.status === 'Resolved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {row.original.status === 'Pending' 
              ? 'Chờ xử lý' 
              : row.original.status === 'Resolved'
                ? 'Đã xử lý'
                : 'Đã bỏ qua'}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Hành động",
      enableHiding: false,
      cell: ({ row }) => {
        const report = row.original

        return (
          <div className="flex gap-2">
            {report.status === 'Pending' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => handleResolve(report.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                {report.targetType === "Bài viết" ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewPostDetail(report.targetTitle)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewUserProfile(report.targetTitle)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              // For non-pending reports, only show the view button
              report.targetType === "Bài viết" ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewPostDetail(report.targetTitle)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewUserProfile(report.targetTitle)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )
            )}
          </div>
        )
      },
    },
  ]

  // Create the table instance
  const table = useReactTable({
    data: reports,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  })

  // Function to get user-friendly column labels
  const getColumnLabel = (columnId) => {
    const labels = {
      reporter: "Người báo cáo",
      targetType: "Loại",
      targetTitle: "Đối tượng",
      reason: "Lý do",
      date: "Ngày",
      status: "Trạng thái",
      actions: "Hành động"
    }
    return labels[columnId] || columnId
  }

  // Reset all filters to show all records
  const resetFilters = () => {
    table.getColumn("reporter")?.setFilterValue("")
    table.getColumn("targetType")?.setFilterValue("")
    table.getColumn("status")?.setFilterValue("")
  }

  // Format pet names
  const formatPetNames = (pets) => {
    if (!Array.isArray(pets) || pets.length === 0) {
      return 'Không có thú cưng được gắn thẻ';
    }

    const petNames = pets.map(pet => pet.name);

    if (petNames.length === 1) {
      return petNames[0];
    } else if (petNames.length === 2) {
      return `${petNames[0]} và ${petNames[1]}`;
    } else if (petNames.length >= 3) {
      const lastPet = petNames.pop();
      return `${petNames.join(', ')} và ${lastPet}`;
    }

    return 'Không có thú cưng được gắn thẻ';
  };

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] page-header mb-1">Quản lý báo cáo</h1>
          <p className="text-muted-foreground">Quản lý và xử lý các báo cáo từ người dùng</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm báo cáo..."
          value={(table.getColumn("reporter")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("reporter")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-white"
        />
        
        {/* Target Type Filter - Removed "Bình luận" option */}
        <Select
          value={table.getColumn("targetType")?.getFilterValue() || "all"}
          onValueChange={(value) => {
            table.getColumn("targetType")?.setFilterValue(value === "all" ? "" : value)
          }}
        >
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Loại đối tượng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="Bài viết">Bài viết</SelectItem>
            <SelectItem value="Người dùng">Người dùng</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Status Filter */}
        <Select
          value={table.getColumn("status")?.getFilterValue() || "all"}
          onValueChange={(value) => {
            table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
          }}
        >
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="Pending">Chờ xử lý</SelectItem>
            <SelectItem value="Resolved">Đã xử lý</SelectItem>
            <SelectItem value="Dismissed">Đã bỏ qua</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Reset Filters Button */}
        <Button 
          variant="outline" 
          onClick={resetFilters}
          className="ml-auto"
        >
          Đặt lại
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Hiển thị <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {getColumnLabel(column.id)}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reports Table */}
      <div className="rounded-md border flex-grow">
        <Table className="h-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="h-full">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4 pt-0">
        <div className="flex-1 text-sm text-muted-foreground">
          Có tất cả {table.getFilteredRowModel().rows.length} bản ghi.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Post Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="page-header text-[20px]">Chi tiết bài viết</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Post Header */}
                <div className="flex items-center gap-3">
                  <Avatar className="!w-10 !h-10">
                    <AvatarImage src={selectedPost.user.avatar} alt={selectedPost.user.name} />
                    <AvatarFallback className="bg-black text-white">
                      {selectedPost.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedPost.user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{selectedPost.date}</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedPost.status === 'Published' && !selectedPost.blocked
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPost.status === 'Published' && !selectedPost.blocked ? 'Đang hiển thị' : 'Bị chặn'}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="text-[15px] whitespace-pre-line">
                  {selectedPost.content}
                </div>

                {/* Post Images */}
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="mt-3">
                    {selectedPost.images.length === 1 ? (
                      // Single image
                      <div className="relative">
                        <img
                          src={selectedPost.images[0]}
                          alt="Post content"
                          className="w-full rounded-lg object-cover max-h-86"
                        />
                      </div>
                    ) : selectedPost.images.length === 2 ? (
                      // Two images side by side
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPost.images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square overflow-hidden rounded-lg"
                          >
                            <img
                              src={image}
                              alt={`Post content ${index + 1}`}
                              className="w-full h-full object-cover max-h-86"
                            />
                          </div>
                        ))}
                      </div>
                    ) : selectedPost.images.length === 3 ? (
                      // Three images - two in first row, one full-width in second row
                      <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1].map((index) => (
                            <div
                              key={index}
                              className="aspect-square overflow-hidden rounded-lg"
                            >
                              <img
                                src={selectedPost.images[index]}
                                alt={`Post content ${index + 1}`}
                                className="w-full h-full object-cover max-h-86"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="aspect-[2/1] overflow-hidden rounded-lg w-full">
                          <img
                            src={selectedPost.images[2]}
                            alt="Post content 3"
                            className="w-full h-full object-cover max-h-86"
                          />
                        </div>
                      </div>
                    ) : (
                      // Four images - 2x2 grid
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPost.images.slice(0, 4).map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square overflow-hidden rounded-lg"
                          >
                            <img
                              src={image}
                              alt={`Post content ${index + 1}`}
                              className="w-full h-full object-cover max-h-86"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center gap-x-6 w-full text-[15px] pt-2 border-t">
                  <div className="flex items-center gap-1 text-gray-600">
                    <div className="h-5 w-5 text-[#EF4142]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                      </svg>
                    </div>
                    <p className="font-medium">{selectedPost.likes}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <div className="h-5 w-5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223zM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="font-medium">{selectedPost.comments}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <span className="p-[2.5px] bg-gray-400 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
                        <path fillRule="evenodd" d="M11.467 1.975a.75.75 0 0 1 .726.525l1.062 3.407 3.543.184a.75.75 0 0 1 .42.125l2.432 1.964a.75.75 0 0 1 .197.89l-1.57 3.036 1.323 3.382a.75.75 0 0 1-.369.86l-2.995 1.524-1.32 3.52a.75.75 0 0 1-1.292.113l-1.537-2.18-1.537 2.18a.75.75 0 0 1-1.292-.112l-1.32-3.52-2.995-1.525a.75.75 0 0 1-.37-.86l1.324-3.381-1.57-3.036a.75.75 0 0 1 .197-.89l2.432-1.964a.75.75 0 0 1 .42-.125l3.543-.184 1.062-3.407a.75.75 0 0 1 .525-.525h.014ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="font-medium">{selectedPost.reports}</p>
                  </div>
                </div>

                {/* Tagged Pets */}
                {selectedPost.pets && selectedPost.pets.length > 0 && (
                  <div className="pt-2 border-t">
                    <h3 className="font-semibold mb-2">Thú cưng được gắn thẻ:</h3>
                    <div className="space-y-2">
                      {selectedPost.pets.map((pet) => (
                        <div key={pet.id} className="flex items-center gap-3 p-2 border rounded-lg">
                          <Avatar className="!w-10 !h-10">
                            <AvatarImage src={pet.avatar} alt={pet.name} />
                            <AvatarFallback className="bg-black text-white">
                              {pet.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{pet.name}</div>
                            <div className="text-sm text-gray-500">{pet.breed || 'Chưa xác định'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}