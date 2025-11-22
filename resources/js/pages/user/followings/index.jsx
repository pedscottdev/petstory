import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner'; // Import toast for notifications
import { HiStar } from 'react-icons/hi';
import { AiFillLike } from 'react-icons/ai';
import People from "../../../../../public/images/people.svg"
import { DogIcon, Search } from 'lucide-react';

export default function FollowingPage() {
  // Sample data for suggestions with real stock images and pet information
  const [suggestions] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn Anh',
      email: 'nguyenvananh@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 12,
      followers: 1200,
      following: 350,
      pets: [
        { id: 101, name: 'Buddy', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 102, name: 'Luna', avatar: 'https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      email: 'tranthibinh@example.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 8,
      followers: 850,
      following: 220,
      pets: [
        { id: 103, name: 'Max', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 3,
      name: 'Phạm Văn Cường',
      email: 'phamvancuong@example.com',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 24,
      followers: 3200,
      following: 560,
      pets: [
        { id: 104, name: 'Charlie', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 105, name: 'Bella', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 106, name: 'Lucy', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 4,
      name: 'Nguyễn Minh Anh',
      email: 'nguyen.minh.anh@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 15,
      followers: 1800,
      following: 420,
      pets: [
        { id: 107, name: 'Rocky', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 5,
      name: 'Lê Thị Hương',
      email: 'le.thi.huong@example.com',
      avatar: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 7,
      followers: 650,
      following: 180,
      pets: [
        { id: 108, name: 'Daisy', avatar: 'https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 109, name: 'Molly', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 6,
      name: 'Phạm Đức Long',
      email: 'pham.duc.long@example.com',
      avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 32,
      followers: 4500,
      following: 780,
      pets: [
        { id: 110, name: 'Cooper', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 111, name: 'Lola', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 7,
      name: 'Võ Thanh Tùng',
      email: 'vo.thanh.tung@example.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 19,
      followers: 2100,
      following: 390,
      pets: [
        { id: 112, name: 'Bailey', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 8,
      name: 'Hoàng Thị Mai',
      email: 'hoang.thi.mai@example.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 11,
      followers: 980,
      following: 270,
      pets: [
        { id: 113, name: 'Milo', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 114, name: 'Zoe', avatar: 'https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 9,
      name: 'Trần Văn Nam',
      email: 'tran.van.nam@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      posts: 26,
      followers: 3800,
      following: 620,
      pets: [
        { id: 115, name: 'Duke', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 116, name: 'Stella', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 117, name: 'Bear', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
  ]);

  // Sample data for followers and following with real stock images and pet information
  const [followersData, setFollowersData] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn Anh',
      email: 'nguyenvananh@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: true,
      posts: 12,
      followers: 1200,
      following: 350,
      pets: [
        { id: 101, name: 'Buddy', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 102, name: 'Luna', avatar: 'https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      email: 'tranthibinh@example.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: false,
      posts: 8,
      followers: 850,
      following: 220,
      pets: [
        { id: 103, name: 'Max', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 3,
      name: 'Phạm Văn Cường',
      email: 'phamvancuong@example.com',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: true,
      posts: 24,
      followers: 3200,
      following: 560,
      pets: [
        { id: 104, name: 'Charlie', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 105, name: 'Bella', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 4,
      name: 'Nguyễn Minh Anh',
      email: 'nguyen.minh.anh@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: false,
      posts: 15,
      followers: 1800,
      following: 420,
      pets: [
        { id: 107, name: 'Rocky', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 5,
      name: 'Lê Thị Hương',
      email: 'le.thi.huong@example.com',
      avatar: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: true,
      posts: 7,
      followers: 650,
      following: 180,
      pets: [
        { id: 108, name: 'Daisy', avatar: 'https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
  ]);

  const [followingData, setFollowingData] = useState([
    {
      id: 1,
      name: 'Phạm Đức Long',
      email: 'pham.duc.long@example.com',
      avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: true,
      posts: 32,
      followers: 4500,
      following: 780,
      pets: [
        { id: 110, name: 'Cooper', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 2,
      name: 'Võ Thanh Tùng',
      email: 'vo.thanh.tung@example.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: true,
      posts: 19,
      followers: 2100,
      following: 390,
      pets: [
        { id: 112, name: 'Bailey', avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 118, name: 'Coco', avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 3,
      name: 'Hoàng Thị Mai',
      email: 'hoang.thi.mai@example.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: true,
      posts: 11,
      followers: 980,
      following: 270,
      pets: [
        { id: 113, name: 'Milo', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
    {
      id: 4,
      name: 'Trần Văn Nam',
      email: 'tran.van.nam@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      isFollowing: true,
      posts: 26,
      followers: 3800,
      following: 620,
      pets: [
        { id: 115, name: 'Duke', avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 119, name: 'Ruby', avatar: 'https://images.unsplash.com/photo-1517423738875-5ce310acd3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }
      ]
    },
  ]);

  // Search states
  const [searchFollowers, setSearchFollowers] = useState('');
  const [searchFollowing, setSearchFollowing] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');

  // Simulate loading when switching tabs
  const simulateLoading = (tab) => {
    setIsLoading(true);
    setActiveTab(tab);
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // State for follow status
  const [followersState, setFollowersState] = useState(
    followersData.reduce((acc, user) => {
      acc[user.id] = user.isFollowing;
      return acc;
    }, {})
  );

  const [followingState, setFollowingState] = useState(
    followingData.reduce((acc, user) => {
      acc[user.id] = user.isFollowing;
      return acc;
    }, {})
  );

  const [suggestionsState, setSuggestionsState] = useState(
    suggestions.reduce((acc, user) => {
      acc[user.id] = false; // Initially not following
      return acc;
    }, {})
  );

  // State for counts
  const [followersCount, setFollowersCount] = useState(followersData.length);
  const [followingCount, setFollowingCount] = useState(followingData.length);

  const handleFollowToggle = (userId, userType) => {
    // In a real app, this would make an API call
    switch (userType) {
      case 'followers':
        setFollowersState(prev => ({
          ...prev,
          [userId]: !prev[userId]
        }));
        
        // Update following count when following/unfollowing from followers tab
        if (!followersState[userId]) {
          // User is being followed, increase following count
          setFollowingCount(prev => prev + 1);
        } else {
          // User is being unfollowed, decrease following count
          setFollowingCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success(!followersState[userId] ? 'Đã theo dõi' : 'Đã hủy theo dõi');
        break;
      case 'following':
        setFollowingState(prev => ({
          ...prev,
          [userId]: !prev[userId]
        }));
        
        // Update following count when unfollowing from following tab
        if (followingState[userId]) {
          // User is being unfollowed, decrease following count
          setFollowingCount(prev => Math.max(0, prev - 1));
        } else {
          // User is being followed, increase following count
          setFollowingCount(prev => prev + 1);
        }
        
        toast.success(!followingState[userId] ? 'Đã theo dõi' : 'Đã hủy theo dõi');
        break;
      case 'suggestions':
        setSuggestionsState(prev => ({
          ...prev,
          [userId]: !prev[userId]
        }));
        
        // Update following count when following from suggestions
        if (!suggestionsState[userId]) {
          // User is being followed, increase following count
          setFollowingCount(prev => prev + 1);
        } else {
          // User is being unfollowed, decrease following count
          setFollowingCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success(!suggestionsState[userId] ? 'Đã theo dõi' : 'Đã hủy theo dõi');
        break;
      default:
        break;
    }
  };

  const handleViewProfile = (userId) => {
    // This would navigate to the user's profile
    console.log(`View profile for user ${userId}`);
  };

  // Filter followers based on search
  const filteredFollowers = followersData.filter(user =>
    user.name.toLowerCase().includes(searchFollowers.toLowerCase())
  );

  // Filter following based on search
  const filteredFollowing = followingData.filter(user =>
    user.name.toLowerCase().includes(searchFollowing.toLowerCase())
  );

  // Split suggestions into featured (first 3) and "people you may know" (rest)
  const featuredSuggestions = suggestions.slice(0, 3);
  const peopleYouMayKnow = suggestions.slice(3);

  // Skeleton loading component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-3 gap-4 w-full">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="py-4 pt-6 rounded-2xl flex flex-col shadow-none border border-gray-300 gap-y-4 animate-pulse">
          <CardHeader className="px-4 w-full flex items-start gap-x-4">
            <div className="size-16 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardHeader>
          <CardContent className="px-4 flex-grow">
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
              </div>
            </div>
            <div className="bg-gray-100 py-2 rounded-lg grid grid-cols-3 gap-2 text-center text-sm">
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-4 flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-full flex-1"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = ({ searchTerm }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
      <p className="text-gray-500 text-center max-w-md">
        {searchTerm
          ? `Không tìm thấy người dùng nào có tên "${searchTerm}". Hãy thử tìm kiếm với từ khóa khác.`
          : "Không có dữ liệu để hiển thị."}
      </p>
    </div>
  );

  // User card component
  const UserCard = ({ user, userType }) => {
    // Determine follow status based on user type
    let isFollowing = false;
    if (userType === 'followers') {
      isFollowing = followersState[user.id];
    } else if (userType === 'following') {
      isFollowing = followingState[user.id];
    } else if (userType === 'suggestions') {
      isFollowing = suggestionsState[user.id];
    }

    return (
      <Card className="py-4 pt-4 rounded-2xl flex flex-col shadow-none border border-gray-300 gap-y-4">
        <CardHeader className="px-4 w-full flex items-start gap-x-4">
          <Avatar className="size-16">
            <AvatarImage className="object-cover" src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="">
            <p className=" text-lg font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="px-4 flex-grow mt-1">
          {/* Display pet information */}
          {user.pets && user.pets.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center flex-wrap gap-2">
                {/* <DogIcon className="size-8 bg-gray-100 mx-1 text-gray-500 p-1 rounded-full " /> */}
                {user.pets.map(pet => (
                  <div key={pet.id} className="flex items-center gap-2 bg-[#F5F3F0] rounded-full px-3 py-1.5 pl-1">
                    <Avatar className="size-5">
                      <AvatarImage className="object-cover" src={pet.avatar} alt={pet.name} />
                      <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{pet.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-gray-100 py-2 rounded-lg grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold text-[16px]">{user.posts}</div>
              <div className="text-muted-foreground text-sm">Bài viết</div>
            </div>
            <div>
              <div className="font-semibold text-[16px]">{user.followers}</div>
              <div className="text-muted-foreground text-sm">Người theo dõi</div>
            </div>
            <div>
              <div className="font-semibold text-[16px]">{user.following}</div>
              <div className="text-muted-foreground text-sm">Đang theo dõi</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full font-semibold"
            onClick={() => handleViewProfile(user.id)}
          >
            Xem trang cá nhân
          </Button>
          <Button
            variant={isFollowing ? "outline" : "default"}
            className={`rounded-full flex-1 font-medium ${isFollowing ? "text-[#91114D] hover:text-[#91114D] hover:bg-gray-100" : " bg-[#91114D] hover:bg-[#91114D]/80"}`}
            onClick={() => handleFollowToggle(user.id, userType)}
          >
            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className='bg-[#f5f3f0] min-h-screen py-8'>
      <div className='w-full px-32'>
        <div className="flex items-center justify-between">
          <div className="mb-4">
            <h1 className="text-4xl font-black  mb-2 page-header">Mọi người</h1>
            <p className="text-gray-600">Khám phá những người bạn xung quanh, những người bạn theo dõi và những người theo dõi bạn.</p>
          </div>
          <img src={People} alt="Logo" className=" h-15" />
        </div>

        <Tabs defaultValue="suggestions" size="lg" onValueChange={simulateLoading}>
          {/* Tabs List with conditional search input */}
          <div className="flex items-center justify-between mb-4">
            <TabsList className=" bg-[#E6E4E0]">
              <TabsTrigger value="suggestions" className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white">
                Đề xuất cho bạn
              </TabsTrigger>
              <TabsTrigger value="followers" className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white">
                Người theo dõi <span className='!text-xs px-2 pb-0.5 py-0.25 bg-[#c1286f] text-white rounded-full '>{followersCount}</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white">
                Đang theo dõi <span className='!text-xs px-2 pb-0.5 py-0.25 bg-[#c1286f] text-white rounded-full '>{followingCount}</span>
              </TabsTrigger>
            </TabsList>

            {/* Conditional search inputs */}
            <TabsContent value="followers" className=" w-full text-right m-0 p-0 border-0">
              <Input
                placeholder="Tìm kiếm người dùng"
                value={searchFollowers}
                onChange={(e) => setSearchFollowers(e.target.value)}
                className="max-w-sm rounded-lg bg-white"
              />
            </TabsContent>
            <TabsContent value="following" className="w-full text-right m-0 p-0 border-0">
              <Input
                placeholder="Tìm kiếm người dùng"
                value={searchFollowing}
                onChange={(e) => setSearchFollowing(e.target.value)}
                className="max-w-sm bg-white"
              />
            </TabsContent>
          </div>

          <TabsContent value="suggestions" className="mt-0">
            {/* Featured Suggestions - 1 row */}
            <div className="mb-8 w-full">
              <div className="flex gap-2">
                <HiStar className="h-7 w-7 text-yellow-500" />
                <h2 className="text-2xl page-header mb-3">Người dùng nổi bật</h2>
              </div>

              <div>
                {isLoading && activeTab === 'suggestions' ? (
                  <>
                    <LoadingSkeleton />
                  </>
                ) : (
                  <div className='grid grid-cols-3 gap-4'>
                    {featuredSuggestions.map((user) => (
                      <UserCard key={`featured-${user.id}`} user={user} userType="suggestions" />
                    ))}
                  </div>

                )}
              </div>
            </div>

            {/* People You May Know - 2 rows */}
            <div>
              <div className="flex gap-2">
                <AiFillLike className="h-7 w-7 text-green-700" />
                <h2 className="text-2xl page-header mb-3">Có thể bạn quen</h2>
              </div>
              <div className="">
                {isLoading && activeTab === 'suggestions' ? (
                  <div className='space-y-4'>
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {peopleYouMayKnow.map((user) => (
                      <UserCard key={`pymk-${user.id}`} user={user} userType="suggestions" />
                    ))}
                  </div>

                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="followers" className="mt-0">
            {isLoading && activeTab === 'followers' ? (
              <div className='space-y-4'>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </div>
            ) : filteredFollowers.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredFollowers.map((user) => (
                  <UserCard key={user.id} user={user} userType="followers" />
                ))}
              </div>
            ) : (
              <EmptyState searchTerm={searchFollowers} />
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            {isLoading && activeTab === 'following' ? (
              <div className='space-y-4'>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </div>
            ) : filteredFollowing.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredFollowing.map((user) => (
                  <UserCard key={user.id} user={user} userType="following" />
                ))}
              </div>
            ) : (
              <EmptyState searchTerm={searchFollowing} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}