import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  // Redirect to personal info by default
  return <Navigate to="/settings/personal-info" replace />;
}
