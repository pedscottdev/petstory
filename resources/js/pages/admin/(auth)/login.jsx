import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import AdminLogo from '../../../../../public/images/admin-logo.svg'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="min-h-screen bg-[#13171e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center gap-x-2 mb-10 mx-auto">
          <img src={AdminLogo} alt="Admin Logo" className=" h-12 " />
        </div>

        {/* Form */}
        <div className="space-y-6">
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
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <a
                href="#"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!py-5 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-pink-700 via-purple-700 to-orange-700 text-white font-medium py-5 text-md rounded-lg transition-colors"
          >
            Đăng nhập quản trị
          </Button>
        </div>

      </div>
    </div>
  );
}