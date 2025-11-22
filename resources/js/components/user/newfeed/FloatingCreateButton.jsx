import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Plus, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Image as ImageIcon, Tag } from "lucide-react";
import { LuDog, LuImagePlus } from "react-icons/lu";

const FloatingCreateButton = forwardRef((props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [selectedPet, setSelectedPet] = useState(null);
    const [images, setImages] = useState([]);
    const [taggedPets, setTaggedPets] = useState([]);
    const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);

    const pets = [
        { id: 1, name: "Buddy", type: "Dog", species: "Chó Golden Retriever", avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
        { id: 2, name: "Whiskers", type: "Dog", species: "Chó Pitbull", avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'  },
        { id: 3, name: "Charlie", type: "Bird", species: "Vẹt Nam Mỹ", avatar: 'https://images.unsplash.com/photo-1700048802079-ec47d07f7919?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=907' },
    ];

    // Expose method to parent component
    useImperativeHandle(ref, () => ({
        openDialog() {
            setIsOpen(true);
        },
        resetForm() {
            setPostContent("");
            setSelectedPet(null);
            setImages([]);
            setTaggedPets([]);
        }
    }));

    const handlePostSubmit = () => {
        // Handle post submission
        console.log("Post submitted:", { postContent, selectedPet, images, taggedPets });

        // Reset form
        setPostContent("");
        setSelectedPet(null);
        setImages([]);
        setTaggedPets([]);

        // Close dialog
        setIsOpen(false);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);
    };

    const handleClose = () => {
        // Reset form when closing
        setPostContent("");
        setSelectedPet(null);
        setImages([]);
        setTaggedPets([]);
        setIsOpen(false);
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="transition-all active:scale-150 duration-300 fixed bottom-8 right-8 bg-[#DBDAD6] border border-[#D1CEC9] p-4 px-6 rounded-xl hover:cursor-pointer">
                    <Plus className="!h-7 !w-7" />
                </div>
            </DialogTrigger>
            <DialogContent
                className="min-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-2"
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader className="p-6 pb-0">
                    <div className="flex justify-between items-center">
                        <DialogTitle className={"page-header text-[22px]"}>Tạo bài đăng mới</DialogTitle>
                    </div>
                </DialogHeader>
                <div className="p-6 py-2">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            {(taggedPets.length > 0) && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {/* Tagged pets preview */}
                                    {taggedPets.map((pet, index) => (
                                        <div key={index} className="relative">
                                            <div className="flex items-center gap-2 bg-[#f1eae3] rounded-full px-3 py-1 w-fit">
                                                <LuDog className="w-4 h-4" />
                                                <span className="text-sm font-semibold">{pet.name}</span>
                                                <button
                                                    className="ml-1 hover:bg-[#d4c9bd] rounded-full p-0.5 hover:cursor-pointer"
                                                    onClick={() => handleRemoveTaggedPet(pet.id)}
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea
                                className="bg-[#F7F7F7] w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#91114D] text-[15px]"
                                rows="3"
                                placeholder="Thú cưng của bạn hôm nay thế nào?"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />

                            {(images.length > 0) && (
                                <div className="flex flex-wrap gap-2 my-2 mb-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt="Preview"
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <button
                                                className="absolute -top-1 -right-2 bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:cursor-pointer"
                                                onClick={() =>
                                                    setImages(
                                                        images.filter(
                                                            (_, i) => i !== index
                                                        )
                                                    )
                                                }
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex gap-2">
                                    {/* Pet tagging dialog */}
                                    <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="rounded-full shadow-none !px-3 text-black"
                                                onClick={() => setIsPetDialogOpen(true)}
                                            >
                                                <LuDog className="!w-5.5 !h-5.5 text-pink-600" />
                                                Thêm thú cưng
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md" onInteractOutside={(e) => {
                                            e.preventDefault();
                                        }}>
                                            <DialogHeader>
                                                <DialogTitle className={"font-bold"}>Chọn thú cưng để gắn thẻ</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-3 pb-0">
                                                <div className="space-y-2">
                                                    {pets.map((pet) => (
                                                        <div
                                                            key={pet.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${taggedPets.some(p => p.id === pet.id)
                                                                ? 'bg-[#f1e9e3]'
                                                                : 'hover:bg-[#f0e9e2]'
                                                                }`}
                                                            onClick={() => handlePetSelect(pet)}
                                                        >
                                                            <img 
                                                                src={pet.avatar} 
                                                                alt={pet.name} 
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-[15px]">{pet.name}</p>
                                                                <p className="text-sm text-muted-foreground">{pet.species}</p>
                                                            </div>
                                                            {taggedPets.some(p => p.id === pet.id) && (
                                                                <div className="w-5 h-5 rounded-full bg-[#91114D] flex items-center justify-center mr-3">
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
                                        <Button
                                            variant={'outline'}
                                            className="shadow-none rounded-full !px-3 text-black"
                                            asChild
                                        >
                                            <span>
                                                <LuImagePlus className="!w-5.5 !h-5.5 text-blue-600" />
                                                Thêm ảnh
                                            </span>
                                        </Button>
                                    </label>
                                    <Button variant={'outline'} className="rounded-full shadow-none !px-3 text-black">
                                        <Smile className="!w-5 !h-5 text-orange-600" />
                                        Emoji
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 p-6 pt-0">
                    <DialogClose asChild>
                    </DialogClose>
                    <Button
                        onClick={handlePostSubmit}
                        disabled={!postContent.trim()}
                        size={"lg"}
                        className={
                            "bg-[#91114D] rounded-full text-primary-foreground hover:bg-[#91114D]/85"
                        }
                    >
                        Đăng bài
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
});

export default FloatingCreateButton;