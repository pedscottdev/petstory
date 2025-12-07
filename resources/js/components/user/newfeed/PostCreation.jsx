import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Smile, Image as ImageIcon, Tag, XIcon } from 'lucide-react';
import { LuDog, LuImagePlus } from "react-icons/lu";
import { useAuth } from '@/contexts/AuthContext';

const PostCreation = forwardRef(({ onPostCreated, onOpenDialog }, ref) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const username = user?.first_name || 'Bạn';

  // Expose method to parent component
  useImperativeHandle(ref, () => ({
    resetForm() {
      setPostContent('');
    }
  }));

  const handleOpenDialog = () => {
    if (onOpenDialog) {
      onOpenDialog();
    }
  };

  return (
    <Card className="w-full bg-white border-gray-300 !shadow-none !py-4">
      <CardContent className="px-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              className="bg-[#F7F7F7] w-full p-3 border rounded-lg text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[#91114D]"
              rows="2"
              placeholder={`Chào ${username}, thú cưng của bạn hôm nay thế nào?`}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onClick={handleOpenDialog}
            />

            <div className="flex justify-between items-center">
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  className="rounded-full border-none shadow-none !px-3 text-black"
                  onClick={handleOpenDialog}
                >
                  <LuDog className="!w-5.5 !h-5.5 text-pink-600" />
                  Thêm thú cưng
                </Button>

                <Button
                  variant={'outline'}
                  className="border-none shadow-none rounded-full !px-3 text-black"
                  onClick={handleOpenDialog}
                >
                  <LuImagePlus className="!w-5.5 !h-5.5 text-blue-600" />
                  Thêm ảnh
                </Button>

                <Button
                  variant={'outline'}
                  className="rounded-full border-none shadow-none !px-3 text-black"
                  onClick={handleOpenDialog}
                >
                  <Smile className="!w-5 !h-5 text-orange-600" />
                  Emoji
                </Button>
              </div>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PostCreation.displayName = 'PostCreation';

export default PostCreation;
