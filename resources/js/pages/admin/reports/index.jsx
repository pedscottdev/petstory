"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ChevronDown,
    Eye,
    Check,
    X,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import {
    getReports,
    resolveReport,
    getReportPostDetails,
} from "@/api/adminApi";
import { getImageUrl } from "@/utils/imageUtils";

export default function AdminReportsPage() {
    const navigate = useNavigate();
    const [reports, setReports] = React.useState([]);
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [selectedPost, setSelectedPost] = React.useState(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isLoadingPost, setIsLoadingPost] = React.useState(false);
    const [pagination, setPagination] = React.useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [targetTypeFilter, setTargetTypeFilter] = React.useState("all");

    // Process dialog state
    const [isProcessDialogOpen, setIsProcessDialogOpen] = React.useState(false);
    const [processingReport, setProcessingReport] = React.useState(null);
    const [isProcessing, setIsProcessing] = React.useState(false);

    // Fetch reports from API
    const fetchReports = React.useCallback(
        async (page = 1) => {
            try {
                setIsLoading(true);
                const params = {
                    page,
                    per_page: 10,
                };
                if (statusFilter !== "all") params.status = statusFilter;
                if (targetTypeFilter !== "all")
                    params.target_type = targetTypeFilter;

                const response = await getReports(params);
                // httpClient interceptor already returns response.data, so we access directly
                if (response?.success) {
                    setReports(response.data?.reports || []);
                    setPagination(
                        response.data?.pagination || {
                            current_page: 1,
                            last_page: 1,
                            per_page: 10,
                            total: 0,
                        }
                    );
                }
            } catch (error) {
                console.error("Error fetching reports:", error);
                toast.error("Không thể tải danh sách báo cáo");
            } finally {
                setIsLoading(false);
            }
        },
        [statusFilter, targetTypeFilter]
    );

    // Initial load and filter changes
    React.useEffect(() => {
        fetchReports(1);
    }, [fetchReports]);

    // Handle resolve report
    const handleResolve = async (resolution) => {
        if (!processingReport) return;

        try {
            setIsProcessing(true);
            const response = await resolveReport(processingReport.id, {
                resolution,
            });
            // httpClient interceptor already returns response.data
            if (response?.success) {
                toast.success(response.message);
                // Refresh reports list
                fetchReports(pagination.current_page);
                setIsProcessDialogOpen(false);
                setProcessingReport(null);
            }
        } catch (error) {
            console.error("Error resolving report:", error);
            toast.error("Không thể xử lý báo cáo");
        } finally {
            setIsProcessing(false);
        }
    };

    // Open process dialog
    const openProcessDialog = (report) => {
        setProcessingReport(report);
        setIsProcessDialogOpen(true);
    };

    // Handle view post details
    const handleViewPostDetail = async (postId) => {
        try {
            setIsLoadingPost(true);
            setIsViewDialogOpen(true);

            const response = await getReportPostDetails(postId);
            // httpClient interceptor already returns response.data
            if (response?.success) {
                setSelectedPost(response.data);
            }
        } catch (error) {
            console.error("Error fetching post details:", error);
            toast.error("Không thể tải thông tin bài viết");
            setIsViewDialogOpen(false);
        } finally {
            setIsLoadingPost(false);
        }
    };

    // Handle view user profile
    const handleViewUserProfile = (userId) => {
        navigate(`/admin/profile/${userId}`);
    };

    // Define columns for the table
    const columns = [
        {
            accessorKey: "reporter_name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Người báo cáo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const reporter = row.original.reporter;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage
                                src={getImageUrl(reporter?.avatar)}
                                alt={
                                    reporter?.name ||
                                    row.getValue("reporter_name")
                                }
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                {row
                                    .getValue("reporter_name")
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                            {row.getValue("reporter_name")}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "target_type",
            header: "Loại",
            cell: ({ row }) => <div>{row.getValue("target_type")}</div>,
        },
        {
            accessorKey: "target_title",
            header: "Đối tượng",
            cell: ({ row }) => (
                <div className="max-w-xs truncate">
                    {row.getValue("target_title")}
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
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Ngày
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue("date")}</div>,
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => (
                <div className="capitalize">
                    <span
                        className={`px-2 py-1 rounded-full text-xs ${
                            row.original.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                        }`}
                    >
                        {row.original.status === "pending"
                            ? "Chờ xử lý"
                            : "Đã xử lý"}
                    </span>
                </div>
            ),
        },
        {
            id: "actions",
            header: "Hành động",
            enableHiding: false,
            cell: ({ row }) => {
                const report = row.original;

                return (
                    <div className="flex gap-2">
                        {report.status === "pending" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openProcessDialog(report)}
                                title="Xử lý báo cáo"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        {report.target_type_raw === "post" &&
                        report.target_id ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleViewPostDetail(report.target_id)
                                }
                                title="Xem bài viết"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        ) : report.target_type_raw === "user" &&
                          report.target_id ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleViewUserProfile(report.target_id)
                                }
                                title="Xem người dùng"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        ) : null}
                    </div>
                );
            },
        },
    ];

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
                pageSize: 10,
            },
        },
    });

    // Function to get user-friendly column labels
    const getColumnLabel = (columnId) => {
        const labels = {
            reporter_name: "Người báo cáo",
            target_type: "Loại",
            target_title: "Đối tượng",
            reason: "Lý do",
            date: "Ngày",
            status: "Trạng thái",
            actions: "Hành động",
        };
        return labels[columnId] || columnId;
    };

    // Reset all filters
    const resetFilters = () => {
        setStatusFilter("all");
        setTargetTypeFilter("all");
        table.getColumn("reporter_name")?.setFilterValue("");
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchReports(newPage);
        }
    };

    return (
        <div className="space-y-3 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[28px] page-header mb-1">
                        Quản lý báo cáo
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý và xử lý các báo cáo từ người dùng
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Tìm kiếm báo cáo..."
                    value={
                        table.getColumn("reporter_name")?.getFilterValue() ?? ""
                    }
                    onChange={(event) =>
                        table
                            .getColumn("reporter_name")
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm bg-white"
                />

                {/* Target Type Filter */}
                <Select
                    value={targetTypeFilter}
                    onValueChange={(value) => setTargetTypeFilter(value)}
                >
                    <SelectTrigger className="w-[150px] bg-white">
                        <SelectValue placeholder="Loại đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="post">Bài viết</SelectItem>
                        <SelectItem value="user">Người dùng</SelectItem>
                    </SelectContent>
                </Select>

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
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="resolved">Đã xử lý</SelectItem>
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
                                );
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
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="h-full">
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-40" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-16" />
                                    </TableCell>
                                </TableRow>
                            ))
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
                                    Không có báo cáo nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4 pt-0">
                <div className="flex-1 text-sm text-muted-foreground">
                    Có tất cả {pagination.total} bản ghi.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page <= 1 || isLoading}
                    >
                        Trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Trang {pagination.current_page} / {pagination.last_page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                            pagination.current_page >= pagination.last_page ||
                            isLoading
                        }
                    >
                        Sau
                    </Button>
                </div>
            </div>

            {/* Process Report Dialog */}
            <Dialog
                open={isProcessDialogOpen}
                onOpenChange={setIsProcessDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="page-header text-[22px]">
                            Xử lý báo cáo
                        </DialogTitle>
                        <DialogDescription>
                            Chọn phương án xử lý cho báo cáo này
                        </DialogDescription>
                    </DialogHeader>

                    {processingReport && (
                        <div className="py-1">
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-600 mb-1">
                                    Đối tượng:
                                </p>
                                <p className="font-medium">
                                    {processingReport.target_title}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Lý do: {processingReport.reason}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-center gap-x-2 w-full">
                        <Button
                            className=" bg-green-700 hover:bg-green-700/85 text-white rounded-full"
                            onClick={() => handleResolve("no_violation")}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <div className="flex items-center">
                                    <Check className="h-4 w-4 mr-2" />
                                    <span>Không vi phạm</span>
                                </div>
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            className=" bg-red-700 hover:bg-red-700/85 text-white rounded-full"
                            onClick={() => handleResolve("violation")}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <div className="flex items-center">
                                <X className="h-4 w-4 mr-2" />
                                <span>Xác nhận vi phạm</span>
                              </div>
                            )}
                            
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Post Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    {isLoadingPost ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-32 mb-2" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-48 w-full rounded-lg" />
                        </div>
                    ) : selectedPost ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="page-header text-[20px]">
                                    Chi tiết bài viết
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {/* Post Header */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="!w-10 !h-10">
                                        <AvatarImage
                                            src={getImageUrl(
                                                selectedPost.author?.avatar
                                            )}
                                            alt={selectedPost.author?.name}
                                        />
                                        <AvatarFallback className="bg-black text-white">
                                            {selectedPost.author?.name?.charAt(
                                                0
                                            ) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">
                                            {selectedPost.author?.name ||
                                                "Unknown"}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>{selectedPost.date}</span>
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                selectedPost.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {selectedPost.is_active
                                                ? "Đang hiển thị"
                                                : "Bị chặn"}
                                        </span>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <div className="text-[15px] whitespace-pre-line">
                                    {selectedPost.content}
                                </div>

                                {/* Post Images */}
                                {selectedPost.multimedia &&
                                    selectedPost.multimedia.length > 0 && (
                                        <div className="mt-3">
                                            {selectedPost.multimedia.length ===
                                            1 ? (
                                                <div className="relative">
                                                    <img
                                                        src={getImageUrl(
                                                            selectedPost
                                                                .multimedia[0]
                                                                .file_url
                                                        )}
                                                        alt="Post content"
                                                        className="w-full rounded-lg object-cover max-h-86"
                                                    />
                                                </div>
                                            ) : selectedPost.multimedia
                                                  .length === 2 ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedPost.multimedia.map(
                                                        (media, index) => (
                                                            <div
                                                                key={index}
                                                                className="aspect-square overflow-hidden rounded-lg"
                                                            >
                                                                <img
                                                                    src={getImageUrl(
                                                                        media.file_url
                                                                    )}
                                                                    alt={`Post content ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    className="w-full h-full object-cover max-h-86"
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedPost.multimedia
                                                        .slice(0, 4)
                                                        .map((media, index) => (
                                                            <div
                                                                key={index}
                                                                className="aspect-square overflow-hidden rounded-lg"
                                                            >
                                                                <img
                                                                    src={getImageUrl(
                                                                        media.file_url
                                                                    )}
                                                                    alt={`Post content ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    className="w-full h-full object-cover max-h-86"
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {/* Tagged Pets */}
                                {selectedPost.tagged_pets &&
                                    selectedPost.tagged_pets.length > 0 && (
                                        <div className="pt-2 border-t">
                                            <h3 className="font-semibold mb-2">
                                                Thú cưng được gắn thẻ:
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedPost.tagged_pets.map(
                                                    (pet) => (
                                                        <div
                                                            key={pet.id}
                                                            className="flex items-center gap-3 p-2 border rounded-lg"
                                                        >
                                                            <Avatar className="!w-10 !h-10">
                                                                <AvatarImage
                                                                    src={getImageUrl(
                                                                        pet.avatar_url
                                                                    )}
                                                                    alt={
                                                                        pet.name
                                                                    }
                                                                />
                                                                <AvatarFallback className="bg-black text-white">
                                                                    {pet.name?.charAt(
                                                                        0
                                                                    ) || "P"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {pet.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {pet.breed ||
                                                                        "Chưa xác định"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
