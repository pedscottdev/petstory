import React, { useState, useEffect, useRef } from 'react';
import { Plus, Heart, HeartOff, Edit, Trash2, Calendar, MapPin, Phone, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import * as petApi from '@/api/petApi';
import useImageUpload from '@/hooks/useImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import PetCard from '@/components/user/newfeed/PetCard';
import { Skeleton } from '@/components/ui/skeleton';

// Transform API pet data to component format
const transformPetData = (apiPet, currentUserId) => {
  return {
    _id: apiPet._id,
    owner_id: apiPet.owner_id,
    name: apiPet.name,
    species: apiPet.species,
    breed: apiPet.breed || '',
    gender: apiPet.gender,
    age: apiPet.age || 0,
    description: apiPet.description || '',
    avatar_url: apiPet.avatar_url || '',
    created_at: new Date(apiPet.created_at),
    updated_at: new Date(apiPet.updated_at),
    isLiked: apiPet.is_liked || false,
    likeCount: apiPet.like_count || 0,
    isOwner: apiPet.owner_id === currentUserId
  };
};

export default function PetsPage() {
  const { user } = useAuth();
  const { uploadPetAvatar, isLoading: imageUploading } = useImageUpload();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    age: '',
    description: '',
    avatar_url: ''
  });
  const [editingPet, setEditingPet] = useState(null);

  // State for avatar previews
  const [newPetAvatarPreview, setNewPetAvatarPreview] = useState(null);
  const [editingPetAvatarPreview, setEditingPetAvatarPreview] = useState(null);

  // Refs for file inputs
  const newPetAvatarInputRef = React.useRef(null);
  const editingPetAvatarInputRef = React.useRef(null);

  // Separate filter states for each tab
  const [exploreFilters, setExploreFilters] = useState({
    searchTerm: '',
    species: '',
    gender: '',
    breedSearch: ''
  });

  const [myPetsFilters, setMyPetsFilters] = useState({
    searchTerm: '',
    species: '',
    gender: '',
    breedSearch: ''
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lazy loading states
  const [displayedExplorePets, setDisplayedExplorePets] = useState([]);
  const [exploreLoadCount, setExploreLoadCount] = useState(9); // Initial load count
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  // Filter pets by ownership
  const myPets = pets.filter(pet => pet.isOwner);
  const otherPets = pets.filter(pet => !pet.isOwner);

  // Apply filters to pets
  const applyFilters = (petsList, filters) => {
    return petsList.filter(pet => {
      // Search term filter
      if (filters.searchTerm && !pet.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // Species filter
      if (filters.species && pet.species !== filters.species) {
        return false;
      }

      // Gender filter
      if (filters.gender && pet.gender !== filters.gender) {
        return false;
      }

      // Breed search filter
      if (filters.breedSearch && !pet.breed.toLowerCase().includes(filters.breedSearch.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  // Get unique species for filter dropdown
  const getUniqueSpecies = () => {
    const species = [...new Set(pets.map(pet => pet.species))];
    return species;
  };

  // Convert base64 to File
  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Handle like/unlike pet
  const handleLikePet = async (petId) => {
    try {
      // Validate petId before making API call
      if (!petId) {
        console.error('Pet ID is undefined');
        toast.error('Không thể thích thú cưng: ID không hợp lệ');
        return;
      }

      const response = await petApi.togglePetLike(petId);
      if (response.success) {
        setPets(pets.map(pet => {
          if (pet._id === petId) {
            return {
              ...pet,
              isLiked: !pet.isLiked,
              likeCount: pet.isLiked ? pet.likeCount - 1 : pet.likeCount + 1
            };
          }
          return pet;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Không thể cập nhật trạng thái thích');
    }
  };

  // Validate pet data
  const validatePetData = (petData) => {
    const errors = [];

    if (!petData.name || petData.name.trim() === '') {
      errors.push('Tên thú cưng là bắt buộc');
    }

    if (!petData.species) {
      errors.push('Loài là bắt buộc');
    }

    if (!petData.gender) {
      errors.push('Giới tính là bắt buộc');
    }

    if (!petData.age || petData.age <= 0) {
      errors.push('Tuổi phải là số dương');
    }

    return errors;
  };

  // Handle create pet
  const handleCreatePet = async () => {
    const errors = validatePetData(newPet);

    if (errors.length > 0) {
      toast.error('Dữ liệu không hợp lệ', {
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const petData = {
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed,
        gender: newPet.gender,
        age: parseInt(newPet.age),
        description: newPet.description,
        avatar_url: ''
      };

      // Create pet first without avatar
      const response = await petApi.createPet(petData);
      if (response.success) {
        let finalPet = response.data;

        // Upload avatar if provided
        if (newPet.avatar_url && newPet.avatar_url.startsWith('data:')) {
          try {
            const file = base64ToFile(newPet.avatar_url, `pet-${finalPet._id}.jpg`);
            const uploadResult = await uploadPetAvatar(file, finalPet._id);
            if (uploadResult && uploadResult.path) {
              // Update pet with new avatar URL
              const updateResponse = await petApi.updatePet(finalPet._id, { avatar_url: uploadResult.path });
              if (updateResponse.success) {
                finalPet = updateResponse.data;
              }
            }
          } catch (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            toast.error('Thêm thú cưng thành công nhưng không thể tải lên ảnh đại diện');
          }
        }

        const transformedPet = transformPetData(finalPet, user?.id);
        setPets([transformedPet, ...pets]);
        setNewPet({
          name: '',
          species: '',
          breed: '',
          gender: '',
          age: '',
          description: '',
          avatar_url: ''
        });
        setNewPetAvatarPreview(null);
        setIsCreateDialogOpen(false);
        toast.success('Đã thêm thú cưng thành công');
      }
    } catch (error) {
      console.error('Error creating pet:', error);
      toast.error('Không thể tạo thú cưng', {
        description: error.response?.data?.message || 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update pet
  const handleUpdatePet = async () => {
    const errors = validatePetData(editingPet);

    if (errors.length > 0) {
      toast.error('Dữ liệu không hợp lệ', {
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = editingPet.avatar_url;
      const oldAvatarUrl = editingPet.avatar_url; // Store old avatar path

      // Upload avatar if it's a new file (base64)
      if (editingPet.avatar_url && editingPet.avatar_url.startsWith('data:')) {
        try {
          const file = base64ToFile(editingPet.avatar_url, `pet-${editingPet._id}.jpg`);
          const uploadResult = await uploadPetAvatar(file, editingPet._id);
          if (uploadResult && (uploadResult.path || uploadResult.url)) {
            // Use the path from upload result, not the full URL
            avatarUrl = uploadResult.path || uploadResult.url;
          }
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.error('Không thể tải lên ảnh đại diện mới');
          setIsSubmitting(false);
          return;
        }
      }

      const petData = {
        name: editingPet.name,
        species: editingPet.species,
        breed: editingPet.breed,
        gender: editingPet.gender,
        age: parseInt(editingPet.age),
        description: editingPet.description,
        avatar_url: avatarUrl
      };

      const response = await petApi.updatePet(editingPet._id, petData);
      if (response.success) {
        const transformedPet = transformPetData(response.data, user?.id);
        setPets(pets.map(pet =>
          pet._id === editingPet._id ? transformedPet : pet
        ));

        setIsEditDialogOpen(false);
        setEditingPet(null);
        setEditingPetAvatarPreview(null);
        toast.success('Đã cập nhật thông tin thú cưng thành công');
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      toast.error('Không thể cập nhật thú cưng', {
        description: error.response?.data?.message || 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle avatar upload for new pet
  const handleNewPetAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error('Chỉ chấp nhận file ảnh');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPetAvatarPreview(reader.result);
        setNewPet({ ...newPet, avatar_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar upload for editing pet
  const handleEditingPetAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error('Chỉ chấp nhận file ảnh');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPetAvatarPreview(reader.result);
        setEditingPet({ ...editingPet, avatar_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input for new pet
  const triggerNewPetAvatarInput = () => {
    if (newPetAvatarInputRef.current) {
      newPetAvatarInputRef.current.click();
    }
  };

  // Trigger file input for editing pet
  const triggerEditingPetAvatarInput = () => {
    if (editingPetAvatarInputRef.current) {
      editingPetAvatarInputRef.current.click();
    }
  };

  // Remove avatar for new pet
  const removeNewPetAvatar = () => {
    setNewPetAvatarPreview(null);
    setNewPet({ ...newPet, avatar_url: '' });
  };

  // Remove avatar for editing pet
  const removeEditingPetAvatar = () => {
    setEditingPetAvatarPreview(null);
    setEditingPet({ ...editingPet, avatar_url: '' });
  };

  // Handle delete pet confirmation
  const handleDeletePet = (petId) => {
    const pet = pets.find(p => p._id === petId);
    setPetToDelete(pet);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete pet
  const confirmDeletePet = async () => {
    if (petToDelete) {
      try {
        const response = await petApi.deletePet(petToDelete._id);
        if (response.success) {
          setPets(pets.filter(pet => pet._id !== petToDelete._id));
          if (selectedPet && selectedPet._id === petToDelete._id) {
            setSelectedPet(null);
          }
          toast.success('Đã xóa thú cưng');
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
        toast.error('Không thể xóa thú cưng', {
          description: error.response?.data?.message || 'Vui lòng thử lại'
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setPetToDelete(null);
  };

  // Cancel delete pet
  const cancelDeletePet = () => {
    setIsDeleteDialogOpen(false);
    setPetToDelete(null);
  };

  // Handle view pet
  const handleViewPet = (pet) => {
    setSelectedPet(pet);
    setIsViewDialogOpen(true);
  };

  // Handle edit pet
  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setIsEditDialogOpen(true);
  };

  // Reset explore filters
  const resetExploreFilters = () => {
    setExploreFilters({
      searchTerm: '',
      species: '',
      gender: '',
      breedSearch: ''
    });
  };

  // Reset my pets filters
  const resetMyPetsFilters = () => {
    setMyPetsFilters({
      searchTerm: '',
      species: '',
      gender: '',
      breedSearch: ''
    });
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Get filtered pets for explore tab
  const getFilteredExplorePets = () => {
    return applyFilters(otherPets, exploreFilters);
  };

  // Get currently displayed explore pets (with lazy loading)
  const getCurrentlyDisplayedExplorePets = () => {
    const filtered = getFilteredExplorePets();
    return filtered.slice(0, exploreLoadCount);
  };

  // Check if there are more pets to load
  const hasMoreExplorePets = () => {
    return getFilteredExplorePets().length > exploreLoadCount;
  };

  // Load more pets
  const loadMoreExplorePets = () => {
    if (!isLoadingMore && hasMoreExplorePets()) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setExploreLoadCount(prev => prev + 6); // Load 6 more pets
        setIsLoadingMore(false);
      }, 500); // Simulate loading delay
    }
  };

  // Get filtered pets for my pets tab
  const getFilteredMyPets = () => {
    return applyFilters(myPets, myPetsFilters);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'explore') {
      // Reset load count when switching to explore tab
      setExploreLoadCount(9);
    }
  };

  // Ref to hold loading timeout so we can clear on unmount or new calls
  const loadingTimeoutRef = useRef(null);

  // Fetch pets from API on mount
  useEffect(() => {
    const fetchPets = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await petApi.getPets(1, 100); // Fetch all pets
        if (response.success && response.data) {
          const transformedPets = response.data.map(pet => {
            const transformed = transformPetData(pet, user.id);
            return transformed;
          });
          setPets(transformedPets);
        } else {
          // Handle case where response is successful but has no data
          setPets([]);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
        if (error.code === 'ECONNABORTED') {
          toast.error('Yêu cầu quá lâu', {
            description: 'Không thể tải danh sách thú cưng. Vui lòng kiểm tra kết nối.'
          });
        } else if (error.response?.status === 401) {
          // Unauthorized - user might need to login again
          toast.error('Phiên làm việc đã hết hạn', {
            description: 'Vui lòng đăng nhập lại'
          });
        } else {
          toast.error('Không thể tải danh sách thú cưng', {
            description: 'Vui lòng thử lại sau'
          });
        }
        setPets([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [user?.id]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeTab === 'explore') {
          loadMoreExplorePets();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [activeTab, exploreLoadCount, isLoadingMore, pets, exploreFilters]);

  // Reset load count when filters change
  useEffect(() => {
    if (activeTab === 'explore') {
      setExploreLoadCount(9);
    }
  }, [exploreFilters]);

  // Define species options
  const speciesOptions = [
    { value: 'dog', label: 'Chó' },
    { value: 'cat', label: 'Mèo' },
    { value: 'bird', label: 'Chim' }
  ];

  // Skeleton loading component for pet cards
  const PetCardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((item) => (
        <PetCard key={item} isLoading={true} />
      ))}
    </div>
  );

  return (
    <div className="bg-[#f5f3f0] min-h-screen py-8 px-32">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div className="w-full flex items-center justify-between">
            <div className="mb-4">
              <h1 className="text-4xl font-black  mb-2 page-header">Thú cưng</h1>
              <p className="text-gray-600">Kết nối với những người yêu thú cưng cùng sở thích và chia sẻ kinh nghiệm.</p>
            </div>
            <Button
              className="bg-[#91114D] hover:bg-[#7a0e41] text-white rounded-full text-[16px] px-4 py-2"
              onClick={() => setIsCreateDialogOpen(true)}
              size={"lg"}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm thú cưng
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent
              className="min-w-xl gap-2"
              onInteractOutside={(event) => {
                event.preventDefault()
              }}
              onEscapeKeyDown={(event) => {
                event.preventDefault()
              }}
            >
              <DialogHeader>
                <DialogTitle className={'page-header text-[22px]'}>Thêm thú cưng mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Avatar Upload Section */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="avatar" className="text-right">
                    Ảnh đại diện
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={newPetAvatarPreview || newPet.avatar_url} alt="Pet preview" className={"object-cover"} />
                        <AvatarFallback className="bg-[#E6DDD5]">
                          {newPet.name ? newPet.name.charAt(0) : 'Pet'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={triggerNewPetAvatarInput}>
                          Chọn ảnh
                        </Button>
                        {(newPetAvatarPreview || newPet.avatar_url) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeNewPetAvatar}
                            className="flex items-center gap-1"
                          >
                            <X className="h-4 w-4" />
                            Xóa
                          </Button>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          ref={newPetAvatarInputRef}
                          className="hidden"
                          onChange={handleNewPetAvatarUpload}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Định dạng JPG, PNG. Kích thước tối đa 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="name" className="text-right">
                    Tên
                  </Label>
                  <Input
                    id="name"
                    value={newPet.name}
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Tên thú cưng"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="species" className="text-right">
                    Loài
                  </Label>
                  <Select
                    value={newPet.species}
                    onValueChange={(value) => setNewPet({ ...newPet, species: value })}
                  >
                    <SelectTrigger className="!col-span-3 !w-full">
                      <SelectValue placeholder="Chọn loài" />
                    </SelectTrigger>
                    <SelectContent modal={false}>
                      {speciesOptions.map((species) => (
                        <SelectItem key={species.value} value={species.value}>
                          {species.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="breed" className="text-right">
                    Giống
                  </Label>
                  <Input
                    id="breed"
                    value={newPet.breed}
                    onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                    className="col-span-3"
                    placeholder="Giống của thú cưng"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="gender" className="text-right">
                    Giới tính
                  </Label>
                  <div className="col-span-3 flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={newPet.gender === 'male'}
                        onChange={(e) => setNewPet({ ...newPet, gender: e.target.value })}
                        className="mr-2"
                      />
                      Đực
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={newPet.gender === 'female'}
                        onChange={(e) => setNewPet({ ...newPet, gender: e.target.value })}
                        className="mr-2"
                      />
                      Cái
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="age" className="text-right">
                    Tuổi
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                    className="col-span-3"
                    placeholder="Tuổi"
                    min="1"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    value={newPet.description}
                    onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Mô tả về thú cưng"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className={"rounded-full"}>
                  Hủy
                </Button>
                <Button
                  onClick={handleCreatePet}
                  className="bg-[#91114D] hover:bg-[#91114D]/90 rounded-full"
                  disabled={isSubmitting || imageUploading}
                >
                  {isSubmitting || imageUploading ? 'Đang xử lý...' : 'Thêm thú cưng'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="explore" className="mb-4" onValueChange={handleTabChange}>
          <TabsList className="bg-[#E6E4E0] rounded-lg">
            <TabsTrigger
              value="explore"
              className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white"
            >
              Khám phá
            </TabsTrigger>
            <TabsTrigger
              value="myPets"
              className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white"
            >
              Thú cưng của tôi<span className='!text-xs px-2 pb-0.5 py-0.25 bg-[#c1286f] text-white rounded-full '>{myPets.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Nội dung tab khám phá */}
          <TabsContent value="explore" className="mt-2">
            {/* Filters - Cập nhật thiết kế giống trang groups */}
            <div className="mb-6 bg-white p-3 px-4 rounded-lg border border-gray-300">
              <div className=" items-end grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Tên thú cưng</label>
                  <Input
                    placeholder="Nhập tên thú cưng cần tìm..."
                    value={exploreFilters.searchTerm}
                    onChange={(e) => setExploreFilters({ ...exploreFilters, searchTerm: e.target.value })}
                  />
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Loài</label>
                  <Select value={exploreFilters.species || "all"} onValueChange={(value) => setExploreFilters({ ...exploreFilters, species: value === "all" ? "" : value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả loài" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loài</SelectItem>
                      {getUniqueSpecies().map(species => (
                        <SelectItem key={species} value={species}>{species == "dog" ? "Chó" : species == "cat" ? "Mèo" : "Chim"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Giới tính</label>
                  <Select value={exploreFilters.gender || "all"} onValueChange={(value) => setExploreFilters({ ...exploreFilters, gender: value === "all" ? "" : value })} >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả giới tính" />
                    </SelectTrigger>
                    <SelectContent >
                      <SelectItem value="all">Tất cả giới tính</SelectItem>
                      <SelectItem value="male">Đực</SelectItem>
                      <SelectItem value="female">Cái</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Giống</label>
                  <Input
                    placeholder="Nhập tên giống cần tìm..."
                    value={exploreFilters.breedSearch}
                    onChange={(e) => setExploreFilters({ ...exploreFilters, breedSearch: e.target.value })}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={resetExploreFilters}>
                  Đặt lại bộ lọc
                </Button>
              </div>
            </div>

            {/* Pets Grid */}
            {isLoading ? (
              <PetCardSkeleton />
            ) : getFilteredExplorePets().length === 0 ? (
              <div className="text-center py-12 ">
                {otherPets.length === 0 ? (
                  // No pets exist at all
                  <p className="text-gray-500">Không có thú cưng nào để hiển thị</p>
                ) : (
                  // Pets exist but none match filter
                  <>
                    <p className="text-gray-500">Không tìm thấy thú cưng nào phù hợp với bộ lọc</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={resetExploreFilters}>
                        Đặt lại bộ lọc
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCurrentlyDisplayedExplorePets().map((pet) => (
                    <PetCard
                      key={pet._id}
                      pet={pet}
                      onLike={handleLikePet}
                      onView={handleViewPet}
                      onDelete={handleDeletePet}
                      isMyPet={false}
                    />
                  ))}
                </div>

                {/* Loading more indicator and observer target */}
                {hasMoreExplorePets() && (
                  <div ref={observerTarget} className="w-full py-8">
                    {isLoadingMore && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((item) => (
                          <PetCard key={`loading-${item}`} isLoading={true} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Show total count */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  Hiển thị {getCurrentlyDisplayedExplorePets().length} / {getFilteredExplorePets().length} thú cưng
                </div>
              </>
            )}
          </TabsContent>

          {/* Nội dung tab thú cưng của tôi */}
          <TabsContent value="myPets" className="mt-2">
            {/* Filters - Cập nhật thiết kế giống trang groups */}
            <div className="mb-6 bg-white p-3 px-4 rounded-lg border border-gray-300">
              <div className=" items-end grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Tên thú cưng</label>
                  <Input
                    placeholder="Nhập tên thú cưng cần tìm..."
                    value={myPetsFilters.searchTerm}
                    onChange={(e) => setMyPetsFilters({ ...myPetsFilters, searchTerm: e.target.value })}
                  />
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Loài</label>
                  <Select value={myPetsFilters.species || "all"} onValueChange={(value) => setMyPetsFilters({ ...myPetsFilters, species: value === "all" ? "" : value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả loài" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loài</SelectItem>
                      {getUniqueSpecies().map(species => (
                        <SelectItem key={species} value={species}>{species}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Giới tính</label>
                  <Select value={myPetsFilters.gender || "all"} onValueChange={(value) => setMyPetsFilters({ ...myPetsFilters, gender: value === "all" ? "" : value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả giới tính</SelectItem>
                      <SelectItem value="male">Đực</SelectItem>
                      <SelectItem value="female">Cái</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='col-span-1'>
                  <label className="text-sm font-medium mb-1 block">Giống</label>
                  <Input
                    placeholder="Nhập tên giống cần tìm..."
                    value={myPetsFilters.breedSearch}
                    onChange={(e) => setMyPetsFilters({ ...myPetsFilters, breedSearch: e.target.value })}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={resetMyPetsFilters}>
                  Đặt lại bộ lọc
                </Button>
              </div>
            </div>

            {/* Pets Grid */}
            {isLoading ? (
              <PetCardSkeleton />
            ) : getFilteredMyPets().length === 0 ? (
              <div className="text-center py-12 ">
                {myPets.length === 0 ? (
                  // No pets exist at all
                  <>
                    <p className="text-gray-500">Bạn chưa có thú cưng nào</p>
                    <div className="mt-4">
                      <Button className="bg-[#91114D] hover:bg-[#91114D]/90" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm thú cưng đầu tiên
                      </Button>
                    </div>
                  </>
                ) : (
                  // Pets exist but none match filter
                  <>
                    <p className="text-gray-500">Không tìm thấy thú cưng nào phù hợp với bộ lọc</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={resetMyPetsFilters}>
                        Đặt lại bộ lọc
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredMyPets().map((pet) => (
                  <PetCard
                    key={pet._id}
                    pet={pet}
                    onView={handleViewPet}
                    onEdit={handleEditPet}
                    onDelete={handleDeletePet}
                    isMyPet={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* View Pet Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} >
          <DialogContent className="max-w-2xl">
            {selectedPet && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex justify-between items-center">
                    <span>Chi tiết thú cưng</span>
                    <span className="text-sm font-normal bg-[#E6DDD5] px-2 py-1 rounded">
                      {selectedPet.species}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={getImageUrl(selectedPet.avatar_url)} alt={selectedPet.name} />
                        <AvatarFallback className="text-3xl bg-[#E6DDD5]">
                          {selectedPet.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{selectedPet.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Ngày tạo: {formatDate(selectedPet.created_at)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Loài</Label>
                          <p className="text-gray-700">{selectedPet.species}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Giống</Label>
                          <p className="text-gray-700">{selectedPet.breed || 'Chưa xác định'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Giới tính</Label>
                          <p className="text-gray-700 capitalize">
                            {selectedPet.gender === 'male' ? 'Đực' : 'Cái'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Tuổi</Label>
                          <p className="text-gray-700">{selectedPet.age} tuổi</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Cập nhật lần cuối</Label>
                          <p className="text-gray-700">{formatDate(selectedPet.updated_at)}</p>
                        </div>
                        {!selectedPet.isOwner && (
                          <div>
                            <Label className="text-sm font-medium">Lượt thích</Label>
                            <p className="text-gray-700">{selectedPet.likeCount} lượt thích</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Mô tả</Label>
                        <p className="text-gray-700 mt-1">{selectedPet.description}</p>
                      </div>

                      {selectedPet.isOwner && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleEditPet(selectedPet);
                              setIsViewDialogOpen(false);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsViewDialogOpen(false);
                              handleDeletePet(selectedPet._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className={'page-header text-[22px]'}>Xác nhận xóa thú cưng</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa thú cưng <strong>{petToDelete?.name}</strong> không? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full" onClick={cancelDeletePet}>Hủy</AlertDialogCancel>
              <AlertDialogAction className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full" onClick={confirmDeletePet}>Xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Pet Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingPet(null);
            setEditingPetAvatarPreview(null);
          }
        }}>
          <DialogContent className="min-w-xl" onInteractOutside={(e) => {
            e.preventDefault();
          }}>
            {editingPet && (
              <>
                <DialogHeader>
                  <DialogTitle className={'page-header text-[22px]'}>Chỉnh sửa thông tin thú cưng</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Avatar Upload Section */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-avatar" className="text-right">
                      Ảnh đại diện
                    </Label>
                    <div className="col-span-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={editingPetAvatarPreview || editingPet.avatar_url} alt="Pet preview" className={'object-cover'} />
                          <AvatarFallback className="bg-[#E6DDD5]">
                            {editingPet.name ? editingPet.name.charAt(0) : 'Pet'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={triggerEditingPetAvatarInput}>
                            Chọn ảnh
                          </Button>
                          {(editingPetAvatarPreview || editingPet.avatar_url) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={removeEditingPetAvatar}
                              className="flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              Xóa
                            </Button>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            ref={editingPetAvatarInputRef}
                            className="hidden"
                            onChange={handleEditingPetAvatarUpload}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Định dạng JPG, PNG. Kích thước tối đa 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Tên
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingPet.name}
                      onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Tên thú cưng"
                    />
                  </div>
                  <div className="w-full grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-species" className="text-right col-span-1">
                      Loài
                    </Label>
                    <Select
                      value={editingPet.species}
                      onValueChange={(value) => setEditingPet({ ...editingPet, species: value })}
                      className=""
                    >
                      <SelectTrigger className="!col-span-3 !w-full">
                        <SelectValue placeholder="Chọn loài" />
                      </SelectTrigger>
                      <SelectContent>
                        {speciesOptions.map((species) => (
                          <SelectItem key={species.value} value={species.value}>
                            {species.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-breed" className="text-right">
                      Giống
                    </Label>
                    <Input
                      id="edit-breed"
                      value={editingPet.breed}
                      onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                      className="col-span-3"
                      placeholder="Giống của thú cưng"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-gender" className="text-right">
                      Giới tính
                    </Label>
                    <div className="col-span-3 flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="male"
                          checked={editingPet.gender === 'male'}
                          onChange={(e) => setEditingPet({ ...editingPet, gender: e.target.value })}
                          className="mr-2"
                        />
                        Đực
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="female"
                          checked={editingPet.gender === 'female'}
                          onChange={(e) => setEditingPet({ ...editingPet, gender: e.target.value })}
                          className="mr-2"
                        />
                        Cái
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-age" className="text-right">
                      Tuổi
                    </Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editingPet.age}
                      onChange={(e) => setEditingPet({ ...editingPet, age: e.target.value })}
                      className="col-span-3"
                      placeholder="Tuổi"
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-description" className="text-right">
                      Mô tả
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editingPet.description}
                      onChange={(e) => setEditingPet({ ...editingPet, description: e.target.value })}
                      className="col-span-3"
                      placeholder="Mô tả về thú cưng"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="rounded-full" onClick={() => setIsEditDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleUpdatePet}
                    className="bg-[#91114D] hover:bg-[#91114D]/90 rounded-full"
                    disabled={isSubmitting || imageUploading}
                  >
                    {isSubmitting || imageUploading ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>

                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}