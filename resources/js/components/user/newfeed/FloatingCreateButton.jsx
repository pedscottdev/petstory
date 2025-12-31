import React, { useState, forwardRef, useImperativeHandle, useRef } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Image as ImageIcon, Tag } from "lucide-react";
import { LuDog, LuImagePlus } from "react-icons/lu";
import { useAuth } from "@/contexts/AuthContext";
import { createPost } from "@/api/postApi";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import ButtonLoader from '@/components/ui/ButtonLoader';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { getImageUrl } from '@/utils/imageUtils';

const FloatingCreateButton = forwardRef(({ onPostCreated, userData, groupId }, ref) => {
  const { user } = useAuth();
  const { uploadPostImages } = useImageUpload();
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedPet, setSelectedPet] = useState(null);
  const [images, setImages] = useState([]);
  const [taggedPets, setTaggedPets] = useState([]);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textareaRef = useRef(null);

  // Get user's pets from userData prop or user context
  const pets = userData?.pets || user?.pets || [];

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = postContent.slice(0, start) + emoji.native + postContent.slice(end);
      setPostContent(newContent);

      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + emoji.native.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      // Fallback: append to end if no textarea ref
      setPostContent(postContent + emoji.native);
    }
    setIsEmojiPickerOpen(false);
  };

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

  const handlePostSubmit = async () => {
    // Validate: must have content and at least 1 pet
    if (!postContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết');
      return;
    }

    if (taggedPets.length === 0) {
      toast.error('Vui lòng gắn thẻ ít nhất 1 thú cưng');
      return;
    }

    // Validate max 4 images
    if (images.length > 4) {
      toast.error('Chỉ được tải lên tối đa 4 ảnh');
      return;
    }

    setIsSubmitting(true);

    try {
      // First create the post without images
      const postData = {
        content: postContent.trim(),
        tagged_pets: taggedPets.map(pet => pet.id),
        ...(groupId && { group_id: groupId })
      };

      const response = await createPost(postData);

      if (!response.success) {
        throw new Error(response.message || 'Không thể tạo bài viết');
      }

      const createdPost = response.data;

      // Upload images if any
      if (images.length > 0) {
        try {
          await uploadPostImages(images, createdPost.id);
        } catch (uploadError) {
          console.error('Failed to upload images:', uploadError);
          // Delete the post since image upload failed
          try {
            await deletePost(createdPost.id);
          } catch (deleteError) {
            console.error('Failed to delete post after image upload failure:', deleteError);
          }
          toast.error(uploadError.message || 'Không thể tải lên ảnh. Bài viết chưa được đăng.');
          // Don't proceed with success notification
          setIsSubmitting(false);
          return;
        }
      }

      // Success
      toast.success('Đăng bài thành công!');

      // Reset form
      setPostContent("");
      setSelectedPet(null);
      setImages([]);
      setTaggedPets([]);

      // Close dialog
      setIsOpen(false);

      // Notify parent to refresh feed
      if (onPostCreated) {
        onPostCreated(createdPost);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error(error.message || 'Đã có lỗi xảy ra khi đăng bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + files.length;

    if (totalImages > 4) {
      toast.error('Chỉ được tải lên tối đa 4 ảnh');
      return;
    }

    setImages((prev) => [...prev, ...files]);
  };

  const handleClose = () => {
    // Check if there's any content
    const hasContent = postContent.trim() || taggedPets.length > 0 || images.length > 0;

    if (hasContent) {
      // Show confirmation dialog
      setShowCancelAlert(true);
    } else {
      // No content, close immediately
      setIsOpen(false);
    }
  };

  const confirmCancel = () => {
    // Reset form when confirming cancel
    setPostContent("");
    setSelectedPet(null);
    setImages([]);
    setTaggedPets([]);
    setShowCancelAlert(false);
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
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          setIsOpen(open);
        }
      }}>
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
                  ref={textareaRef}
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
                          <DialogTitle className={"page-header text-[22px]"}>Chọn thú cưng để gắn thẻ</DialogTitle>
                        </DialogHeader>
                        <div className="">
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
                                  src={getImageUrl(pet.avatar_url || pet.avatar)}
                                  alt={pet.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-[15px]">{pet.name}</p>
                                  <p className="text-sm text-muted-foreground">{pet.breed || pet.species || 'Chưa xác định'}</p>
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
                              className="bg-[#91114D] text-primary-foreground hover:bg-[#91114D]/85 rounded-full"
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
                    <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant={'outline'} className="rounded-full shadow-none !px-3 text-black">
                          <Smile className="!w-5 !h-5 text-orange-600" />
                          Emoji
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-0"
                        side="top"
                        align="start"
                        sideOffset={8}
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={handleEmojiSelect}
                          theme="light"
                          locale="vi"
                          previewPosition="none"
                          skinTonePosition="none"
                          searchPosition="sticky"
                          navPosition="bottom"
                          perLine={8}
                          emojiSize={24}
                          emojiButtonSize={32}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button
              onClick={handleClose}
              disabled={isSubmitting}
              variant="outline"
              size={"lg"}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              onClick={handlePostSubmit}
              disabled={!postContent.trim() || taggedPets.length === 0 || isSubmitting}
              size={"lg"}
              className={
                "bg-[#91114D] rounded-full text-primary-foreground hover:bg-[#91114D]/85"
              }
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                  Đang đăng bài
                </span>
              ) : 'Đăng bài'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation alert */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="page-header text-[22px]">Bạn chắc chắn muốn hủy?</AlertDialogTitle>
            <AlertDialogDescription>
              Nội dung bài viết của bạn sẽ không được lưu lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" onClick={() => setShowCancelAlert(false)}>
              Tiếp tục chỉnh sửa
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-700 hover:bg-red-600/80 text-white disabled:opacity-50 rounded-full"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default FloatingCreateButton;