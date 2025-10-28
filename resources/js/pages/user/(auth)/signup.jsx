import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function SignupPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    // Validation function
    const validateForm = () => {
        // Check if all fields are filled
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toast.error("Vui lòng điền đầy đủ thông tin");
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

        // Check if passwords match
        if (password !== confirmPassword) {
            toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Signup submitted:", { firstName, lastName, email, password });
            toast.success("Đăng ký thành công!");
            navigate("/login");
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Toggle confirm password visibility
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <>
          {/* Left side - Signup form */}
            <div className="w-2/5 h-screen flex items-center justify-center p-8 bg-white">
                <div className="w-full h-full flex flex-col justify-between max-w-md">
                    {/* Logo */}
                    <div className="mt-8">
                        <img src={AppLogo} alt="App Logo" className="h-12" />
                    </div>

                    <Card className="border-0 shadow-none bg-white">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-3xl font-bold">
                                Tạo tài khoản mới
                            </CardTitle>
                            <CardDescription className="text-base">
                                Chỉ với một vài thông tin cơ bản.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* First and Last Name row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Họ và tên đệm</Label>
                                        <Input
                                            type="text"
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Nguyễn Văn"
                                            className="h-11 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Tên</Label>
                                        <Input
                                            type="text"
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="An"
                                            className="h-11 bg-white"
                                        />
                                    </div>
                                </div>

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

                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                                <EyeOff size={20} className="!h-5 !w-5 mr-2 text-gray-600" />
                                            ) : (
                                                <Eye size={20} className=" !h-5 !w-5 mr-2 text-gray-600" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="*******"
                                            className="h-11 bg-white pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} className="!h-5 !w-5 mr-2 text-gray-600" />
                                            ) : (
                                                <Eye size={20} className="!h-5 !w-5 mr-2 text-gray-600" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11"
                                    size="lg"
                                >
                                    Đăng ký
                                </Button>
                                <div className="text-center text-sm w-full">
                                    <p>
                                        Bạn đã có tài khoản?{" "}
                                        <Link to="/login">
                                        <a
                                            className="text-[#820d43] hover:underline"
                                        >
                                            Đăng nhập tại đây
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