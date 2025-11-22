import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function AvatarGroup({ 
  className, 
  children,
  ...props 
}) {
  return (
    <div 
      data-slot="avatar-group"
      className={cn("flex", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarGroupItem({ 
  className, 
  src,
  alt,
  fallback,
  ...props 
}) {
  return (
    <div 
      data-slot="avatar-group-item"
      className={cn("-ml-2 first:ml-0 border-2 border-white dark:border-gray-800 rounded-full", className)}
      {...props}
    >
      <Avatar>
        {src && <AvatarImage src={src} alt={alt} />}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </div>
  );
}

AvatarGroup.Item = AvatarGroupItem;

export { AvatarGroup, AvatarGroupItem };