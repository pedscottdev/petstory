import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, MessageSquare, Heart, Bell, Eye, Filter, RefreshCcw, LineChart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
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
import { BiReset } from 'react-icons/bi';
import { toast } from 'sonner';
import { FcRating } from 'react-icons/fc';

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState('discover');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isCreateGroupLoading, setIsCreateGroupLoading] = useState(false);
  const [isEditGroupLoading, setIsEditGroupLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    category: 'all',
    activity: '',
    memberCount: '',
  });

  // Refs for file inputs
  const createAvatarInputRef = useRef(null);
  const editAvatarInputRef = useRef(null);

  // State for avatar previews
  const [createAvatarPreview, setCreateAvatarPreview] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);

  // State for group forms
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: '',
    avatar: ''
  });
  const [editingGroup, setEditingGroup] = useState(null);
  const [editedGroup, setEditedGroup] = useState(null);

  // Sample data for groups with specific cover images and categories
  const sampleGroups = [
    {
      id: 1,
      name: "Cộng đồng chó Golden Retriever Việt Nam",
      description: "Nơi chia sẻ kinh nghiệm chăm sóc và huấn luyện chó Golden Retriever",
      members: 1250,
      posts: 42,
      activity: "Cao",
      role: "Quản trị",
      category: "dog",
      isMine: true,
      avatar: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=80&h=80&q=60",
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
      name: "Chó Pitbull - British Shorthair",
      description: "Cộng đồng yêu thích Chó Pitbull, chia sẻ chăm sóc và nuôi dưỡng",
      members: 890,
      posts: 28,
      activity: "TB",
      role: "Thành viên",
      category: "cat",
      isMine: false,
      avatar: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=80&h=80&q=60",
      coverImage: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Nguyễn Thị Mai",
        content: "Giới thiệu chú mèo British   Shorthair của mình, tên là Mít Ướt...",
        likes: 15,
        comments: 3,
        time: "5 giờ trước"
      }
    },
    {
      id: 3,
      name: "Chăm sóc thú cưng cho người mới bắt đầu",
      description: "Hướng dẫn chi tiết cho người mới bắt đầu nuôi thú cưng",
      members: 3420,
      posts: 126,
      activity: "Cao",
      role: "Điều hành",
      category: "dog",
      isMine: false,
      avatar: "https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?auto=format&fit=crop&w=80&h=80&q=60",
      coverImage: "https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Lê Minh Đức",
        content: "Tổng hợp các lỗi phổ biến khi nuôi thú cưng lần đầu và cách khắc phục...",
        likes: 56,
        comments: 12,
        time: "1 ngày trước"
      }
    },
    {
      id: 4,
      name: "Cộng đồng mèo Anh lông dài",
      description: "Chia sẻ kinh nghiệm chăm sóc mèo Anh lông dài",
      members: 560,
      posts: 32,
      activity: "TB",
      role: "Thành viên",
      category: "cat",
      isMine: true,
      avatar: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=80&h=80&q=60",
      coverImage: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Phạm Thu Hà",
        content: "Chia sẻ cách chải lông cho mèo Anh lông dài đúng cách...",
        likes: 18,
        comments: 5,
        time: "3 giờ trước"
      }
    },
    {
      id: 5,
      name: "Chó Poodle - Cộng đồng yêu thích",
      description: "Nơi dành cho những người yêu thích chó Poodle",
      members: 2100,
      posts: 87,
      activity: "Cao",
      role: "Quản trị",
      category: "dog",
      isMine: false,
      avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=80&h=80&q=60",
      coverImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Nguyễn Văn Hùng",
        content: "Tổng hợp các kiểu cắt tỉa cho chó Poodle đẹp nhất 2023...",
        likes: 42,
        comments: 15,
        time: "4 giờ trước"
      }
    },
    {
      id: 6,
      name: "Mèo ta - Mèo mướp Việt Nam",
      description: "Bảo vệ và phát triển mèo ta Việt Nam",
      members: 320,
      posts: 15,
      activity: "Thấp",
      role: "Thành viên",
      category: "cat",
      isMine: false,
      avatar: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=80&h=80&q=60",
      coverImage: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Trần Thị Lan",
        content: "Chia sẻ kinh nghiệm nuôi mèo ta khỏe mạnh, ít bệnh...",
        likes: 9,
        comments: 2,
        time: "1 ngày trước"
      }
    },
    {
      id: 7,
      name: "Chó ta - Chó cỏ Việt Nam",
      description: "Bảo tồn và phát triển chó ta Việt Nam",
      members: 780,
      posts: 41,
      activity: "TB",
      role: "Thành viên",
      category: "dog",
      isMine: false,
      avatar: "https://images.unsplash.com/photo-1598133893779-70da31085e59?auto=format&fit=crop&w=80&h=80&q=60",
      coverImage: "https://images.unsplash.com/photo-1598133893779-70da31085e59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
      latestPost: {
        author: "Lê Văn Quang",
        content: "Tại sao chó ta lại khỏe hơn chó nhập khẩu?",
        likes: 31,
        comments: 18,
        time: "6 giờ trước"
      }
    }
  ];

  // Keep groups in state so we can update them (edit avatar, name, etc.)
  const [groups, setGroups] = useState(sampleGroups);

  // Simulate loading when switching tabs or mounting component
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Filter groups based on selected filters and active tab
  const filteredGroups = groups.filter(group => {
    // Exclude user's own groups from the discover tab
    if (activeTab === 'discover' && group.isMine) {
      return false;
    }

    // Filter by name
    if (filters.name && !group.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.category !== 'all' && group.category !== filters.category) {
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
      name: '',
      category: 'all',
      activity: '',
      memberCount: '',
    });
  };

  // Reset new group form
  const resetNewGroupForm = () => {
    setNewGroup({
      name: '',
      description: '',
      category: '',
      avatar: ''
    });
    setCreateAvatarPreview(null);
  };

  // Handle create group form submission
  const handleCreateGroup = (e) => {
    e.preventDefault();

    // Set loading state
    setIsCreateGroupLoading(true);

    // Validate group data sequentially
    // Validate avatar (required)
    if (!newGroup.avatar) {
      toast.error('Ảnh đại diện là bắt buộc');
      setIsCreateGroupLoading(false);
      return;
    }

    // Validate name (required)
    if (!newGroup.name || newGroup.name.trim() === '') {
      toast.error('Tên nhóm là bắt buộc');
      setIsCreateGroupLoading(false);
      return;
    }

    // Validate description (required)
    if (!newGroup.description || newGroup.description.trim() === '') {
      toast.error('Mô tả là bắt buộc');
      setIsCreateGroupLoading(false);
      return;
    }

    // Validate category (required)
    if (!newGroup.category) {
      toast.error('Danh mục là bắt buộc');
      setIsCreateGroupLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      // Here you would typically send the data to your backend
      console.log('Creating new group', newGroup);

      // Create a new group object
      const newGroupObj = {
        id: groups.length + 1,
        name: newGroup.name,
        description: newGroup.description,
        members: 1,
        posts: 0,
        activity: "Thấp",
        role: "Quản trị",
        category: newGroup.category,
        isMine: true,
        avatar: newGroup.avatar,
        // Set coverImage to the same value as avatar
        coverImage: newGroup.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80",
        latestPost: {
          author: "Bạn",
          content: "Nhóm mới được tạo",
          likes: 0,
          comments: 0,
          time: "Vừa xong"
        }
      };

      // Add to groups state
      setGroups(prev => [newGroupObj, ...prev]);

      // Reset form and close dialog
      setNewGroup({
        name: '',
        description: '',
        category: '',
        avatar: ''
      });
      setCreateAvatarPreview(null);
      setIsCreateGroupOpen(false);
      setIsCreateGroupLoading(false);

      toast.success('Đã tạo nhóm thành công');
    }, 1000); // Simulate 1 second delay
  };

  // Count of my groups
  const myGroupsCount = groups.filter(g => g.isMine).length;

  // --- Edit group handlers ---
  const handleEditClick = (group) => {
    setEditingGroup(group);
    setEditedGroup({ ...group });
    setEditAvatarPreview(group.avatar || null);
    setIsEditGroupOpen(true);
  };

  // Handle avatar upload for new group
  const handleCreateAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validate file type - only allow png, jpg, jpeg
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh có định dạng .png, .jpg, .jpeg');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateAvatarPreview(reader.result);
        setNewGroup(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validate file type - only allow png, jpg, jpeg
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh có định dạng .png, .jpg, .jpeg');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result);
        setEditedGroup(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input for new group
  const triggerCreateAvatarInput = () => {
    if (createAvatarInputRef.current) createAvatarInputRef.current.click();
  };

  const triggerEditAvatarInput = () => {
    if (editAvatarInputRef.current) editAvatarInputRef.current.click();
  };

  // Remove avatar for new group
  const removeCreateAvatar = () => {
    setCreateAvatarPreview(null);
    setNewGroup(prev => ({ ...prev, avatar: '', coverImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80" }));
  };

  // Remove avatar for editing group
  const removeEditAvatar = () => {
    setEditAvatarPreview(null);
    setEditedGroup(prev => ({ ...prev, avatar: '', coverImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80" }));
  };

  const handleUpdateGroup = (e) => {
    e.preventDefault();
    if (!editedGroup) return;

    // Set loading state
    setIsEditGroupLoading(true);

    // Validate group data sequentially
    // Validate avatar (required)
    const finalAvatar = editAvatarPreview || editedGroup.avatar;
    if (!finalAvatar) {
      toast.error('Ảnh đại diện là bắt buộc');
      setIsEditGroupLoading(false);
      return;
    }

    // Validate name (required)
    if (!editedGroup.name || editedGroup.name.trim() === '') {
      toast.error('Tên nhóm là bắt buộc');
      setIsEditGroupLoading(false);
      return;
    }

    // Validate description (required)
    if (!editedGroup.description || editedGroup.description.trim() === '') {
      toast.error('Mô tả là bắt buộc');
      setIsEditGroupLoading(false);
      return;
    }

    // Validate category (required)
    if (!editedGroup.category) {
      toast.error('Danh mục là bắt buộc');
      setIsEditGroupLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      setGroups(prev => prev.map(g => {
        if (g.id !== editedGroup.id) return g;
        // Determine the new avatar value
        const newAvatar = finalAvatar || g.avatar;
        return {
          ...g,
          name: editedGroup.name,
          description: editedGroup.description,
          category: editedGroup.category,
          // Replace avatar with preview if provided (for demo)
          avatar: newAvatar,
          // Also update coverImage to match the avatar
          coverImage: newAvatar || editedGroup.coverImage || g.coverImage,
        };
      }));
      setIsEditGroupOpen(false);
      setEditingGroup(null);
      setEditedGroup(null);
      setEditAvatarPreview(null);
      setIsEditGroupLoading(false);
      toast.success('Đã cập nhật thông tin nhóm thành công');
    }, 1000); // Simulate 1 second delay
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Featured groups - 1 row */}
      {activeTab === 'discover' && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <Card key={`featured-${item}`} className="pt-0 overflow-hidden rounded-2xl border border-gray-300">
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
                        <div key={avatar} className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
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
        <Card key={`other-${item}`} className="pt-0 overflow-hidden rounded-2xl border border-gray-300">
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
                  <div key={avatar} className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                ))}
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
      <p className="text-gray-500 text-center max-w-md">
        Không có nhóm nào phù hợp với các bộ lọc hiện tại. Hãy thử thay đổi hoặc đặt lại bộ lọc.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={resetFilters}
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Đặt lại bộ lọc
      </Button>
    </div>
  );

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
                Nhóm của tôi <span className='!text-xs px-2 pb-0.5 py-0.25 bg-[#c1286f] text-white rounded-full '>{myGroupsCount}</span>
              </TabsTrigger>
            </TabsList>

            <Dialog open={isCreateGroupOpen} onOpenChange={(open) => {
              setIsCreateGroupOpen(open);
              if (!open) {
                setNewGroup({
                  name: '',
                  description: '',
                  category: '',
                  avatar: ''
                });
                setCreateAvatarPreview(null);
              }
            }}>
              <DialogContent
                className="sm:max-w-[550px]"
                onInteractOutside={(event) => {
                  event.preventDefault()
                }}

              >
                <DialogHeader>
                  <DialogTitle className={'page-header text-[22px]'}>Tạo nhóm mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup}>
                  <div className="grid gap-4 pb-6">
                    {/* Avatar Upload Section */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="avatar" className="text-right">
                        Ảnh đại diện
                      </Label>
                      <div className="col-span-3 flex items-center space-x-3">
                        <div className="h-16 w-16 rounded overflow-hidden">
                          {createAvatarPreview ? (
                            <img src={createAvatarPreview} alt="avatar preview" className="h-16 w-16 object-cover" />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-400">
                              <Users className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            ref={createAvatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCreateAvatarUpload}
                          />
                          <Button type="button" variant="outline" onClick={triggerCreateAvatarInput}>
                            Tải ảnh
                          </Button>
                          {createAvatarPreview && (
                            <Button type="button" variant="ghost" onClick={removeCreateAvatar}>
                              Xóa
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Tên nhóm
                      </Label>
                      <Input
                        id="name"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tên nhóm của bạn"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Mô tả
                      </Label>
                      <Textarea
                        id="description"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả nhóm"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Danh mục
                      </Label>
                      <Select
                        value={newGroup.category}
                        onValueChange={(value) => setNewGroup(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="!w-full !col-span-3">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Chó</SelectItem>
                          <SelectItem value="cat">Mèo</SelectItem>
                          <SelectItem value="bird">Chim</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      className={'rounded-full'}
                      variant="outline"
                      onClick={() => setIsCreateGroupOpen(false)}
                      disabled={isCreateGroupLoading}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className={'rounded-full bg-[#91114D] hover:bg-[#91114D]/90'}
                      disabled={isCreateGroupLoading}
                    >
                      {isCreateGroupLoading ? 'Đang thực hiện...' : 'Tạo nhóm'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {/* Edit Group Dialog */}
            <Dialog open={isEditGroupOpen} onOpenChange={(open) => {
              setIsEditGroupOpen(open);
              if (!open) {
                setEditedGroup(null);
                setEditAvatarPreview(null);
              }
            }}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle className={'page-header text-[22px]'}>Cập nhật nhóm</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateGroup}>
                  <div className="grid gap-4 py-4">
                    {/* Avatar Upload Section */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-avatar" className="text-right">
                        Ảnh đại diện
                      </Label>
                      <div className="col-span-3 flex items-center space-x-3">
                        <div className="h-16 w-16 rounded overflow-hidden">
                          {editAvatarPreview || editedGroup?.avatar ? (
                            <img src={editAvatarPreview || editedGroup?.avatar} alt="avatar" className="h-16 w-16 object-cover" />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-400">
                              <Users className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <input ref={editAvatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditAvatarUpload} />
                          <Button type="button" variant="outline" onClick={triggerEditAvatarInput}>Tải ảnh</Button>
                          {(editAvatarPreview || editedGroup?.avatar) && (
                            <Button type="button" variant="ghost" onClick={removeEditAvatar}>Xóa</Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-name" className="text-right">Tên nhóm</Label>
                      <Input
                        id="edit-name"
                        value={editedGroup?.name || ''}
                        onChange={(e) => setEditedGroup(prev => ({ ...prev, name: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-description" className="text-right">
                        Mô tả
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={editedGroup?.description || ''}
                        onChange={(e) => setEditedGroup(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả nhóm"
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-category" className="text-right">Danh mục</Label>
                      <Select value={editedGroup?.category || ''} onValueChange={(value) => setEditedGroup(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="!w-full !col-span-3">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Chó</SelectItem>
                          <SelectItem value="cat">Mèo</SelectItem>
                          <SelectItem value="bird">Chim</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { setIsEditGroupOpen(false); setEditedGroup(null); setEditAvatarPreview(null); }}
                      disabled={isEditGroupLoading}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isEditGroupLoading}>
                      {isEditGroupLoading ? 'Đang thực hiện...' : 'Cập nhật'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Discover Tab Content */}
          <TabsContent value="discover" className="mt-2">
            {/* Filters */}
            <div className="mb-6 bg-white p-3 px-4 rounded-lg border border-gray-300">
              <div className="flex items-end grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Tên nhóm</label>
                  <Input
                    placeholder="Nhập tên nhóm cần tìm..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                  />
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Danh mục nhóm</label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger className={'w-full'}>
                      <SelectValue placeholder="Chọn danh mục nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="dog">Dành cho chó</SelectItem>
                      <SelectItem value="cat">Dành cho mèo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Mức độ hoạt động</label>
                  <Select value={filters.activity} onValueChange={(value) => handleFilterChange('activity', value)}>
                    <SelectTrigger className={'w-full'}>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cao">Cao</SelectItem>
                      <SelectItem value="TB">Trung bình</SelectItem>
                      <SelectItem value="Thấp">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Số lượng thành viên</label>
                  <Select value={filters.memberCount} onValueChange={(value) => handleFilterChange('memberCount', value)}>
                    <SelectTrigger className={'w-full'}>
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
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Đặt lại bộ lọc
                </Button>
              </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Empty state */}
                {filteredGroups.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGroups.map((group) => (
                      <GroupCard key={group.id} group={group} onEdit={handleEditClick} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* My Groups Tab Content */}
          <TabsContent value="my-groups" className="mt-6">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.filter(g => g.isMine).map((group) => (
                  <GroupCard key={group.id} group={group} onEdit={handleEditClick} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Group Card Component
function GroupCard({ group, onEdit }) {
  // Function to get category label
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'dog':
        return 'Dành cho chó';
      case 'cat':
        return 'Dành cho mèo';
      case 'bird':
        return 'Dành cho chim';
      default:
        return 'Chung';
    }
  };

  return (
    <Card className="pt-0 overflow-hidden rounded-3xl border border-gray-300 hover:shadow-md transition-shadow">
      {/* Cover Image */}
      <div className="p-4 pb-0 relative">
        <img
          src={group.coverImage}
          alt={group.name}
          className="rounded-xl h-48 w-full object-cover"
          onError={(e) => {
            // Fallback to a default stock image if the provided image fails to load
            e.target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80";
          }}
        />
        {/* Category Badge */}
        <div className="absolute bottom-4 left-8 bg-white text-[#91114D] text-xs font-semibold px-3 py-1.5 opacity-85 rounded-lg">
          {getCategoryLabel(group.category)}
        </div>
      </div>

      <CardHeader className="!px-4">
        <div className="flex items-center">
          <CardTitle className="!px-0 text-lg font-bold line-clamp-2">{group.name}</CardTitle>
        </div>

        {/* Group Stats */}
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
        {/* Group Description */}
        <div className="mb-4 pb-2 px-0 border-b border-gray-100">
          <p className="text-sm text-gray-600 h-10 overflow-hidden line-clamp-2">
            {group.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <AvatarGroup className="rounded-full">
            {/* Show avatars based on actual member count, up to 3 */}
            {Array.from({ length: Math.min(group.members, 3) }, (_, index) => (
              <AvatarGroup.Item
                key={index}
                src={`https://i.pravatar.cc/150?img=${index + 1}`}
                alt={`Member ${index + 1}`}
                fallback={`M${index + 1}`}
              />
            ))}
            {/* Show remaining count if more than 3 members */}
            {group.members > 3 && (
              <AvatarGroup.Item
                fallback={`+${group.members - 3}`}
                className="text-xs bg-gray-100 text-gray-700 font-medium"
              />
            )}
          </AvatarGroup>

          <div className="flex items-center space-x-2">
            {group.isMine && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => onEdit && onEdit(group)}>
                Cập nhật
              </Button>
            )}

            <Button asChild size="sm" className="rounded-full bg-[#91114D] hover:bg-[#7a0e41]">
              <Link to={`/groups/${group.id}`}>
                Xem nhóm
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}