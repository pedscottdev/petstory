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
import { ArrowUpDown, ChevronDown, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Initial user data
const initialUsers = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    role: "User",
    status: "Active",
    joinDate: "2023-01-15",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    bio: "Yêu thích chó và mèo. Có 3 chú mèo tên Mít, Đậu và Sen."
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "tranthibinh@example.com",
    role: "User",
    status: "Active",
    joinDate: "2023-02-20",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    bio: "Chuyên nuôi các giống chó nhỏ. Hiện có 2 chú Poodle."
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    email: "levancuong@example.com",
    role: "Admin",
    status: "Active",
    joinDate: "2022-11-05",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    bio: "Quản trị viên hệ thống. Yêu thích chim và cá cảnh."
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    email: "phamthidung@example.com",
    role: "User",
    status: "Banned",
    joinDate: "2023-03-10",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    bio: "Chuyên về thú cưng exotic. Có một chú hedgehog tên là Bơ."
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    email: "hoangvanem@example.com",
    role: "User",
    status: "Active",
    joinDate: "2023-04-18",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
    bio: "Yêu thích động vật nhỏ. Nuôi thỏ và hamster."
  },
  {
    id: 6,
    name: "Vũ Thị Hoa",
    email: "vuthihoa@example.com",
    role: "User",
    status: "Active",
    joinDate: "2023-05-22",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    bio: "Chuyên nuôi mèo Anh lông ngắn. Hiện có 4 chú mèo."
  },
  {
    id: 7,
    name: "Đỗ Văn Giang",
    email: "dovanGiang@example.com",
    role: "User",
    status: "Inactive",
    joinDate: "2023-06-10",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    bio: "Yêu thích chó lớn. Có một chú Golden Retriever."
  },
  {
    id: 8,
    name: "Ngô Thị Hằng",
    email: "ngothihang@example.com",
    role: "User",
    status: "Active",
    joinDate: "2023-07-15",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    bio: "Chuyên nuôi chim cảnh. Có nhiều loại vẹt khác nhau."
  },
  {
    id: 9,
    name: "Lý Văn Khánh",
    email: "lyvankhanh@example.com",
    role: "User",
    status: "Active",
    joinDate: "2023-08-30",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=200&auto=format&fit=crop",
    bio: "Yêu thích cá cảnh. Có hồ cá Koi lớn trong sân vườn."
  },
  {
    id: 10,
    name: "Phan Thị Lan",
    email: "phanthilan@example.com",
    role: "User",
    status: "Inactive",
    joinDate: "2023-09-12",
    avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop",
    bio: "Chuyên nuôi rùa cảnh. Có bộ sưu tập rùa nước ngọt."
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState(initialUsers)
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  // State for date range filtering
  const [dateRange, setDateRange] = React.useState({
    startDate: "",
    endDate: ""
  })

  // Function to get initials from name as fallback
  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Function to toggle user status
  const toggleUserStatus = (userId) => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
          toast.success(`Người dùng ${user.name} đã được ${newStatus === 'Active' ? 'kích hoạt' : 'vô hiệu hóa'} thành công`);
          return { ...user, status: newStatus };
        }
        return user;
      })
    );
  };

  // Define columns for the table
  const columns = [
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
            <AvatarImage src={row.original.avatar} alt={row.original.name} className={"object-cover"} />
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
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <div className="capitalize">
          <span className={`px-2 py-1 rounded-full text-xs ${row.original.role === 'Admin'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
            }`}>
            {row.original.role == "Admin" ? "Quản trị viên" : "Người dùng"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="capitalize">
          <span className={`px-2 py-1 rounded-full text-xs ${row.original.status === 'Active'
            ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}>
            {row.original.status == "Active" ? "Đang hoạt động" : "Bị khóa"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "joinDate",
      header: "Ngày tham gia",
      cell: ({ row }) => <div>{row.getValue("joinDate")}</div>,
    },
    {
      accessorKey: "bio",
      header: "Tiểu sử",
      cell: ({ row }) => <div className="whitespace-nowrap">{row.original.bio}</div>,
    },
    {
      id: "actions",
      header: "Hành động",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleUserStatus(user.id)}
            >
              {user.status === 'Active' ? (
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
  ]

  // Create the table instance
  const table = useReactTable({
    data: users,
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
    // Add custom filter function for date range
    filterFns: {
      dateRange: (row, columnId, filterValue) => {
        const rowDate = new Date(row.getValue(columnId));
        const startDate = filterValue.startDate ? new Date(filterValue.startDate) : null;
        const endDate = filterValue.endDate ? new Date(filterValue.endDate) : null;
        
        if (startDate && endDate) {
          return rowDate >= startDate && rowDate <= endDate;
        } else if (startDate) {
          return rowDate >= startDate;
        } else if (endDate) {
          return rowDate <= endDate;
        }
        return true;
      },
      fuzzy: (row, columnId, value) => {
        const rowValue = row.getValue(columnId);
        if (typeof rowValue === 'string') {
          return rowValue.toLowerCase().includes(value.toLowerCase());
        }
        return rowValue === value;
      },
    },
  })

  // Function to handle date range changes
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Apply the date range filter to the table
    table.getColumn("joinDate")?.setFilterValue(range);
  };

  // Function to get user-friendly column labels
  const getColumnLabel = (columnId) => {
    const labels = {
      name: "Tên",
      email: "Email",
      role: "Vai trò",
      status: "Trạng thái",
      joinDate: "Ngày tham gia",
      bio: "Tiểu sử",
      actions: "Hành động"
    };
    return labels[columnId] || columnId;
  };

  // Reset all filters to show all records
  const resetFilters = () => {
    table.getColumn("name")?.setFilterValue("");
    table.getColumn("role")?.setFilterValue("");
    table.getColumn("status")?.setFilterValue("");
    setDateRange({ startDate: "", endDate: "" });
    table.getColumn("joinDate")?.setFilterValue("");
  };

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
          placeholder="Tìm kiếm người dùng..."
          value={(table.getColumn("name")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-white"
        />
        
        {/* Role Filter */}
        <Select
          value={table.getColumn("role")?.getFilterValue() || "all"}
          onValueChange={(value) => {
            table.getColumn("role")?.setFilterValue(value === "all" ? "" : value)
          }}
        >
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="User">Người dùng</SelectItem>
            <SelectItem value="Admin">Quản trị viên</SelectItem>
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
            <SelectItem value="Active">Đang hoạt động</SelectItem>
            <SelectItem value="Inactive">Bị khóa</SelectItem>
            <SelectItem value="Banned">Bị cấm</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Join Date Range Filters */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(event) => 
              handleDateRangeChange({ ...dateRange, startDate: event.target.value })
            }
            className="w-[130px] bg-white"
            placeholder="Từ ngày"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(event) => 
              handleDateRangeChange({ ...dateRange, endDate: event.target.value })
            }
            className="w-[130px] bg-white"
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  // Removed data-state for row selection
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
          {/* Updated record count display to show total records instead of selected records */}
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
    </div>
  );
}