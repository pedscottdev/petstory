import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

export default function PersonalInfo() {
  // Mock user data based on the schema provided
  const mockUserData = {
    _id: 'user123',
    email: 'user@example.com',
    password: 'hashed_password',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: '',
    bio: 'Pet lover and enthusiast',
    is_active: true,
    role: 'user',
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-06-15')
  };

  // State for personal info section
  const [personalInfo, setPersonalInfo] = useState({
    first_name: mockUserData.first_name,
    last_name: mockUserData.last_name,
    email: mockUserData.email,
    bio: mockUserData.bio
  });

  // State for avatar
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(mockUserData.avatar_url || '');

  // State to track if forms have been modified
  const [personalInfoModified, setPersonalInfoModified] = useState(false);

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
    setPersonalInfo({
      first_name: mockUserData.first_name,
      last_name: mockUserData.last_name,
      email: mockUserData.email,
      bio: mockUserData.bio
    });
    setAvatar(null);
    setAvatarPreview(mockUserData.avatar_url || '');
    setPersonalInfoModified(false);
    toast.info('Đã hủy thay đổi thông tin cá nhân');
  };

  // Save personal info
  const handleSavePersonalInfo = () => {
    // In a real app, this would be an API call
    console.log('Saving personal info:', personalInfo);
    console.log('Saving avatar:', avatar);
    
    // Here you would typically:
    // 1. Upload the avatar file to the server if it exists
    // 2. Get the avatar URL from the server response
    // 3. Send the personal info along with the avatar URL to update the user profile
    
    setPersonalInfoModified(false);
    toast.success('Đã lưu thông tin cá nhân thành công!');
  };

  return (
    <div className=" border bg-white border-gray-300 rounded-xl p-6">
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
          <Label htmlFor="first_name">Tên</Label>
          <Input
            id="first_name"
            value={personalInfo.first_name}
            onChange={(e) => handlePersonalInfoChange('first_name', e.target.value)}
            placeholder="Tên"
            className={"bg-white"}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Họ</Label>
          <Input
            id="last_name"
            value={personalInfo.last_name}
            onChange={(e) => handlePersonalInfoChange('last_name', e.target.value)}
            placeholder="Họ"
            className={"bg-white"}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
            placeholder="Email"
            className={"bg-white"}
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
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSavePersonalInfo}
          disabled={!personalInfoModified}
        >
          Lưu lại
        </Button>
      </div>
    </div>
  );
}