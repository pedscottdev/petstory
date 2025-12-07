import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PostFilter({ activeFilter = 'latest', onFilterChange }) {
    const filters = [
        { id: "latest", label: "Mới nhất" },
        { id: "following", label: "Đang theo dõi" },
        { id: "popular", label: "Phổ biến" },
    ];

    const handleTabChange = (value) => {
        if (onFilterChange) {
            onFilterChange(value);
        }
    };

    return (
        <div className="flex gap-2 py-2 pt-3">
            <Tabs value={activeFilter} onValueChange={handleTabChange} className="w-full bg-[]">
                <TabsList className="bg-[#E6E4E0] ">
                    {filters.map((filter) => (
                        <TabsTrigger
                            key={filter.id}
                            value={filter.id}
                            className="px-4 data-[state=active]:bg-[#91114D] data-[state=active]:text-white hover:cursor-pointer data-[state=active]:shadow-sm data-[state=active]:font-semibold"
                        >
                            {filter.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}