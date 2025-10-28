import React, { useState, useEffect } from 'react';
import { Plus, Heart, HeartOff, Edit, Trash2, Calendar, MapPin, Phone, Search, Filter } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

// Mock data for pets
const mockPets = [
  {
    _id: '1',
    owner_id: 'user1',
    name: 'Buddy',
    species: 'Dog',
    gender: 'male',
    age: 3,
    description: 'A friendly golden retriever who loves to play fetch and go for walks in the park.',
    avatar_url: '',
    created_at: new Date('2023-01-15'),
    updated_at: new Date('2023-06-20'),
    isLiked: false,
    isOwner: true
  },
  {
    _id: '2',
    owner_id: 'user2',
    name: 'Whiskers',
    species: 'Cat',
    gender: 'female',
    age: 2,
    description: 'A playful tabby cat who enjoys sunny spots and chasing toy mice.',
    avatar_url: '',
    created_at: new Date('2023-03-10'),
    updated_at: new Date('2023-07-15'),
    isLiked: true,
    isOwner: false
  },
  {
    _id: '3',
    owner_id: 'user3',
    name: 'Charlie',
    species: 'Bird',
    gender: 'male',
    age: 1,
    description: 'A colorful parakeet who loves to sing and mimic sounds.',
    avatar_url: '',
    created_at: new Date('2023-05-22'),
    updated_at: new Date('2023-08-30'),
    isLiked: false,
    isOwner: false
  },
  {
    _id: '4',
    owner_id: 'user1',
    name: 'Luna',
    species: 'Cat',
    gender: 'female',
    age: 4,
    description: 'A gentle Persian cat who enjoys lounging and being brushed.',
    avatar_url: '',
    created_at: new Date('2022-11-05'),
    updated_at: new Date('2023-09-12'),
    isLiked: false,
    isOwner: true
  },
  {
    _id: '5',
    owner_id: 'user4',
    name: 'Rocky',
    species: 'Dog',
    gender: 'male',
    age: 5,
    description: 'A loyal German Shepherd who excels at obedience training.',
    avatar_url: '',
    created_at: new Date('2023-02-18'),
    updated_at: new Date('2023-10-01'),
    isLiked: true,
    isOwner: false
  },
  {
    _id: '6',
    owner_id: 'user5',
    name: 'Coco',
    species: 'Bird',
    gender: 'female',
    age: 2,
    description: 'A beautiful cockatiel who loves to whistle tunes.',
    avatar_url: '',
    created_at: new Date('2023-04-12'),
    updated_at: new Date('2023-11-05'),
    isLiked: false,
    isOwner: false
  },
  {
    _id: '7',
    owner_id: 'user6',
    name: 'Max',
    species: 'Dog',
    gender: 'male',
    age: 1,
    description: 'A energetic puppy who loves to play and explore.',
    avatar_url: '',
    created_at: new Date('2023-08-20'),
    updated_at: new Date('2023-12-01'),
    isLiked: true,
    isOwner: false
  }
];

export default function PetsPage() {
  const [pets, setPets] = useState(mockPets);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    gender: '',
    age: '',
    description: '',
    avatar_url: ''
  });
  const [editingPet, setEditingPet] = useState(null);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'myPets'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    species: '',
    gender: '',
    minAge: '',
    maxAge: ''
  });

  // Filter pets by ownership
  const myPets = pets.filter(pet => pet.isOwner);
  const otherPets = pets.filter(pet => !pet.isOwner);

  // Apply filters to pets
  const applyFilters = (petsList) => {
    return petsList.filter(pet => {
      // Search term filter
      if (searchTerm && !pet.name.toLowerCase().includes(searchTerm.toLowerCase())) {
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
      
      // Age filters
      if (filters.minAge && pet.age < parseInt(filters.minAge)) {
        return false;
      }
      
      if (filters.maxAge && pet.age > parseInt(filters.maxAge)) {
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
    setPets(pets.map(pet => 
      pet._id === petId ? { ...pet, isLiked: !pet.isLiked } : pet
    ));
  };

  // Handle create pet
  const handleCreatePet = () => {
    if (!newPet.name || !newPet.species || !newPet.gender || !newPet.age) return;

    const pet = {
      _id: `${pets.length + 1}`,
      owner_id: 'user1', // Current user
      ...newPet,
      age: parseInt(newPet.age),
      created_at: new Date(),
      updated_at: new Date(),
      isLiked: false,
      isOwner: true
    };

    setPets([pet, ...pets]);
    setNewPet({
      name: '',
      species: '',
      gender: '',
      age: '',
      description: '',
      avatar_url: ''
    });
    setIsCreateDialogOpen(false);
  };

  // Handle update pet
  const handleUpdatePet = () => {
    if (!editingPet.name || !editingPet.species || !editingPet.gender || !editingPet.age) return;

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
  };

  // Handle delete pet
  const handleDeletePet = (petId) => {
    setPets(pets.filter(pet => pet._id !== petId));
    if (selectedPet && selectedPet._id === petId) {
      setSelectedPet(null);
    }
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

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      species: '',
      gender: '',
      minAge: '',
      maxAge: ''
    });
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Get filtered pets based on active tab
  const getFilteredPets = () => {
    if (activeTab === 'myPets') {
      return applyFilters(myPets);
    } else {
      return applyFilters(otherPets);
    }
  };

  const filteredPets = getFilteredPets();

  return (
    <div className="bg-[#f5f3f0] min-h-screen p-6 px-32">
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl page-header">Thú cưng</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#91114D] hover:bg-[#91114D]/90">
                <Plus className="h-4 w-4 mr-2" />
                Thêm thú cưng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm thú cưng mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Tên
                  </Label>
                  <Input
                    id="name"
                    value={newPet.name}
                    onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Tên thú cưng"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="species" className="text-right">
                    Loài
                  </Label>
                  <Input
                    id="species"
                    value={newPet.species}
                    onChange={(e) => setNewPet({...newPet, species: e.target.value})}
                    className="col-span-3"
                    placeholder="Chó, mèo, chim, ..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
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
                        onChange={(e) => setNewPet({...newPet, gender: e.target.value})}
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
                        onChange={(e) => setNewPet({...newPet, gender: e.target.value})}
                        className="mr-2"
                      />
                      Cái
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">
                    Tuổi
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                    className="col-span-3"
                    placeholder="Tuổi"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    value={newPet.description}
                    onChange={(e) => setNewPet({...newPet, description: e.target.value})}
                    className="col-span-3"
                    placeholder="Mô tả về thú cưng"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreatePet}
                  className="bg-[#91114D] hover:bg-[#91114D]/90"
                  disabled={!newPet.name || !newPet.species || !newPet.gender || !newPet.age}
                >
                  Tạo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'explore'
                ? 'border-b-2 border-[#91114D] text-[#91114D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('explore')}
          >
            Khám phá
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'myPets'
                ? 'border-b-2 border-[#91114D] text-[#91114D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('myPets')}
          >
            Thú cưng của tôi
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm thú cưng..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={filters.species}
                onChange={(e) => setFilters({...filters, species: e.target.value})}
              >
                <option value="">Tất cả loài</option>
                {getUniqueSpecies().map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
              
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={filters.gender}
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
              >
                <option value="">Tất cả giới tính</option>
                <option value="male">Đực</option>
                <option value="female">Cái</option>
              </select>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Tuổi từ"
                  className="w-20 text-sm"
                  value={filters.minAge}
                  onChange={(e) => setFilters({...filters, minAge: e.target.value})}
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="đến"
                  className="w-20 text-sm"
                  value={filters.maxAge}
                  onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </div>

        {/* Pets Grid */}
        {filteredPets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {activeTab === 'myPets' 
                ? 'Bạn chưa có thú cưng nào' 
                : 'Không có thú cưng nào để hiển thị'}
            </p>
            {activeTab === 'myPets' && (
              <div className="mt-4">
                <DialogTrigger asChild>
                  <Button className="bg-[#91114D] hover:bg-[#91114D]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thú cưng đầu tiên
                  </Button>
                </DialogTrigger>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <Card key={pet._id} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={pet.avatar_url} alt={pet.name} />
                      <AvatarFallback className="text-2xl bg-[#E6DDD5]">
                        {pet.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="flex justify-between items-center">
                    <span>{pet.name}</span>
                    <span className="text-sm font-normal bg-[#E6DDD5] px-2 py-1 rounded">
                      {pet.species}
                    </span>
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{pet.age} tuổi</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{pet.gender === 'male' ? 'Đực' : 'Cái'}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {pet.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between p-4 bg-gray-50">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewPet(pet)}
                  >
                    Xem chi tiết
                  </Button>
                  {activeTab === 'myPets' ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditPet(pet)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeletePet(pet._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleLikePet(pet._id)}
                      className={pet.isLiked ? "text-red-500 hover:text-red-600" : ""}
                    >
                      {pet.isLiked ? (
                        <Heart className="h-4 w-4 fill-current" />
                      ) : (
                        <HeartOff className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* View Pet Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
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
                              handleDeletePet(selectedPet._id);
                              setIsViewDialogOpen(false);
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

        {/* Edit Pet Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingPet(null);
        }}>
          <DialogContent className="max-w-md">
            {editingPet && (
              <>
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa thông tin thú cưng</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Tên
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingPet.name}
                      onChange={(e) => setEditingPet({...editingPet, name: e.target.value})}
                      className="col-span-3"
                      placeholder="Tên thú cưng"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-species" className="text-right">
                      Loài
                    </Label>
                    <Input
                      id="edit-species"
                      value={editingPet.species}
                      onChange={(e) => setEditingPet({...editingPet, species: e.target.value})}
                      className="col-span-3"
                      placeholder="Chó, mèo, chim, ..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
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
                          onChange={(e) => setEditingPet({...editingPet, gender: e.target.value})}
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
                          onChange={(e) => setEditingPet({...editingPet, gender: e.target.value})}
                          className="mr-2"
                        />
                        Cái
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-age" className="text-right">
                      Tuổi
                    </Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editingPet.age}
                      onChange={(e) => setEditingPet({...editingPet, age: e.target.value})}
                      className="col-span-3"
                      placeholder="Tuổi"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-description" className="text-right">
                      Mô tả
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editingPet.description}
                      onChange={(e) => setEditingPet({...editingPet, description: e.target.value})}
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
                    disabled={!editingPet.name || !editingPet.species || !editingPet.gender || !editingPet.age}
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