import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Smile, Image as ImageIcon, Tag, XIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LuDog, LuImagePlus } from "react-icons/lu";
import { BiSolidImageAdd } from 'react-icons/bi';

export default function PostCreation({ onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [images, setImages] = useState([]);
  const [taggedPets, setTaggedPets] = useState([]);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [username, setUsername] = useState('Trọng');

  const pets = [
    { id: 1, name: 'Buddy', type: 'Dog' },
    { id: 2, name: 'Whiskers', type: 'Cat' },
    { id: 3, name: 'Charlie', type: 'Bird' },
  ];

  const handlePostSubmit = () => {
    // Handle post submission
    console.log('Post submitted:', { postContent, selectedPet, images, taggedPets });
    
    // Call the callback if provided
    if (onPostCreated) {
      onPostCreated();
    }
    
    // Reset form
    setPostContent('');
    setSelectedPet(null);
    setImages([]);
    setTaggedPets([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handlePetSelect = (pet) => {
    // Toggle pet selection
    if (taggedPets.some(p => p.id === pet.id)) {
      setTaggedPets(taggedPets.filter(p => p.id !== pet.id));
    } else {
      setTaggedPets([...taggedPets, pet]);
    }
  };

  const handleRemoveTaggedPet = (petId) => {
    setTaggedPets(taggedPets.filter(pet => pet.id !== petId));
  };

  return (
    <Card className="w-full bg-white border-gray-300 !shadow-none !py-4">
      <CardContent className="px-4">
        <div className="flex gap-3">
          {/* <Avatar className={"w-11 h-11"}>
            <AvatarImage src="" alt="User" />
            <AvatarFallback className={"bg-primary text-primary-foreground"}>PT</AvatarFallback>
          </Avatar> */}
          <div className="flex-1">
            <textarea
              className="bg-[#F7F7F7] w-full p-3 border rounded-lg text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[#91114D]"
              rows="2"
              placeholder={`Chào ${username}, thú cưng của bạn hôm nay thế nào?`}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button 
                    className="absolute -top-1 -right-2 bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:cursor-pointer"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                  >
                    <XIcon className='w-4 h-4'/>
                  </button>
                </div>
              ))}
              
              {/* Tagged pets preview */}
              {taggedPets.map((pet, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-1 bg-[#E6DDD5] rounded-full px-3 py-1">
                    <LuDog className="w-4 h-4" />
                    <span className="text-sm">{pet.name}</span>
                    <button 
                      className="ml-1 hover:bg-[#d4c9bd] rounded-full p-0.5"
                      onClick={() => handleRemoveTaggedPet(pet.id)}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {/* Pet tagging dialog */}
                <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="rounded-full border-none shadow-none !px-3 text-black"
                      onClick={() => setIsPetDialogOpen(true)}
                    >
                      <LuDog className="!w-5.5 !h-5.5 text-pink-600" />
                      Thêm thú cưng
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Chọn thú cưng để gắn thẻ</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        {pets.map((pet) => (
                          <div 
                            key={pet.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                              taggedPets.some(p => p.id === pet.id) 
                                ? 'bg-[#E6DDD5]' 
                                : 'hover:bg-[#f0e9e2]'
                            }`}
                            onClick={() => handlePetSelect(pet)}
                          >
                            <LuDog className="w-5 h-5" />
                            <div className="flex-1">
                              <p className="font-medium">{pet.name}</p>
                              <p className="text-sm text-muted-foreground">{pet.type}</p>
                            </div>
                            {taggedPets.some(p => p.id === pet.id) && (
                              <div className="w-5 h-5 rounded-full bg-[#91114D] flex items-center justify-center">
                                <XIcon className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={() => setIsPetDialogOpen(false)}
                          className="bg-[#91114D] text-primary-foreground hover:bg-[#91114D]/85"
                        >
                          Xác nhận
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                  <Button variant={'outline'} className="border-none shadow-none rounded-full !px-3 text-black" asChild>
                    <span>
                      <LuImagePlus className="!w-5.5 !h-5.5 text-blue-600" />
                      Thêm ảnh
                    </span>
                  </Button>
                </label>
                <Button variant={'outline'} className="rounded-full border-none shadow-none !px-3 text-black">
                  <Smile className="!w-5 !h-5 text-orange-600" />
                  Emoji
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handlePostSubmit}
                  disabled={!postContent.trim()}
                  className={"bg-[#91114D] text-primary-foreground hover:bg-[#91114D]/85 rounded-full"}
                >
                  Đăng bài
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}