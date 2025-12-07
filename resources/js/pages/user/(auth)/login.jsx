import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

// Import images - these would normally come from your public folder
import AppLogo from "../../../../../public/images/app-logo.svg";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        // Basic validation
        if (!email || !password) {
            toast.error("Vui lòng nhập email và mật khẩu");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không đúng định dạng");
            return;
        }

        // Validate password length
        if (password.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        setSubmitting(true);
        try {
            // Attempt login
            const result = await login(email, password);
            if (result.success) {
                toast.success("Đăng nhập thành công!");
                navigate("/");
            } else {
                toast.error(result.message || "Không thể đăng nhập, vui lòng thử lại sau!");
            }
        } finally {
            setSubmitting(false);
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
                                        disabled={submitting}
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
                                            disabled={submitting}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={togglePasswordVisibility}
                                            disabled={submitting}
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
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                                            Đang đăng nhập...
                                        </span>
                                    ) : (
                                        "Đăng nhập"
                                    )}
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
                            Developed by PEDROLAB @{new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
