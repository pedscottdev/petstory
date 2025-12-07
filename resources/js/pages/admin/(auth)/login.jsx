import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import ButtonLoader from '@/components/ui/ButtonLoader';

import AdminLogo from '../../../../../public/images/admin-logo.svg'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) {
      toast.error('Email không được bỏ trống');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email phải đúng định dạng email');
      return false;
    }
    
    return true;
  };
  
  const validatePassword = (password) => {
    if (!password) {
      toast.error('Mật khẩu không được bỏ trống');
      return false;
    }
    
    if (password.length <= 6) {
      toast.error('Mật khẩu phải lớn hơn 6 chữ số');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email and password
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Attempt admin login
      const result = await login(email, password);
      if (result.success) {
        toast.success('Đăng nhập thành công');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.message || 'Thông tin đăng nhập không chính xác');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#13171e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center gap-x-2 mb-10 mx-auto">
          <img src={AdminLogo} alt="Admin Logo" className=" h-12 " />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@petstory.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!py-5 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!py-5 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:cursor-pointer"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-700 via-purple-700 to-orange-700 text-white font-medium py-5 text-md rounded-lg transition-all active:scale-95 duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập quản trị"
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}