import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PostSkeleton() {
  return (
    <Card className="w-full mb-4 bg-white !shadow-none gap-2 py-4 border border-gray-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="!w-10 !h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>

      <CardContent className="px-4">
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        {/* Random image layout for variety */}
        <div className="mt-3">
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 px-4 pt-1">
        <div className="flex items-center justify-start gap-x-6 w-full text-[15px]">
          <div className="flex items-center gap-1 text-gray-600">
          <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <Skeleton className="flex-1 h-9 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}

