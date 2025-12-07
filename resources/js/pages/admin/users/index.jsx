"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, CheckCircle, XCircle, Loader2 } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getUsers, toggleUserStatus } from "@/api/adminApi"
import { getImageUrl } from "@/utils/imageUtils"

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [togglingUserId, setTogglingUserId] = React.useState(null)
  const [sorting, setSorting] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 8,
    total: 0,
  })

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dateRange, setDateRange] = React.useState({
    startDate: "",
    endDate: ""
  })

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch users from API
  const fetchUsers = React.useCallback(async () => {
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

      if (dateRange.startDate) {
        params.from_date = dateRange.startDate
      }

      if (dateRange.endDate) {
        params.to_date = dateRange.endDate
      }

      const response = await getUsers(params)

      if (response.success) {
        setUsers(response.data.users)
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.pagination.current_page,
          lastPage: response.data.pagination.last_page,
          total: response.data.pagination.total,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.perPage, debouncedSearch, statusFilter, dateRange])

  // Initial fetch and refetch on filter changes
  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset to first page when filters change
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [debouncedSearch, statusFilter, dateRange])

  // Function to get initials from name as fallback
  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Function to toggle user status
  const handleToggleStatus = async (userId, userName) => {
    setTogglingUserId(userId)
    try {
      const response = await toggleUserStatus(userId)

      if (response.success) {
        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user => {
            if (user.id === userId) {
              return {
                ...user,
                is_active: response.data.user.is_active,
                status: response.data.user.status,
              }
            }
            return user
          })
        )
        toast.success(response.message)
      }
    } catch (error) {
      console.error("Failed to toggle user status:", error)
      toast.error("Không thể thay đổi trạng thái người dùng")
    } finally {
      setTogglingUserId(null)
    }
  }

  // Define columns for the table
  const columns = React.useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getImageUrl(row.original.avatar)} alt={row.original.name} className={"object-cover"} />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="capitalize">
          <span className={`px-2 py-1 rounded-full text-xs ${row.original.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {row.original.is_active ? "Đang hoạt động" : "Bị khóa"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "join_date",
      header: "Ngày tham gia",
      cell: ({ row }) => <div>{row.getValue("join_date")}</div>,
    },
    {
      accessorKey: "bio",
      header: "Tiểu sử",
      cell: ({ row }) => <div className="whitespace-nowrap max-w-[200px] truncate">{row.original.bio || "-"}</div>,
    },
    {
      id: "actions",
      header: "Hành động",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        const isToggling = togglingUserId === user.id

        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleStatus(user.id, user.name)}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user.is_active ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-900">Vô hiệu</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Kích hoạt
                </>
              )}
            </Button>
          </div>
        )
      },
    },
  ], [togglingUserId])

  // Create the table instance
  const table = useReactTable({
    data: users,
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
      name: "Tên",
      email: "Email",
      status: "Trạng thái",
      join_date: "Ngày tham gia",
      bio: "Tiểu sử",
      actions: "Hành động"
    };
    return labels[columnId] || columnId;
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateRange({ startDate: "", endDate: "" })
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
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] page-header mb-1">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý và giám sát người dùng trong hệ thống</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo tên..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-sm bg-white"
        />

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Bị khóa</SelectItem>
          </SelectContent>
        </Select>

        {/* Join Date Range Filters */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(event) =>
              setDateRange(prev => ({ ...prev, startDate: event.target.value }))
            }
            className="w-[150px] bg-white"
            placeholder="Từ ngày"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(event) =>
              setDateRange(prev => ({ ...prev, endDate: event.target.value }))
            }
            className="w-[150px] bg-white"
            placeholder="Đến ngày"
          />
        </div>

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

      {/* Users Table */}
      <div className="rounded-md border flex-grow">
        <Table className="h-full ">
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
          <TableBody className="h-full  ">
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
          Có tất cả {pagination.total} người dùng.
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
    </div>
  );
}