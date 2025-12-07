import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import MainLayout from "../layouts/main-layout";
import ProtectedRoute from "./protected-routes";
import AdminProtectedRoute from "./admin-protected-routes";

import AuthLayout from "../pages/user/(auth)/layout";
import LoginPage from "../pages/user/(auth)/login";
import SignupPage from "../pages/user/(auth)/signup";
import NotFoundPage from "@/pages/user/(auth)/not-found";
import ForgotPasswordPage from "@/pages/user/(auth)/forgot-password";

import NewfeedPage from "../pages/user/newfeed/index";
import PetsPage from "../pages/user/pets/index";
import FollowingPage from "../pages/user/followings/index";
import GroupsPage from "../pages/user/groups/index";
import GroupDetailPage from "../pages/user/groups/[id]";
import ChatPage from "../pages/user/chats/index";
import ProfilePage from "../pages/user/profile/index";

// Settings
import SettingsLayout from "../pages/user/settings/layout";
import SettingsPage from "../pages/user/settings/index";
import PersonalInfoPage from "../pages/user/settings/personal-info";
import SecurityPage from "../pages/user/settings/security";

// Admin
import AdminLayout from "../layouts/admin-layout";
import AdminLoginPage from "../pages/admin/(auth)/login";
import AdminPostsPage from "@/pages/admin/posts/index";
import AdminUsersPage from "@/pages/admin/users/index";
import AdminReportsPage from "@/pages/admin/reports/index";
import AdminDashboardPage from "@/pages/admin/dashboard/index";

// Auth Context Provider
import { AuthProvider } from "../contexts/AuthContext";
import { AdminAuthProvider } from "../contexts/AdminAuthContext";

export default function AppRoutes() {
    return (
        <AuthProvider>
        <AdminAuthProvider>
        <Routes>
            {/* Protected user routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<NewfeedPage />} />
              <Route path="/pets" element={<PetsPage />} />
              <Route path="/followings" element={<FollowingPage />}/>
              <Route path="groups" element={<GroupsPage />} />
              <Route path="groups/:id" element={<GroupDetailPage />} />
              <Route path="chats" element={<ChatPage />} />
              <Route path="chats/:conversationId" element={<ChatPage />} />
              <Route path="profile/:userId" element={<ProfilePage />} />
              
              {/* Settings with nested routes */}
              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<SettingsPage />} />
                <Route path="personal-info" element={<PersonalInfoPage />} />
                <Route path="security" element={<SecurityPage />} />
              </Route>
            </Route>

            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />
            </Route>

            {/* Admin routes with layout */}
            <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/posts" element={<AdminPostsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>
            
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Redirect example */}
            {/* <Route path="/home" element={<Navigate to="/" replace />} /> */}

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </AdminAuthProvider>
        </AuthProvider>
    );
}