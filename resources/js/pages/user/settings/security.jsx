import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { changePassword } from '@/api/userApi';
import httpClient from '@/api/httpClient';

export default function Security() {
  // State for password change section
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // State to track if forms have been modified
  const [passwordModified, setPasswordModified] = useState(false);

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for form submission
  const [submitting, setSubmitting] = useState(false);

  // Handle password changes
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordModified(true);
  };

  // Reset password form
  const handleResetPassword = () => {
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordModified(false);
    toast.info('Đã hủy thay đổi mật khẩu');
  };

  // Save password
  const handleSavePassword = async () => {
    // Validation
    if (!passwordData.current_password.trim()) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!passwordData.new_password.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure CSRF cookie is fetched before making authenticated request
      await httpClient.get('/sanctum/csrf-cookie');

      const response = await changePassword(
        passwordData.current_password,
        passwordData.new_password,
        passwordData.confirm_password
      );

      if (response?.success) {
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setPasswordModified(false);
        toast.success('Đã đổi mật khẩu thành công!');
      } else {
        toast.error(response?.message || 'Lỗi khi đổi mật khẩu');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi đổi mật khẩu';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border bg-white border-gray-300 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Cập nhật mật khẩu</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="current_password">Mật khẩu hiện tại<span className='text-red-500'>*</span></Label>
          <div className="relative">
            <Input
              id="current_password"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.current_password}
              onChange={(e) => handlePasswordChange('current_password', e.target.value)}
              placeholder="Mật khẩu hiện tại"
              className="pr-10 bg-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="mr-3 !h-5 !w-5 text-gray-600" />
              ) : (
                <Eye className="mr-3 !h-5 !w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new_password">Mật khẩu mới<span className='text-red-500'>*</span></Label>
          <div className="relative">
            <Input
              id="new_password"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.new_password}
              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
              placeholder="Mật khẩu mới"
              className="pr-10 bg-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="mr-3 !h-5 !w-5 text-gray-600" />
              ) : (
                <Eye className="mr-3 !h-5 !w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Xác nhận mật khẩu mới<span className='text-red-500'>*</span></Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirm_password}
              onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="pr-10 bg-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="mr-3 !h-5 !w-5 text-gray-600" />
              ) : (
                <Eye className="mr-3 !h-5 !w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outline"
          onClick={handleResetPassword}
          disabled={submitting}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSavePassword}
          disabled={!passwordModified || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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