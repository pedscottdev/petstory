import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp";

// Import images - these would normally come from your public folder
import AppLogo from "../../../../../public/images/app-logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import authApi from "@/api/authApi";

export default function SignupPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP states
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [resendAvailable, setResendAvailable] = useState(false);
    
    // Loading state
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Handle cooldown timer for resend OTP
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => {
                setCooldown(cooldown - 1);
            }, 1000);
        } else if (cooldown === 0 && showOTP) {
            setResendAvailable(true);
        }
        return () => clearTimeout(timer);
    }, [cooldown, showOTP]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            try {
                // Generate OTP
                const response = await authApi.generateOTP({
                    email: email,
                    purpose: 'registration'
                });

                if (response.success) {
                    toast.success(response.message);
                    // Show OTP screen after successful OTP generation
                    setShowOTP(true);
                    // Start cooldown timer (30 seconds)
                    setCooldown(30);
                    setResendAvailable(false);
                } else {
                    toast.error(response.message || "Đăng ký thất bại");
                }
            } catch (error) {
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error("Đăng ký thất bại. Vui lòng thử lại.");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle OTP submission
    const handleOTPSubmit = async (e) => {
        // Check if e is an event object or a string (OTP value)
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        setLoading(true);
        try {
            // First verify OTP
            const verifyResponse = await authApi.verifyOTP({
                email: email,
                otp: otp,
                purpose: 'registration'
            });

            if (verifyResponse.success) {
                // If OTP is valid, register the user
                const registerResponse = await authApi.register({
                    email: email,
                    password: password,
                    password_confirmation: confirmPassword,
                    first_name: firstName,
                    last_name: lastName
                });

                if (registerResponse.success) {
                    toast.success("Đăng ký thành công!");
                    navigate("/login");
                } else {
                    toast.error(registerResponse.message || "Đăng ký thất bại");
                }
            } else {
                toast.error(verifyResponse.message || "Mã OTP không chính xác");
            }
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Xác minh OTP thất bại");
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle resend OTP
    const handleResendOTP = async () => {
        if (resendAvailable) {
            setLoading(true);
            try {
                const response = await authApi.generateOTP({
                    email: email,
                    purpose: 'registration'
                });

                if (response.success) {
                    // Reset OTP and start new cooldown
                    setOtp("");
                    setCooldown(30);
                    setResendAvailable(false);
                    toast.info("Mã OTP mới đã được gửi đến email của bạn");
                } else {
                    toast.error(response.message || "Gửi lại OTP thất bại");
                }
            } catch (error) {
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error("Gửi lại OTP thất bại");
                }
            } finally {
                setLoading(false);
            }
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

    // Render signup form
    const renderSignupForm = () => (
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
                                            disabled={loading}
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
                                            disabled={loading}
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
                                        placeholder="nguyenvanan@example.com"
                                        className="h-11 bg-white"
                                        disabled={loading}
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
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={togglePasswordVisibility}
                                            disabled={loading}
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
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={toggleConfirmPasswordVisibility}
                                            disabled={loading}
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
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        "Đăng ký"
                                    )}
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
                            Developed by PEDROLAB @{new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );

    // Render OTP verification form
    const renderOTPForm = () => (
        <>
            {/* Left side - OTP verification form */}
            <div className="w-2/5 h-screen flex items-center justify-center p-8 bg-white">
                <div className="w-full h-full flex flex-col justify-between max-w-md">
                    {/* Logo */}
                    <div className="mt-8">
                        <img src={AppLogo} alt="App Logo" className="h-12" />
                    </div>

                    <Card className="border-0 shadow-none bg-white">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-3xl font-bold">
                                Xác minh OTP
                            </CardTitle>
                            <CardDescription className="text-base">
                                Chúng tôi đã gửi mã OTP về email <b>{email}</b>, vui lòng kiểm tra và xác nhận.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0 ">
                            <form onSubmit={handleOTPSubmit} className="space-y-6 ">
                                <div className="space-y-4 ">
                                    <div className="w-full flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            size="lg"
                                            value={otp}
                                            onChange={(value) => setOtp(value)}
                                            disabled={loading}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup>
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-y-2">
                                    <Button
                                        type="button"
                                        size="lg"
                                        variant="outline"
                                        onClick={handleResendOTP}
                                        disabled={!resendAvailable || loading}
                                        className="flex items-center gap-2"
                                    >
                                        {loading && !resendAvailable ? (
                                            <span className="flex items-center">
                                                <ButtonLoader className="-ml-1 mr-2 h-4 w-4" />
                                                Đang gửi...
                                            </span>
                                        ) : (
                                            <>
                                                <RotateCcw size={16} />
                                                Gửi lại OTP {cooldown > 0 && `(${cooldown}s)`}
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="h-11"
                                        size="lg"
                                        disabled={otp.length !== 6 || loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center">
                                                <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                                                Đang xác minh...
                                            </span>
                                        ) : (
                                            "Xác nhận"
                                        )}
                                    </Button>
                                </div>

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
                            Developed by PEDROLAB @{new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );

    return showOTP ? renderOTPForm() : renderSignupForm();
}