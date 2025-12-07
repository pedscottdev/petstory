"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Eye, CheckCircle, XCircle, AlertCircle, Loader2, Calendar } from "lucide-react"
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { Skeleton } from "@/components/ui/skeleton"
import { getPosts, togglePostBlock } from "@/api/adminApi"
import { getImageUrl } from "@/utils/imageUtils"

export default function AdminPostsPage() {
  const [posts, setPosts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [togglingPostId, setTogglingPostId] = React.useState(null)
  const [sorting, setSorting] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 8,
    total: 0,
  })
  const [selectedPost, setSelectedPost] = React.useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch posts from API
  const fetchPosts = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
      }

      if (debouncedSearch) {
        params.search = debouncedSearch
      }

      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      const response = await getPosts(params)

      if (response.success) {
        setPosts(response.data.posts)
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.pagination.current_page,
          lastPage: response.data.pagination.last_page,
          total: response.data.pagination.total,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast.error("Không thể tải danh sách bài viết")
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.perPage, debouncedSearch, statusFilter])

  // Initial fetch and refetch on filter changes
  React.useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Reset to first page when filters change
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [debouncedSearch, statusFilter])

  // Function to get initials from name as fallback
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Function to toggle post block status
  const handleToggleBlock = async (postId) => {
    setTogglingPostId(postId)
    try {
      const response = await togglePostBlock(postId)

      if (response.success) {
        // Update local state
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                is_active: response.data.post.is_active,
              }
            }
            return post
          })
        )

        // Update selectedPost if viewing in dialog
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => ({
            ...prev,
            is_active: response.data.post.is_active,
          }))
        }

        toast.success(response.message)
      }
    } catch (error) {
      console.error("Failed to toggle post block status:", error)
      toast.error("Không thể thay đổi trạng thái bài viết")
    } finally {
      setTogglingPostId(null)
    }
  }

  // Define columns for the table
  const columns = React.useMemo(() => [
    {
      accessorKey: "author",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tác giả
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const author = row.original.author
        if (!author) return <div className="text-muted-foreground">Không xác định</div>
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getImageUrl(author.avatar)} alt={author.name} className={"object-cover"} />
              <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{author.name}</div>
              <div className="text-sm text-muted-foreground">{author.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ngày đăng
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.original.date}</div>,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.original.is_active
        return (
          <div className="capitalize">
            <span className={`px-2 py-1 rounded-full text-xs ${isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {isActive ? 'Đang hiển thị' : 'Bị chặn'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "stats",
      header: "Thống kê",
      cell: ({ row }) => (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-red-400">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
            <span>{row.original.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-400">
              <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223zM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
            </svg>
            <span>{row.original.comments_count || 0}</span>
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Hành động",
      enableHiding: false,
      cell: ({ row }) => {
        const post = row.original
        const isToggling = togglingPostId === post.id

        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedPost(post)
                setIsViewDialogOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleBlock(post.id)}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : post.is_active ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-900">Chặn</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-900">Bỏ chặn</span>
                </>
              )}
            </Button>
          </div>
        )
      },
    },
  ], [togglingPostId])

  // Create the table instance
  const table = useReactTable({
    data: posts,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
    manualPagination: true,
    pageCount: pagination.lastPage,
  })

  // Function to get user-friendly column labels
  const getColumnLabel = (columnId) => {
    const labels = {
      author: "Tác giả",
      date: "Ngày đăng",
      status: "Trạng thái",
      stats: "Thống kê",
      actions: "Hành động"
    };
    return labels[columnId] || columnId;
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  // Skeleton loader for table rows
  const TableSkeleton = () => (
    <>
      {[...Array(8)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell>
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-20" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] page-header mb-1">Quản lý bài viết</h1>
          <p className="text-muted-foreground">Quản lý và giám sát bài viết trong hệ thống</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo tên người đăng..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-sm bg-white"
        />

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[170px] bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="displayed">Đang hiển thị</SelectItem>
            <SelectItem value="blocked">Bị chặn</SelectItem>
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

      {/* Posts Table */}
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
            {loading ? (
              <TableSkeleton />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  Không có kết quả.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4 pt-0">
        <div className="flex-1 text-sm text-muted-foreground">
          Có tất cả {pagination.total} bài viết.
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Trang {pagination.currentPage} / {pagination.lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.lastPage || loading}
          >
            Sau
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
                    <AvatarImage src={getImageUrl(selectedPost.author?.avatar)} alt={selectedPost.author?.name} />
                    <AvatarFallback className="bg-black text-white">
                      {getInitials(selectedPost.author?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedPost.author?.name || 'Không xác định'}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{selectedPost.date}</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedPost.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedPost.is_active ? 'Đang hiển thị' : 'Bị chặn'}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="text-[15px] whitespace-pre-line">
                  {selectedPost.content}
                </div>

                {/* Post Images */}
                {selectedPost.multimedia && selectedPost.multimedia.length > 0 && (
                  <div className="mt-3">
                    {selectedPost.multimedia.length === 1 ? (
                      // Single image
                      <div className="relative">
                        <img
                          src={getImageUrl(selectedPost.multimedia[0].file_url)}
                          alt="Post content"
                          className="w-full rounded-lg object-cover max-h-86"
                        />
                      </div>
                    ) : selectedPost.multimedia.length === 2 ? (
                      // Two images side by side
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPost.multimedia.map((media, index) => (
                          <div
                            key={index}
                            className="aspect-square overflow-hidden rounded-lg"
                          >
                            <img
                              src={getImageUrl(media.file_url)}
                              alt={`Post content ${index + 1}`}
                              className="w-full h-full object-cover max-h-86"
                            />
                          </div>
                        ))}
                      </div>
                    ) : selectedPost.multimedia.length === 3 ? (
                      // Three images - two in first row, one full-width in second row
                      <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1].map((index) => (
                            <div
                              key={index}
                              className="aspect-square overflow-hidden rounded-lg"
                            >
                              <img
                                src={getImageUrl(selectedPost.multimedia[index].file_url)}
                                alt={`Post content ${index + 1}`}
                                className="w-full h-full object-cover max-h-86"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="aspect-[2/1] overflow-hidden rounded-lg w-full">
                          <img
                            src={getImageUrl(selectedPost.multimedia[2].file_url)}
                            alt="Post content 3"
                            className="w-full h-full object-cover max-h-86"
                          />
                        </div>
                      </div>
                    ) : (
                      // Four images - 2x2 grid
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPost.multimedia.slice(0, 4).map((media, index) => (
                          <div
                            key={index}
                            className="aspect-square overflow-hidden rounded-lg"
                          >
                            <img
                              src={getImageUrl(media.file_url)}
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
                    <p className="font-medium">{selectedPost.likes_count || 0}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <div className="h-5 w-5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223zM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="font-medium">{selectedPost.comments_count || 0}</p>
                  </div>
                </div>

                {/* Tagged Pets */}
                {selectedPost.tagged_pets && selectedPost.tagged_pets.length > 0 && (
                  <div className="pt-2 border-t">
                    <h3 className="font-semibold mb-2">Thú cưng được gắn thẻ:</h3>
                    <div className="space-y-2">
                      {selectedPost.tagged_pets.map((pet) => (
                        <div key={pet.id || pet._id} className="flex items-center gap-3 p-2 border rounded-lg">
                          <Avatar className="!w-10 !h-10">
                            <AvatarImage src={getImageUrl(pet.avatar_url || pet.avatar)} alt={pet.name} />
                            <AvatarFallback className="bg-black text-white">
                              {pet.name?.charAt(0) || '?'}
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

                {/* Block/Unblock Button in Dialog */}
                <div className="pt-2 border-t flex justify-end">
                  <Button
                    variant={selectedPost.is_active ? "destructive" : "default"}
                    onClick={() => handleToggleBlock(selectedPost.id)}
                    disabled={togglingPostId === selectedPost.id}
                  >
                    {togglingPostId === selectedPost.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : selectedPost.is_active ? (
                      <XCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {selectedPost.is_active ? 'Chặn bài viết' : 'Bỏ chặn bài viết'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}