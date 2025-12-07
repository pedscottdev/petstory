import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/api/userApi';
import { useImageUpload } from '@/hooks/useImageUpload';
import { getAvatarUrl } from '@/utils/imageUtils';
import axios from 'axios';

export default function PersonalInfo() {
  const { user, refreshUserFromServer } = useAuth();
  const { uploadUserAvatar, isLoading: isUploading } = useImageUpload();

  // State for personal info section
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: ''
  });

  // State for avatar
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // State to track if forms have been modified
  const [personalInfoModified, setPersonalInfoModified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      // Use getAvatarUrl to properly handle avatar URL
      const fullName = `${user.last_name || ''} ${user.first_name || ''}`.trim() || 'User';
      setAvatarPreview(getAvatarUrl(user.avatar_url, fullName));
      setLoading(false);
    }
  }, [user]);

  // Handle personal info changes
  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setPersonalInfoModified(true);
  };

  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn một tệp hình ảnh');
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 2MB');
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setPersonalInfoModified(true);
    }
  };

  // Reset personal info form
  const handleResetPersonalInfo = () => {
    if (user) {
      setPersonalInfo({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      setAvatar(null);
      // Use getAvatarUrl to properly handle avatar URL
      const fullName = `${user.last_name || ''} ${user.first_name || ''}`.trim() || 'User';
      setAvatarPreview(getAvatarUrl(user.avatar_url, fullName));
      setPersonalInfoModified(false);
      toast.info('Đã hủy thay đổi thông tin cá nhân');
    }
  };

  // Save personal info
  const handleSavePersonalInfo = async () => {
    setSubmitting(true);
    try {

      let avatarUrl = user?.avatar_url || '';

      // Upload avatar if changed
      if (avatar) {
        try {
          const uploadResult = await uploadUserAvatar(avatar);
          if (uploadResult?.path || uploadResult?.url) {
            avatarUrl = uploadResult.url || `/storage/${uploadResult.path}`;
          }
        } catch (error) {
          toast.error('Lỗi khi tải lên ảnh đại diện');
          setSubmitting(false);
          return;
        }
      }

      // Update profile
      const response = await updateUserProfile({
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        bio: personalInfo.bio,
        avatar_url: avatarUrl
      });

      if (response?.success) {
        // Refresh user data from server
        await refreshUserFromServer();
        setAvatar(null);
        setPersonalInfoModified(false);
        toast.success('Đã lưu thông tin cá nhân thành công!');
      } else {
        toast.error(response?.message || 'Lỗi khi lưu thông tin');
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu thông tin cá nhân');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="border bg-white border-gray-300 rounded-xl p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="border bg-white border-gray-300 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>

      {/* Avatar Section */}
      <div className="flex items-center mb-4 space-x-6">
        <div className="relative">
          <Avatar className="h-14 w-14">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt="Avatar preview" />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {personalInfo.first_name?.charAt(0)}{personalInfo.last_name?.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 -right-3  rounded-full p-2 cursor-pointer bg-slate-700 transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="space-y-2">
          <Label>Ảnh đại diện</Label>
          <p className="text-sm text-muted-foreground">Định dạng hỗ trợ JPG, JPEG, PNG. Kích thước tối đa 2MB.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-2">
          <Label htmlFor="last_name">Họ và tên đệm</Label>
          <Input
            id="last_name"
            value={personalInfo.last_name}
            onChange={(e) => handlePersonalInfoChange('last_name', e.target.value)}
            placeholder="Họ và tên đệm"
            className={"bg-white"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="first_name">Tên</Label>
          <Input
            id="first_name"
            value={personalInfo.first_name}
            onChange={(e) => handlePersonalInfoChange('first_name', e.target.value)}
            placeholder="Tên"
            className={"bg-white"}
          />
        </div>


        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            disabled
            placeholder="Email"
            className={"bg-white cursor-not-allowed opacity-60"}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio">Tiểu sử</Label>
          <textarea
            id="bio"
            value={personalInfo.bio}
            onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
            placeholder="Giới thiệu bản thân"
            rows={2}
            className="w-full min-h-[80px] border border-input bg-background rounded-md px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outline"
          onClick={handleResetPersonalInfo}
          disabled={submitting || isUploading}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSavePersonalInfo}
          disabled={!personalInfoModified || submitting || isUploading}
        >
          {submitting || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            'Lưu lại'
          )}
        </Button>
      </div>
    </div>
  );
}