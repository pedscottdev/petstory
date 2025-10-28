import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Import images - these would normally come from your public folder
import AppLogo from "../../../../../public/images/app-logo.svg";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Added state for password visibility

    const navigate = useNavigate();

    // Validation function
    const validateForm = () => {
        // Check if both fields are empty
        if (!email && !password) {
            toast.error("Vui lòng nhập email và mật khẩu");
            return false;
        }

        // Check if email is empty
        if (!email) {
            toast.error("Vui lòng nhập email");
            return false;
        }

        // Check if password is empty
        if (!password) {
            toast.error("Vui lòng nhập mật khẩu");
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không đúng định dạng");
            return false;
        }

        // Validate password length
        if (password.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (validateForm()) {
            console.log("Login submitted:", { email, password, rememberMe });
            navigate("/");
            toast.success("Đăng nhập thành công!");
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
          {/* Left side - Login form */}
            <div className="w-2/5 h-screen flex items-center justify-center p-8 bg-white">
                <div className="w-full h-full flex flex-col justify-between max-w-md">
                    {/* Logo */}
                    <div className="mt-8">
                        <img src={AppLogo} alt="App Logo" className="h-12" />
                    </div>

                    <Card className="border-0 shadow-none bg-white">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-3xl font-bold">
                                Chào mừng trở lại!
                            </CardTitle>
                            <CardDescription className="text-base">
                                Đăng nhập ngay để bắt đầu chia sẻ khoảnh khắc
                                của bạn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="user@example.com"
                                        className="h-11 bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            id="password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="*******"
                                            className="h-11 bg-white pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    className="!h-5 !w-5 mr-2 text-gray-600"
                                                />
                                            ) : (
                                                <Eye
                                                    className="!h-5 !w-5 mr-2 text-gray-600"
                                                />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={setRememberMe}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            Ghi nhớ đăng nhập
                                        </Label>
                                    </div>
                                    <Link to="/forgot-password">
                                    <a
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11"
                                    size="lg"
                                >
                                    Đăng nhập
                                </Button>
                                <div className="text-center text-sm w-full">
                                    <p>
                                        Bạn chưa có tài khoản?{" "}
                                        <Link to="/signup">
                                        <span
                                            className=" text-[#820d43] hover:underline"
                                        >
                                            Đăng ký tại đây
                                        </span>
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
