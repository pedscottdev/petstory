import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AuthBg1 from "../../../../../public/images/auth-bg-1.jpg";
import AuthBg2 from "../../../../../public/images/auth-bg-2.jpg";
import AuthBg3 from "../../../../../public/images/auth-bg-3.jpg";

export default function AuthLayout() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const backgroundImages = [AuthBg1, AuthBg2, AuthBg3];

    // Auto-play carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="max-h-screen flex">
            {/* Left side - Auth Form */}
            <Outlet />

            {/* Right side - Carousel */}
            <div className="hidden xl:block xl:w-3/5 relative overflow-hidden">
                {/* Carousel container */}
                <div className="relative w-full h-screen">
                    {/* Images */}
                    <div className="relative w-full h-full">
                        {backgroundImages.map((image, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                                    index === currentSlide
                                        ? "opacity-100"
                                        : "opacity-0"
                                }`}
                            >
                                {/* Dark overlay */}
                                <div className="absolute inset-0 w-full h-screen bg-gradient-to-b from-[#270b17] to-[#15050c] opacity-65 z-10"></div>

                                {/* Image */}
                                <img
                                    src={image}
                                    alt={`Auth Background ${index + 1}`}
                                    className="w-full h-screen object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="flex space-x-3">
                            {backgroundImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`transition-all duration-300 ${
                                        index === currentSlide
                                            ? "w-8 h-2 bg-white"
                                            : "w-2 h-2 bg-white/50 hover:bg-white/75"
                                    } rounded-full`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Optional: Add text overlay */}
                    <div className="absolute inset-0 flex items-end pb-20 justify-center z-20 pointer-events-none">
                        <div className="text-center px-8">
                            <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
                                "Thế giới nhỏ cho những tình yêu lớn."
                            </h2>
                            <p className="text-lg text-white/90 drop-shadow-lg">
                                Ghi lại hành trình yêu thương cùng thú cưng —
                                nơi mọi kỷ niệm đều được trân trọng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
