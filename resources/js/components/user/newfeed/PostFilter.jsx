import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PostFilter() {
    const filters = [
        { id: "latest", label: "Mới nhất" },
        { id: "following", label: "Đang theo dõi" },
        { id: "popular", label: "Phổ biến" },
    ];

    return (
        <div className="flex gap-2 py-2 pt-3">
            <Tabs defaultValue="latest" className="w-full bg-[]">
                <TabsList className="bg-[#E6E4E0] ">
                    {filters.map((filter) => (
                        <TabsTrigger
                            key={filter.id}
                            value={filter.id}
                            className="hover:cursor-pointer px-3"
                        >
                            {filter.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
