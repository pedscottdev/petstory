import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Heart, 
  Share, 
  MoreHorizontal, 
  Bell, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  Plus,
  Edit,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PostCreation from '@/components/user/newfeed/PostCreation';
import PostItem from '@/components/user/newfeed/PostItem';
import { FloatingCreateButton } from '@/components/user/newfeed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const floatingButtonRef = useRef(null);
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample group data with cover image
  const [groupData, setGroupData] = useState({
    id: 1,
    name: "Cộng đồng chó Golden Retriever Việt Nam",
    members: 1250,
    posts: 42,
    category: "Chó",
    role: "Quản trị viên",
    description: "Chào mừng bạn đến với cộng đồng yêu quý Golden Retriever lớn nhất Việt Nam! Chúng tôi là những người yêu mến giống chó thân thiện, trung thành và thông minh này. Hãy chia sẻ kinh nghiệm chăm sóc, huấn luyện và kết nối với những người có cùng sở thích.",
    coverImage: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    memberImages: [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
      "https://randomuser.me/api/portraits/men/4.jpg",
      "https://randomuser.me/api/portraits/women/5.jpg"
    ]
  });

  // Sample member data with roles
  const [members] = useState([
    {
      id: 1,
      name: "Nguyễn Văn An",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      role: "Quản trị viên",
      email: "nguyenvanan@example.com"
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      role: "Thành viên",
      email: "tranthibinh@example.com"
    },
    {
      id: 3,
      name: "Lê Văn Cường",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      role: "Quản trị viên",
      email: "levancuong@example.com"
    },
    {
      id: 4,
      name: "Phạm Thị Dung",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      role: "Thành viên",
      email: "phamthidung@example.com"
    },
    {
      id: 5,
      name: "Hoàng Văn Em",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      role: "Thành viên",
      email: "hoangvanem@example.com"
    },
    {
      id: 6,
      name: "Vũ Thị Hoa",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      role: "Quản trị viên",
      email: "vuthihoa@example.com"
    },
    {
      id: 7,
      name: "Đỗ Văn Hải",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      role: "Thành viên",
      email: "dovanhai@example.com"
    }
  ]);

  // State for membership status (initially not joined)
  const [isMember, setIsMember] = useState(false);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [isLeaveLoading, setIsLeaveLoading] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // State for member dialog
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedGroup, setEditedGroup] = useState({ ...groupData });
  const [editAvatarPreview, setEditAvatarPreview] = useState(groupData.coverImage);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const editAvatarInputRef = useRef(null);

  // Filtered members based on search term
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Sample posts data in the format expected by PostItem
  const samplePosts = [
    {
      id: 1,
      user: {
        name: "Trần Văn Nam Anh",
        avatar: "https://randomuser.me/api/portraits/men/10.jpg"
      },
      time: "2 giờ trước",
      content: "Chia sẻ kinh nghiệm chăm sóc Golden Retriever khi thời tiết chuyển mùa. Các bạn nên chú ý bổ sung vitamin và thay đổi chế độ ăn phù hợp để chú cún nhà mình luôn khỏe mạnh nhé!",
      likes: 24,
      comments: 8,
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      user: {
        name: "Nguyễn Thị Mai Anh",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg"
      },
      time: "5 giờ trước",
      content: "Golden của mình tên là Mít Ướt, nay được 8 tháng tuổi. Bé rất hiếu động và đáng yêu. Có ai có kinh nghiệm huấn luyện Golden cái không? Bé nhà mình hơi bướng :)",
      likes: 15,
      comments: 3,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      user: {
        name: "Lê Hoàng Anh Tuấn",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      time: "1 ngày trước",
      content: "Buổi sáng cùng Golden của tôi! Bé tên là Đô, nay đã 3 tuổi rồi. Mỗi sáng chạy bộ cùng Đô là khởi đầu ngày mới tuyệt vời nhất!",
      likes: 42,
      comments: 12,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      user: {
        name: "Phạm Thu Hà Linh",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg"
      },
      time: "2 ngày trước",
      content: "Golden Retriever thực sự là giống chó tuyệt vời! Nhà mình nuôi được 2 năm rồi, bé rất trung thành và thông minh. Ai đang nuôi Golden chia sẻ kinh nghiệm chăm sóc lông cho bé với ạ?",
      likes: 31,
      comments: 7,
      image: null
    }
  ];

  const [posts, setPosts] = useState(samplePosts);

  const handlePostCreated = () => {
    // This function will be called when a new post is created
    console.log("New post created");
    // In a real app, you would fetch the updated posts from the server
  };

  const handleBackClick = () => {
    navigate('/groups');
  };

  // Handle join group
  const handleJoinGroup = () => {
    setIsJoinLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsMember(true);
      setIsJoinLoading(false);
      toast.success('Đã tham gia nhóm thành công');
      // Update member count
      setGroupData(prev => ({
        ...prev,
        members: prev.members + 1
      }));
    }, 1000);
  };

  // Handle leave group
  const handleLeaveGroup = () => {
    setIsLeaveLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsMember(false);
      setIsLeaveDialogOpen(false);
      setIsLeaveLoading(false);
      toast.success('Đã rời nhóm thành công');
      // Update member count
      setGroupData(prev => ({
        ...prev,
        members: prev.members - 1
      }));
    }, 1000);
  };

  // Handle avatar upload for editing group
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
        setEditedGroup(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input for editing group
  const triggerEditAvatarInput = () => {
    if (editAvatarInputRef.current) editAvatarInputRef.current.click();
  };

  // Remove avatar for editing group
  const removeEditAvatar = () => {
    setEditAvatarPreview(null);
    setEditedGroup(prev => ({ ...prev, coverImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80" }));
  };

  // Handle update group form submission
  const handleUpdateGroup = (e) => {
    e.preventDefault();
    
    // Set loading state
    setIsEditLoading(true);
    
    // Validate group data sequentially
    // Validate name (required)
    if (!editedGroup.name || editedGroup.name.trim() === '') {
      toast.error('Tên nhóm là bắt buộc');
      setIsEditLoading(false);
      return;
    }
    
    // Validate description (required)
    if (!editedGroup.description || editedGroup.description.trim() === '') {
      toast.error('Mô tả là bắt buộc');
      setIsEditLoading(false);
      return;
    }
    
    // Simulate API call delay
    setTimeout(() => {
      // Update the group data
      setGroupData(editedGroup);
      
      // Close dialog and reset state
      setIsEditDialogOpen(false);
      setIsEditLoading(false);
      
      toast.success('Đã cập nhật thông tin nhóm thành công');
    }, 1000); // Simulate 1 second delay
  };

  // Open edit dialog with current group data
  const openEditDialog = () => {
    setEditedGroup({ ...groupData });
    setEditAvatarPreview(groupData.coverImage);
    setIsEditDialogOpen(true);
  };

  // Simulate loading data when component mounts
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleOpenCreateDialog = () => {
    if (floatingButtonRef.current) {
      floatingButtonRef.current.openDialog();
    }
  };

  // Skeleton loading component for group header
  const GroupHeaderSkeleton = () => (
    <div className="relative bg-white mx-48 rounded-xl border border-gray-300">
      {/* Cover Image Skeleton */}
      <div className="h-56 rounded-t-xl">
        <Skeleton className="w-full h-full rounded-t-xl bg-gray-300" />
      </div>
      
      {/* Group Info Skeleton */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between -mt-24 md:-mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
            <div className="pt-20">
              <Skeleton className="h-8 w-64 mb-2 bg-gray-300" />
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Skeleton className="h-4 w-24 bg-gray-300" />
                <Skeleton className="h-4 w-24 bg-gray-300" />
                <Skeleton className="h-6 w-16 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-32 rounded-full bg-gray-300" />
            <Skeleton className="h-10 w-32 rounded-full bg-gray-300" />
            <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );

  // Skeleton loading component for group content
  const GroupContentSkeleton = () => (
    <div className="w-full px-48 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Group Info Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          {/* About Card Skeleton */}
          <Card className="rounded-xl border border-gray-300 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-300" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 bg-gray-300" />
              <Skeleton className="h-4 w-4/5 mb-4 bg-gray-300" />
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 bg-gray-300" />
                  <Skeleton className="h-4 w-24 bg-gray-300" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 bg-gray-300" />
                  <Skeleton className="h-4 w-20 bg-gray-300" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 bg-gray-300" />
                  <Skeleton className="h-4 w-32 bg-gray-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Members Preview Skeleton */}
          <Card className="rounded-xl border border-gray-300 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-300" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1 bg-gray-300" />
                        <Skeleton className="h-3 w-16 bg-gray-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Middle Column - Posts Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post Creation Skeleton */}
          <Card className="shadow-none rounded-xl border border-gray-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
                <Skeleton className="h-10 flex-1 rounded-full bg-gray-300" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24 rounded bg-gray-300" />
                <Skeleton className="h-8 w-24 rounded bg-gray-300" />
                <Skeleton className="h-8 w-24 rounded bg-gray-300" />
              </div>
            </CardContent>
          </Card>
          
          {/* Posts Feed Skeleton */}
          <div className="space-y-6">
            {[1, 2].map((item) => (
              <Card key={item} className="shadow-none rounded-xl border border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1 bg-gray-300" />
                      <Skeleton className="h-3 w-20 bg-gray-300" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded bg-gray-300" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2 bg-gray-300" />
                  <Skeleton className="h-4 w-4/5 mb-4 bg-gray-300" />
                  <Skeleton className="h-64 w-full rounded-lg mb-4 bg-gray-300" />
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 mr-1 bg-gray-300" />
                        <Skeleton className="h-4 w-4 bg-gray-300" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 mr-1 bg-gray-300" />
                        <Skeleton className="h-4 w-4 bg-gray-300" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 mr-1 bg-gray-300" />
                      <Skeleton className="h-4 w-4 bg-gray-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className=' bg-[#f5f3f0] min-h-screen pt-6 mx-auto'>
      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={'page-header text-[22px]'}>Xác nhận rời nhóm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời nhóm "{groupData.name}" không? Sau khi rời nhóm sẽ không thể đăng bài viết trong nhóm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaveLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveGroup} 
              className="bg-red-700 hover:bg-red-700/80"
              disabled={isLeaveLoading}
            >
              {isLeaveLoading ? 'Đang thực hiện...' : 'Rời nhóm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditedGroup({ ...groupData });
          setEditAvatarPreview(groupData.coverImage);
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className={'page-header text-[22px]'}>Cập nhật thông tin nhóm</DialogTitle>
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
                    {editAvatarPreview ? (
                      <img src={editAvatarPreview} alt="avatar" className="h-16 w-16 object-cover" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-400">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input ref={editAvatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditAvatarUpload} />
                    <Button type="button" variant="outline" onClick={triggerEditAvatarInput}>Tải ảnh</Button>
                    {editAvatarPreview && (
                      <Button type="button" variant="ghost" onClick={removeEditAvatar}>Xóa</Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Tên nhóm</Label>
                <Input
                  id="edit-name"
                  value={editedGroup.name}
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
                  value={editedGroup.description}
                  onChange={(e) => setEditedGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả nhóm"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Danh mục</Label>
                <Select value={editedGroup.category || 'dog'} onValueChange={(value) => setEditedGroup(prev => ({ ...prev, category: value }))}>
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
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}
                disabled={isEditLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isEditLoading}>
                {isEditLoading ? 'Đang thực hiện...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Danh sách thành viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tìm kiếm thành viên..."
              value={memberSearchTerm}
              onChange={(e) => setMemberSearchTerm(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-96 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email || 'email@example.com'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/profile/${member.id}`)}
                    >
                      Xem trang cá nhân
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">Không tìm thấy thành viên</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Show skeleton while loading */}
      {isLoading ? (
        <>
          <GroupHeaderSkeleton />
          <GroupContentSkeleton />
        </>
      ) : (
        <>
          {/* Group Header */}
          <div className="relative bg-white mx-48 rounded-xl border border-gray-300">
            {/* Cover Image */}
            <div className="h-56 rounded-t-xl">
              <img 
                src={groupData.coverImage} 
                alt={groupData.name} 
                className="w-full h-full object-cover rounded-t-xl"
              />
            </div>
            
            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-8 -left-8 bg-white backdrop-blur-sm rounded-full active:scale-90  transition-all duration-200 border-gray-300 border size-16"
              onClick={handleBackClick}
            >
              <ArrowLeft className="!h-7 !w-7" />
            </Button>

            {/* Category Label */}
            <div className="absolute top-6 right-6 bg-white rounded-full active:scale-90  px-4 py-1 opacity-90">
              <span className="text-sm font-semibold text-[#91114D]">Dành cho {groupData.category}</span>
            </div>
            
            {/* Group Info */}
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between -mt-24 md:-mt-16 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
                  
                  <div className="pt-20">
                    <h1 className="text-2xl md:text-3xl font-bold ">{groupData.name}</h1>
                    <div className="flex flex-wrap items-center mt-2 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{groupData.members} thành viên</span>
                      </div>
                       <div className="h-1 w-1 rounded-full bg-gray-400 mx-3"></div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{groupData.posts} bài viết</span>
                      </div>
                      <div className="h-1 w-1 rounded-full bg-gray-400 mx-3"></div>
                      <div className="bg-white/20 font-medium py-1 rounded-full">
                        Bạn là {groupData.role}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-6">
                  <Button variant="outline" className="bg-white/80 backdrop-blur-sm rounded-full" onClick={openEditDialog}>
                    <Edit className="h-4 w-4" />
                    Cập nhật thông tin
                  </Button>
                  {isMember ? (
                    <Button 
                      variant="outline" 
                      className="bg-white/80 backdrop-blur-sm rounded-full"
                      onClick={() => setIsLeaveDialogOpen(true)}
                      disabled={isLeaveLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLeaveLoading ? 'Đang thực hiện...' : 'Rời nhóm'}
                    </Button>
                  ) : (
                    <Button 
                      className="bg-[#91114D] hover:bg-[#7a0e41] rounded-full"
                      onClick={handleJoinGroup}
                      disabled={isJoinLoading}
                    >
                      {isJoinLoading ? 'Đang thực hiện...' : 'Tham gia nhóm'}
                    </Button>
                  )}
                  <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full px-48 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Group Info */}
              <div className="lg:col-span-1 space-y-4">
                {/* About Card */}
                <Card className={"gap-y-3 rounded-xl border border-gray-300 shadow-none"}>
                  <CardHeader>
                    <CardTitle className={'!text-lg font-bold leading-none'}>
                      Giới thiệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{groupData.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{groupData.members} thành viên</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Việt Nam</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        <span>golden-retriever.vn</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Members Preview */}
                <Card className={"rounded-xl border gap-y-3 border-gray-300 shadow-none"}>
                  <CardHeader className={''}>
                    <CardTitle className={'text-lg font-bold leading-none'}>Thành viên ({groupData.members})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Sort members to show administrators first, then limit to 6 */}
                      {[...members]
                        .sort((a, b) => {
                          if (a.role === "Quản trị viên" && b.role !== "Quản trị viên") return -1;
                          if (a.role !== "Quản trị viên" && b.role === "Quản trị viên") return 1;
                          return 0;
                        })
                        .slice(0, 6)
                        .map((member) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-[15px]">{member.name}</p>
                                <p className={`!text-xs ${member.role === "Quản trị viên" ? "text-[#91114D]" : "text-gray-600"}`}>{member.role}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {/* View all members button */}
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full rounded-full"
                          onClick={() => setIsMemberDialogOpen(true)}
                        >
                          Xem tất cả
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Middle Column - Posts */}
              <div className="lg:col-span-2 space-y-4 ">
                {/* Post Creation - Only shown if user is a member */}
                {isMember ? (
                  <PostCreation onOpenDialog={handleOpenCreateDialog} />
                ) : (
                  <Card className="shadow-none rounded-xl border border-gray-300">
                    <CardContent className="p-6 py-3 text-center">
                      <p className="text-xl font-bold text-gray-700">Bạn chưa phải thành viên nhóm</p>
                      <p className="text-gray-700">Hãy tham gia nhóm để đăng bài trong nhóm</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Posts Feed - Using PostItem components */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostItem key={post.id} post={post} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <FloatingCreateButton ref={floatingButtonRef} />
    </div>
  );
}