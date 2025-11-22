import React, { useState, useEffect, useRef } from 'react';
import { Plus, Heart, HeartOff, Edit, Trash2, Calendar, MapPin, Phone, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

// Mock data for pets
const mockPets = [
  {
    _id: '1',
    owner_id: 'user1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'male',
    age: 3,
    description: 'Chó golden retriever thân thiện thích chơi đồ chơi và đi dạo trong công viên.',
    avatar_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    created_at: new Date('2023-01-15'),
    updated_at: new Date('2023-06-20'),
    isLiked: false,
    likeCount: 12,
    isOwner: true
  },
  {
    _id: '2',
    owner_id: 'user2',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Tabby',
    gender: 'female',
    age: 2,
    description: 'Mèo tabby nghịch ngợm thích những nơi có nắng và săn đồ chơi chuột.',
    avatar_url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&h=400&fit=crop',
    created_at: new Date('2023-03-10'),
    updated_at: new Date('2023-07-15'),
    isLiked: true,
    likeCount: 8,
    isOwner: false
  },
  {
    _id: '3',
    owner_id: 'user3',
    name: 'Charlie',
    species: 'Bird',
    breed: 'Parakeet',
    gender: 'male',
    age: 1,
    description: 'Chim parakeet đầy màu sắc thích hót và bắt chước âm thanh.',
    avatar_url: 'https://images.unsplash.com/photo-1590486129015-ef1e3c280b9e?w=400&h=400&fit=crop',
    created_at: new Date('2023-05-22'),
    updated_at: new Date('2023-08-30'),
    isLiked: false,
    likeCount: 5,
    isOwner: false
  },
  {
    _id: '4',
    owner_id: 'user1',
    name: 'Luna',
    species: 'Cat',
    breed: 'Persian',
    gender: 'female',
    age: 4,
    description: 'Mèo Persian dịu dàng thích nằm nghỉ và được chải lông.',
    avatar_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop',
    created_at: new Date('2022-11-05'),
    updated_at: new Date('2023-09-12'),
    isLiked: false,
    likeCount: 15,
    isOwner: true
  },
  {
    _id: '5',
    owner_id: 'user4',
    name: 'Rocky',
    species: 'Dog',
    breed: 'German',
    gender: 'male',
    age: 5,
    description: 'Chó German Shepherd trung thành xuất sắc trong huấn luyện tuân thủ.',
    avatar_url: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=400&h=400&fit=crop',
    created_at: new Date('2023-02-18'),
    updated_at: new Date('2023-10-01'),
    isLiked: true,
    likeCount: 22,
    isOwner: false
  },
  {
    _id: '6',
    owner_id: 'user5',
    name: 'Coco',
    species: 'Bird',
    breed: 'Cockatiel',
    gender: 'female',
    age: 2,
    description: 'Chim cockatiel xinh đẹp thích hót những giai điệu.',
    avatar_url: 'https://images.unsplash.com/photo-1551085254-e96b210db58a?w=400&h=400&fit=crop',
    created_at: new Date('2023-04-12'),
    updated_at: new Date('2023-11-05'),
    isLiked: false,
    likeCount: 7,
    isOwner: false
  },
  {
    _id: '7',
    owner_id: 'user6',
    name: 'Max',
    species: 'Dog',
    breed: 'Bulldog',
    gender: 'male',
    age: 1,
    description: 'Chó con Bulldog năng động thích chơi và khám phá.',
    avatar_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
    created_at: new Date('2023-08-20'),
    updated_at: new Date('2023-12-01'),
    isLiked: true,
    likeCount: 9,
    isOwner: false
  },
  {
    _id: '8',
    owner_id: 'user7',
    name: 'Bella',
    species: 'Dog',
    breed: 'Labrador',
    gender: 'female',
    age: 4,
    description: 'Chó Labrador thân thiện thích bơi lội và chơi với trẻ em.',
    avatar_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    created_at: new Date('2023-03-22'),
    updated_at: new Date('2023-12-15'),
    isLiked: false,
    likeCount: 18,
    isOwner: false
  },
  {
    _id: '9',
    owner_id: 'user8',
    name: 'Mittens',
    species: 'Cat',
    breed: 'Siamese',
    gender: 'female',
    age: 3,
    description: 'Mèo Siamese thanh lịch với đôi mắt xanh biếc và tính cách thích kêu.',
    avatar_url: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&h=400&fit=crop',
    created_at: new Date('2023-01-30'),
    updated_at: new Date('2023-12-20'),
    isLiked: true,
    likeCount: 14,
    isOwner: false
  },
  {
    _id: '10',
    owner_id: 'user9',
    name: 'Tweety',
    species: 'Bird',
    breed: 'Canary',
    gender: 'male',
    age: 2,
    description: 'Chim canary vui vẻ với bộ lông vàng rực và tiếng hót du dương.',
    avatar_url: 'https://images.unsplash.com/photo-1598755257130-c2aaca1f08c1?w=400&h=400&fit=crop',
    created_at: new Date('2023-07-10'),
    updated_at: new Date('2023-12-25'),
    isLiked: false,
    likeCount: 6,
    isOwner: false
  }
];

export default function PetsPage() {
  const [pets, setPets] = useState(mockPets);
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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');

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

  // Handle like/unlike pet
  const handleLikePet = (petId) => {
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
  const handleCreatePet = () => {
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

    const pet = {
      _id: `${pets.length + 1}`,
      owner_id: 'user1', // Current user
      ...newPet,
      age: parseInt(newPet.age),
      created_at: new Date(),
      updated_at: new Date(),
      isLiked: false,
      likeCount: 0,
      isOwner: true
    };

    setPets([pet, ...pets]);
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
  };

  // Handle update pet
  const handleUpdatePet = () => {
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

    setPets(pets.map(pet =>
      pet._id === editingPet._id
        ? {
          ...pet,
          ...editingPet,
          age: parseInt(editingPet.age),
          updated_at: new Date()
        }
        : pet
    ));

    setIsEditDialogOpen(false);
    setEditingPet(null);
    setEditingPetAvatarPreview(null);
    toast.success('Đã cập nhật thông tin thú cưng thành công');
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
  const confirmDeletePet = () => {
    if (petToDelete) {
      setPets(pets.filter(pet => pet._id !== petToDelete._id));
      if (selectedPet && selectedPet._id === petToDelete._id) {
        setSelectedPet(null);
      }
      toast.success('Đã xóa thú cưng');
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

  // Get filtered pets for my pets tab
  const getFilteredMyPets = () => {
    return applyFilters(myPets, myPetsFilters);
  };

  // Simulate loading when switching tabs
  const simulateLoading = (tab) => {
    // clear any existing timeout to avoid overlap
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setIsLoading(true);
    setActiveTab(tab);
    // Simulate API call delay
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      loadingTimeoutRef.current = null;
    }, 800);
  };

  // Ref to hold loading timeout so we can clear on unmount or new calls
  const loadingTimeoutRef = useRef(null);

  // Simulate initial loading on first mount
  useEffect(() => {
    // Start with loading state to mimic fetching data
    setIsLoading(true);
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      loadingTimeoutRef.current = null;
    }, 800);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Define species options
  const speciesOptions = [
    { value: 'Dog', label: 'Chó' },
    { value: 'Cat', label: 'Mèo' },
    { value: 'Bird', label: 'Chim' }
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
                        <AvatarImage src={newPetAvatarPreview || newPet.avatar_url} alt="Pet preview" />
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
                >
                  Thêm thú cưng
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="explore" className="mb-4" onValueChange={simulateLoading}>
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
              <div className="flex items-end grid grid-cols-1 md:grid-cols-5 gap-4">
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
                        <SelectItem key={species} value={species}>{species}</SelectItem>
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
            {isLoading && activeTab === 'explore' ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredExplorePets().map((pet) => (
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
            )}
          </TabsContent>

          {/* Nội dung tab thú cưng của tôi */}
          <TabsContent value="myPets" className="mt-2">
            {/* Filters - Cập nhật thiết kế giống trang groups */}
            <div className="mb-6 bg-white p-3 px-4 rounded-lg border border-gray-300">
              <div className="flex items-end grid grid-cols-1 md:grid-cols-5 gap-4">
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
            {isLoading && activeTab === 'myPets' ? (
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
                        <AvatarImage src={selectedPet.avatar_url} alt={selectedPet.name} />
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
              <AlertDialogCancel onClick={cancelDeletePet}>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePet} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
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
          <DialogContent className="min-w-xl">
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
                          <AvatarImage src={editingPetAvatarPreview || editingPet.avatar_url} alt="Pet preview" />
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
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleUpdatePet}
                    className="bg-[#91114D] hover:bg-[#91114D]/90"
                  >
                    Cập nhật
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