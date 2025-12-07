import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    useDeferredValue,
    lazy,
    Suspense,
} from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    Users,
    MessageSquare,
    RefreshCcw,
    LineChart,
    Check,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarGroup } from "@/components/ui/avatar-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    getGroups,
    createGroup as createGroupApi,
    updateGroup as updateGroupApi,
} from "@/api/groupApi";
import { useAuth } from "@/contexts/AuthContext";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { getImageUrl, getGroupAvatarUrl } from "@/utils/imageUtils";

// --- Moved / memoized UI helpers to top-level so they are stable references ---
const LoadingSkeleton = React.memo(({ activeTab }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Featured groups - 1 row */}
        {activeTab === "discover" && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                        <Card
                            key={`featured-${item}`}
                            className="pt-0 overflow-hidden rounded-2xl border border-gray-300"
                        >
                            <div className="p-4 pb-0">
                                <div className="rounded-lg h-48 w-full bg-gray-200 animate-pulse"></div>
                            </div>
                            <CardHeader className="!px-4">
                                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                                <div className="flex space-x-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 pb-2 border-b border-gray-100">
                                    <div className="flex items-start">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((avatar) => (
                                            <div
                                                key={avatar}
                                                className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {/* Other groups - 2 rows */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card
                key={`other-${item}`}
                className="pt-0 overflow-hidden rounded-2xl border border-gray-300"
            >
                <div className="p-4 pb-0">
                    <div className="rounded-lg h-48 w-full bg-gray-200 animate-pulse"></div>
                </div>
                <CardHeader className="!px-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                    <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 pb-2 border-b border-gray-100">
                        <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((avatar) => (
                                <div
                                    key={avatar}
                                    className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"
                                ></div>
                            ))}
                        </div>
                        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
));

const EmptyState = React.memo(({ onReset }) => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
            Không tìm thấy kết quả
        </h3>
        <p className="text-gray-500 text-center max-w-md">
            Không có nhóm nào phù hợp với các bộ lọc hiện tại. Hãy thử thay đổi
            hoặc đặt lại bộ lọc.
        </p>
        <Button variant="outline" className="mt-4" onClick={onReset}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Đặt lại bộ lọc
        </Button>
    </div>
));

// GroupCard Memoized
const GroupCard = React.memo(function GroupCard({ group, onEdit }) {
    const getCategoryLabel = (category) => {
        switch (category) {
            case "dog":
                return "Chó";
            case "cat":
                return "Mèo";
            case "bird":
                return "Chim";
            default:
                return "Chung";
        }
    };

    const handleImgError = useCallback((e) => {
        e.currentTarget.src = "/images/default-image.png";
    }, []);

    const isMember = group.is_member && !group.is_owner;

    return (
        <Card className="pt-0 overflow-hidden rounded-3xl border border-gray-300 hover:shadow-md transition-shadow">
            <div className="p-4 pb-0 relative">
                <img
                    src={group.avatar}
                    alt={group.name}
                    className="rounded-xl h-48 w-full object-cover"
                    loading="lazy"
                    onError={handleImgError}
                />
                <div className="absolute -bottom-4 right-8 text-center gap-2">
                    <div className="bg-white text-[#91114D]  px-2 py-3.5 shadow-sm rounded-xl">
                        <p className="text-[10px] text-gray-600 uppercase font-medium">
                            Danh mục
                        </p>
                        <p className="text-[18px] uppercase font-black page-header">
                            {getCategoryLabel(group.category)}
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-4 left-8 flex items-center gap-2">
                    {isMember && (
                        <div className="text-[#ffc0dd] bg-[#530027] text-xs font-semibold px-3 py-1.5  rounded-xl">
                            Bạn đang là thành viên
                            <Check className="inline-block ml-1 h-3 w-3" />
                        </div>
                    )}
                </div>
            </div>

            <CardHeader className="!px-4">
                <div className="flex items-center">
                    <CardTitle className="!px-0 text-lg font-bold line-clamp-2 truncate w-[95%] ">
                        {group.name}
                    </CardTitle>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{group.members} thành viên</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-gray-400 mx-2"></div>
                    <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{group.posts} bài viết</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-gray-400 mx-2"></div>
                    <div className="flex items-center">
                        <LineChart className="h-4 w-4 mr-1" />
                        <span>{group.activity}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className={"px-4"}>
                <div className="mb-4 pb-2 px-0 border-b border-gray-100">
                    <p className="text-sm text-gray-600 h-10.5 overflow-hidden line-clamp-2">
                        {group.description}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <AvatarGroup className="rounded-full">
                        {group.latest_members && group.latest_members.length > 0
                            ? group.latest_members
                                  .slice(0, 3)
                                  .map((member, index) => (
                                      <AvatarGroup.Item
                                          key={index}
                                          src={getImageUrl(member.avatar_url)}
                                          alt={member.fullname}
                                          fallback={member.fullname.charAt(0)}
                                      />
                                  ))
                            : Array.from(
                                  { length: Math.min(group.members, 3) },
                                  (_, index) => (
                                      <AvatarGroup.Item
                                          key={index}
                                          src={`https://i.pravatar.cc/150?img=${
                                              index + 1
                                          }`}
                                          alt={`Member ${index + 1}`}
                                          fallback={`M${index + 1}`}
                                      />
                                  )
                              )}
                        {group.members > 3 && (
                            <AvatarGroup.Item
                                fallback={`+${group.members - 3}`}
                                className="text-xs bg-gray-100 text-gray-700 font-medium"
                            />
                        )}
                    </AvatarGroup>

                    <div className="flex items-center space-x-2">
                        {group.is_owner && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => onEdit && onEdit(group)}
                            >
                                Cập nhật
                            </Button>
                        )}

                        <Button
                            asChild
                            size="sm"
                            className="rounded-full bg-[#91114D] hover:bg-[#7a0e41]"
                        >
                            <Link to={`/groups/${group.id}`}>Xem nhóm</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

const GROUPS_TAB_STORAGE_KEY = "groups_active_tab";

export default function GroupsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(() => {
        // Load saved tab from localStorage, default to 'discover'
        if (typeof window !== "undefined") {
            return localStorage.getItem(GROUPS_TAB_STORAGE_KEY) || "discover";
        }
        return "discover";
    });
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
    const [isCreateGroupLoading, setIsCreateGroupLoading] = useState(false);
    const [isEditGroupLoading, setIsEditGroupLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: "",
        category: "all",
        activity: "all",
        memberCount: "all",
    });

    const deferredFilters = useDeferredValue(filters);

    const createAvatarInputRef = useRef(null);
    const editAvatarInputRef = useRef(null);

    const [createAvatarPreview, setCreateAvatarPreview] = useState(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState(null);

    const [createAvatarFile, setCreateAvatarFile] = useState(null);
    const [editAvatarFile, setEditAvatarFile] = useState(null);

    const [newGroup, setNewGroup] = useState({
        name: "",
        description: "",
        category: "",
        avatar: "",
    });
    const [editingGroup, setEditingGroup] = useState(null);
    const [editedGroup, setEditedGroup] = useState(null);

    const [groups, setGroups] = useState([]);

    // Load data on user available
    useEffect(() => {
        if (!user) return;
        loadGroupsData();
    }, [user]);

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(GROUPS_TAB_STORAGE_KEY, activeTab);
        }
    }, [activeTab]);

    const getActivityLevel = useCallback((memberCount) => {
        if (memberCount >= 1000) return "Cao";
        if (memberCount >= 100) return "TB";
        return "Thấp";
    }, []);

    const loadGroupsData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all groups with is_member status from API
            const allRes = await getGroups(1, 100);

            const allGroups = allRes.data?.data || [];

            // Use requestIdleCallback for non-critical transformation
            const transformed = allGroups.map((group) => ({
                id: group.id,
                name: group.name,
                description: group.description || "",
                members: group.member_count || 0,
                posts: group.post_count || 0,
                activity: getActivityLevel(group.member_count || 0),
                category: group.category || "all",
                is_owner: group.is_owner || false,
                is_member: group.is_member || false,
                avatar: getGroupAvatarUrl(group.avatarUrl),
                coverImage: getGroupAvatarUrl(group.avatarUrl),
                creator_id: group.creator_id,
                latest_members: group.latest_members || [],
            }));

            setGroups(transformed);
        } catch (err) {
            console.error("Lỗi tải nhóm:", err);
            toast.error("Không thể tải danh sách nhóm");
            setGroups([]);
        } finally {
            setIsLoading(false);
        }
    }, [getActivityLevel, user]);

    // Memoize filtered groups with optimized filtering
    const filteredGroups = useMemo(() => {
        const nameFilter = (deferredFilters.name || "").trim().toLowerCase();
        const hasNameFilter = nameFilter.length > 0;
        const hasCategoryFilter = deferredFilters.category !== "all";
        const hasActivityFilter =
            deferredFilters.activity && deferredFilters.activity !== "all";
        const hasMemberFilter =
            deferredFilters.memberCount &&
            deferredFilters.memberCount !== "all";

        return groups.filter((group) => {
            // Tab filtering
            if (activeTab === "discover") {
                // Khám phá: hiển thị tất cả nhóm TRỪ nhóm do tôi tạo
                if (group.is_owner) {
                    return false;
                }
            } else if (activeTab === "my-groups") {
                // Nhóm của tôi: chỉ hiển thị nhóm do tôi tạo
                if (!group.is_owner) {
                    return false;
                }
            }

            // Early return for name filter
            if (
                hasNameFilter &&
                !group.name.toLowerCase().includes(nameFilter)
            ) {
                return false;
            }

            // Category filter
            if (
                hasCategoryFilter &&
                group.category !== deferredFilters.category
            ) {
                return false;
            }

            // Activity filter
            if (
                hasActivityFilter &&
                group.activity !== deferredFilters.activity
            ) {
                return false;
            }

            // Member count filter
            if (hasMemberFilter) {
                const members = group.members;
                if (deferredFilters.memberCount === "small" && members >= 100)
                    return false;
                if (
                    deferredFilters.memberCount === "medium" &&
                    (members < 100 || members >= 1000)
                )
                    return false;
                if (deferredFilters.memberCount === "large" && members < 1000)
                    return false;
            }

            return true;
        });
    }, [groups, deferredFilters, activeTab]);

    const myGroupsCount = useMemo(() => {
        return groups.filter((g) => g.is_owner).length;
    }, [groups]);

    // Handlers (memoized)
    const handleFilterChange = useCallback((filterName, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterName]: value,
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            name: "",
            category: "all",
            activity: "all",
            memberCount: "all",
        });
    }, []);

    const resetNewGroupForm = useCallback(() => {
        setNewGroup({
            name: "",
            description: "",
            category: "",
            avatar: "",
        });
        setCreateAvatarPreview(null);
    }, []);

    const handleCreateGroup = useCallback(
        async (e) => {
            e.preventDefault();

            // Validate before setting loading state
            if (!createAvatarFile) {
                toast.error("Ảnh đại diện là bắt buộc");
                return;
            }

            if (!newGroup.name?.trim()) {
                toast.error("Tên nhóm là bắt buộc");
                return;
            }

            if (!newGroup.description?.trim()) {
                toast.error("Mô tả là bắt buộc");
                return;
            }

            if (!newGroup.category) {
                toast.error("Danh mục là bắt buộc");
                return;
            }

            setIsCreateGroupLoading(true);

            try {
                const groupData = {
                    name: newGroup.name,
                    description: newGroup.description,
                    category: newGroup.category,
                    avatar: createAvatarFile,
                };

                const response = await createGroupApi(groupData);
                const isSuccess = response.success || response.data?.success;

                if (isSuccess) {
                    setNewGroup({
                        name: "",
                        description: "",
                        category: "",
                        avatar: "",
                    });
                    setCreateAvatarPreview(null);
                    setCreateAvatarFile(null);
                    setIsCreateGroupOpen(false);
                    toast.success(
                        response.message ||
                            response.data?.message ||
                            "Đã tạo nhóm thành công"
                    );
                    await loadGroupsData();
                } else {
                    toast.error(
                        response.message ||
                            response.data?.message ||
                            "Không thể tạo nhóm"
                    );
                }
            } catch (error) {
                console.error("Error creating group:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi tạo nhóm"
                );
            } finally {
                setIsCreateGroupLoading(false);
            }
        },
        [createAvatarFile, newGroup, loadGroupsData]
    );

    const handleEditClick = useCallback((group) => {
        setEditingGroup(group);
        setEditedGroup({ ...group });
        setEditAvatarPreview(group.avatar || null);
        setIsEditGroupOpen(true);
    }, []);

    const handleCreateAvatarUpload = useCallback((e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    "Chỉ chấp nhận file ảnh có định dạng .png, .jpg, .jpeg"
                );
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Kích thước ảnh tối đa là 2MB");
                return;
            }
            setCreateAvatarFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setCreateAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleEditAvatarUpload = useCallback((e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    "Chỉ chấp nhận file ảnh có định dạng .png, .jpg, .jpeg"
                );
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Kích thước ảnh tối đa là 2MB");
                return;
            }
            setEditAvatarFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const triggerCreateAvatarInput = useCallback(() => {
        if (createAvatarInputRef.current) createAvatarInputRef.current.click();
    }, []);

    const triggerEditAvatarInput = useCallback(() => {
        if (editAvatarInputRef.current) editAvatarInputRef.current.click();
    }, []);

    const removeCreateAvatar = useCallback(() => {
        setCreateAvatarPreview(null);
        setCreateAvatarFile(null);
        setNewGroup((prev) => ({
            ...prev,
            avatar: "",
            coverImage: "/images/default-image.png",
        }));
    }, []);

    const removeEditAvatar = useCallback(() => {
        setEditAvatarPreview(null);
        setEditAvatarFile(null);
        setEditedGroup((prev) => ({
            ...prev,
            avatar: "",
            coverImage: "/images/default-image.png",
        }));
    }, []);

    const handleUpdateGroup = useCallback(
        async (e) => {
            e.preventDefault();
            if (!editedGroup) return;

            // Validate before setting loading state
            const hasAvatar = editAvatarFile || editedGroup.avatar;
            if (!hasAvatar) {
                toast.error("Ảnh đại diện là bắt buộc");
                return;
            }

            if (!editedGroup.name?.trim()) {
                toast.error("Tên nhóm là bắt buộc");
                return;
            }

            if (!editedGroup.description?.trim()) {
                toast.error("Mô tả là bắt buộc");
                return;
            }

            if (!editedGroup.category) {
                toast.error("Danh mục là bắt buộc");
                return;
            }

            setIsEditGroupLoading(true);

            try {
                const groupData = {
                    name: editedGroup.name,
                    description: editedGroup.description,
                    category: editedGroup.category,
                };

                if (editAvatarFile) {
                    groupData.avatar = editAvatarFile;
                }

                const response = await updateGroupApi(
                    editedGroup.id,
                    groupData
                );
                const isSuccess = response.success || response.data?.success;

                if (isSuccess) {
                    setIsEditGroupOpen(false);
                    setEditingGroup(null);
                    setEditedGroup(null);
                    setEditAvatarPreview(null);
                    setEditAvatarFile(null);
                    toast.success(
                        response.message ||
                            response.data?.message ||
                            "Đã cập nhật thông tin nhóm thành công"
                    );
                    await loadGroupsData();
                } else {
                    toast.error(
                        response.message ||
                            response.data?.message ||
                            "Không thể cập nhật nhóm"
                    );
                }
            } catch (error) {
                console.error("Error updating group:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi cập nhật nhóm"
                );
            } finally {
                setIsEditGroupLoading(false);
            }
        },
        [editedGroup, editAvatarFile, loadGroupsData]
    );

    return (
        <div className="bg-[#f5f3f0] min-h-screen py-8 pt-8">
            <div className="w-full px-32">
                <div className="flex items-center justify-between">
                    <div className="mb-4">
                        <h1 className="text-4xl font-black  mb-2 page-header">
                            Nhóm và cộng đồng
                        </h1>
                        <p className="text-gray-600">
                            Kết nối với những người yêu thú cưng cùng sở thích
                            và chia sẻ kinh nghiệm.
                        </p>
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

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mb-4"
                >
                    <div className="flex justify-between items-center">
                        <TabsList className="bg-[#E6E4E0] rounded-lg">
                            <TabsTrigger
                                value="discover"
                                className="px-4  data-[state=active]:bg-[#91114D] data-[state=active]:text-white"
                            >
                                Khám phá
                            </TabsTrigger>
                            <TabsTrigger
                                value="my-groups"
                                className="px-4  data-[state=active]:bg-[#91114D] data-[state=active]:text-white"
                            >
                                Nhóm của tôi{" "}
                                <span className="!text-xs px-2 pb-0.5 py-0.25 bg-[#c1286f] text-white rounded-full ">
                                    {myGroupsCount}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <Dialog
                            open={isCreateGroupOpen}
                            onOpenChange={(open) => {
                                setIsCreateGroupOpen(open);
                                if (!open) {
                                    setNewGroup({
                                        name: "",
                                        description: "",
                                        category: "",
                                        avatar: "",
                                    });
                                    setCreateAvatarPreview(null);
                                }
                            }}
                        >
                            <DialogContent
                                className="sm:max-w-[550px]"
                                onInteractOutside={(event) => {
                                    event.preventDefault();
                                }}
                            >
                                <DialogHeader>
                                    <DialogTitle
                                        className={"page-header text-[22px]"}
                                    >
                                        Tạo nhóm mới
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateGroup}>
                                    <div className="grid gap-4 pb-6">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="avatar"
                                                className="text-right"
                                            >
                                                Ảnh đại diện
                                            </Label>
                                            <div className="col-span-3 flex items-center space-x-3">
                                                <div className="h-16 w-16 rounded overflow-hidden">
                                                    {createAvatarPreview ? (
                                                        <img
                                                            src={
                                                                createAvatarPreview
                                                            }
                                                            alt="avatar preview"
                                                            className="h-16 w-16 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-400">
                                                            <Users className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <input
                                                        ref={
                                                            createAvatarInputRef
                                                        }
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={
                                                            handleCreateAvatarUpload
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={
                                                            triggerCreateAvatarInput
                                                        }
                                                    >
                                                        Tải ảnh
                                                    </Button>
                                                    {createAvatarPreview && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={
                                                                removeCreateAvatar
                                                            }
                                                        >
                                                            Xóa
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="name"
                                                className="text-right"
                                            >
                                                Tên nhóm
                                            </Label>
                                            <Input
                                                id="name"
                                                value={newGroup.name}
                                                onChange={(e) =>
                                                    setNewGroup((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                placeholder="Tên nhóm của bạn"
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="description"
                                                className="text-right"
                                            >
                                                Mô tả
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={newGroup.description}
                                                onChange={(e) =>
                                                    setNewGroup((prev) => ({
                                                        ...prev,
                                                        description:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Mô tả nhóm"
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="category"
                                                className="text-right"
                                            >
                                                Danh mục
                                            </Label>
                                            <Select
                                                value={newGroup.category}
                                                onValueChange={(value) =>
                                                    setNewGroup((prev) => ({
                                                        ...prev,
                                                        category: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className="!w-full !col-span-3">
                                                    <SelectValue placeholder="Chọn danh mục" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dog">
                                                        Dành cho chó
                                                    </SelectItem>
                                                    <SelectItem value="cat">
                                                        Dành cho mèo
                                                    </SelectItem>
                                                    <SelectItem value="bird">
                                                        Dành cho chim
                                                    </SelectItem>
                                                    <SelectItem value="all">
                                                        Nhóm chung
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            className={"rounded-full"}
                                            variant="outline"
                                            onClick={() =>
                                                setIsCreateGroupOpen(false)
                                            }
                                            disabled={isCreateGroupLoading}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            className={
                                                "rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                                            }
                                            disabled={isCreateGroupLoading}
                                        >
                                            {isCreateGroupLoading ? (
                                                <div className="flex items-center">
                                                    <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                                                    <span>Đang thực hiện</span>
                                                </div>
                                            ) : (
                                                "Tạo nhóm"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={isEditGroupOpen}
                            onOpenChange={(open) => {
                                setIsEditGroupOpen(open);
                                if (!open) {
                                    setEditedGroup(null);
                                    setEditAvatarPreview(null);
                                }
                            }}
                        >
                            <DialogContent className="sm:max-w-[550px]">
                                <DialogHeader>
                                    <DialogTitle
                                        className={"page-header text-[22px]"}
                                    >
                                        Cập nhật nhóm
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdateGroup}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="edit-avatar"
                                                className="text-right"
                                            >
                                                Ảnh đại diện
                                            </Label>
                                            <div className="col-span-3 flex items-center space-x-3">
                                                <div className="h-16 w-16 rounded overflow-hidden">
                                                    {editAvatarPreview ||
                                                    editedGroup?.avatar ? (
                                                        <img
                                                            src={
                                                                editAvatarPreview ||
                                                                editedGroup?.avatar
                                                            }
                                                            alt="avatar"
                                                            className="h-16 w-16 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-400">
                                                            <Users className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <input
                                                        ref={editAvatarInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={
                                                            handleEditAvatarUpload
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={
                                                            triggerEditAvatarInput
                                                        }
                                                    >
                                                        Tải ảnh
                                                    </Button>
                                                    {(editAvatarPreview ||
                                                        editedGroup?.avatar) && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={
                                                                removeEditAvatar
                                                            }
                                                        >
                                                            Xóa
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="edit-name"
                                                className="text-right"
                                            >
                                                Tên nhóm
                                            </Label>
                                            <Input
                                                id="edit-name"
                                                value={editedGroup?.name || ""}
                                                onChange={(e) =>
                                                    setEditedGroup((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="col-span-3"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="edit-description"
                                                className="text-right"
                                            >
                                                Mô tả
                                            </Label>
                                            <Textarea
                                                id="edit-description"
                                                value={
                                                    editedGroup?.description ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setEditedGroup((prev) => ({
                                                        ...prev,
                                                        description:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Mô tả nhóm"
                                                className="col-span-3"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="edit-category"
                                                className="text-right"
                                            >
                                                Danh mục
                                            </Label>
                                            <Select
                                                value={
                                                    editedGroup?.category || ""
                                                }
                                                onValueChange={(value) =>
                                                    setEditedGroup((prev) => ({
                                                        ...prev,
                                                        category: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className="!w-full !col-span-3">
                                                    <SelectValue placeholder="Chọn danh mục" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dog">
                                                        Dành cho chó
                                                    </SelectItem>
                                                    <SelectItem value="cat">
                                                        Dành cho mèo
                                                    </SelectItem>
                                                    <SelectItem value="bird">
                                                        Dành cho chim
                                                    </SelectItem>
                                                    <SelectItem value="all">
                                                        Nhóm chung
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            className="rounded-full"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditGroupOpen(false);
                                                setEditedGroup(null);
                                                setEditAvatarPreview(null);
                                            }}
                                            disabled={isEditGroupLoading}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="rounded-full bg-[#91114D] hover:bg-[#91114D]/90"
                                            disabled={isEditGroupLoading}
                                        >
                                            {isEditGroupLoading ? (
                                                <div className="flex items-center">
                                                    <ButtonLoader className="h-4 w-4 mr-2 text-white" />
                                                    <span>Đang thực hiện</span>
                                                </div>
                                            ) : (
                                                "Cập nhật"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <TabsContent value="discover" className="mt-2">
                        <div className="mb-6 bg-white p-3 px-4 rounded-lg border border-gray-300">
                            <div className="flex items-end grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="col-span-1">
                                    <label className="text-sm font-medium mb-1 block">
                                        Tên nhóm
                                    </label>
                                    <Input
                                        placeholder="Nhập tên nhóm cần tìm..."
                                        value={filters.name}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-sm font-medium mb-1 block">
                                        Danh mục nhóm
                                    </label>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) =>
                                            handleFilterChange(
                                                "category",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className={"w-full"}>
                                            <SelectValue placeholder="Chọn danh mục nhóm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dog">
                                                Dành cho chó
                                            </SelectItem>
                                            <SelectItem value="cat">
                                                Dành cho mèo
                                            </SelectItem>
                                            <SelectItem value="bird">
                                                Dành cho chim
                                            </SelectItem>
                                            <SelectItem value="all">
                                                Tất cả
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-sm font-medium mb-1 block">
                                        Mức độ hoạt động
                                    </label>
                                    <Select
                                        value={filters.activity}
                                        onValueChange={(value) =>
                                            handleFilterChange(
                                                "activity",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className={"w-full"}>
                                            <SelectValue placeholder="Chọn mức độ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Tất cả
                                            </SelectItem>
                                            <SelectItem value="Cao">
                                                Cao
                                            </SelectItem>
                                            <SelectItem value="TB">
                                                Trung bình
                                            </SelectItem>
                                            <SelectItem value="Thấp">
                                                Thấp
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-sm font-medium mb-1 block">
                                        Số lượng thành viên
                                    </label>
                                    <Select
                                        value={filters.memberCount}
                                        onValueChange={(value) =>
                                            handleFilterChange(
                                                "memberCount",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className={"w-full"}>
                                            <SelectValue placeholder="Chọn phạm vi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Tất cả
                                            </SelectItem>
                                            <SelectItem value="small">
                                                Dưới 100
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                100 - 1000
                                            </SelectItem>
                                            <SelectItem value="large">
                                                Trên 1000
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Đặt lại bộ lọc
                                </Button>
                            </div>
                        </div>

                        {isLoading ? (
                            <LoadingSkeleton activeTab={activeTab} />
                        ) : (
                            <>
                                {filteredGroups.length === 0 ? (
                                    <EmptyState onReset={resetFilters} />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredGroups.map((group) => (
                                            <GroupCard
                                                key={group.id}
                                                group={group}
                                                onEdit={handleEditClick}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="my-groups" className="mt-6">
                        {isLoading ? (
                            <LoadingSkeleton activeTab={activeTab} />
                        ) : (
                            <>
                                {filteredGroups.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                                            <Users className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                                            Chưa có nhóm nào
                                        </h3>
                                        <p className="text-gray-500 text-center max-w-md">
                                            Bạn chưa tham gia hoặc tạo nhóm nào.
                                            Hãy khám phá và tham gia các nhóm
                                            thú vị!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredGroups.map((group) => (
                                            <GroupCard
                                                key={group.id}
                                                group={group}
                                                onEdit={handleEditClick}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
