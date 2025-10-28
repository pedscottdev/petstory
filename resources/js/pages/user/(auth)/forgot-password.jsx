import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Import images - these would normally come from your public folder
import AppLogo from "../../../../../public/images/app-logo.svg";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    // Validation function
    const validateForm = () => {
        // Check if email is empty
        if (!email) {
            toast.error("Vui lòng nhập email");
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không đúng định dạng");
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Forgot password submitted:", { email });
            toast.success("Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn!");
            // In a real app, you would call an API to send reset instructions
        }
    };

    return (
        <>
            {/* Left side - Forgot Password form */}
            <div className="w-2/5 h-screen flex items-center justify-center p-8 bg-white">
                <div className="w-full h-full flex flex-col justify-between max-w-md">
                    {/* Logo */}
                    <div className="mt-8">
                        <img src={AppLogo} alt="App Logo" className="h-12" />
                    </div>

                    <Card className="border-0 shadow-none bg-white">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-3xl font-bold">
                                Quên mật khẩu?
                            </CardTitle>
                            <CardDescription className="text-base">
                                Hãy nhập email bạn đã đăng ký để tiến hành lấy lại mật khẩu.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="h-11 bg-white"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11"
                                    size="lg"
                                >
                                    Xác nhận
                                </Button>
                                <div className="text-center text-sm w-full">
                                    <p>
                                        <Link to="/login">
                                            <a className="text-[#820d43] hover:underline">
                                                Quay lại đăng nhập
                                            </a>
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Credit */}
                    <div className="w-full text-center">
                        <p className="text-sm text-gray-500">
                            Developed by PEDROJECT @{new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}