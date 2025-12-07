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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // OTP states
    const [showOTP, setShowOTP] = useState(false);
    const [showResetForm, setShowResetForm] = useState(false);
    const [otp, setOtp] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [resendAvailable, setResendAvailable] = useState(false);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

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

    // Validation function for email
    const validateEmailForm = () => {
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

    // Validation function for password reset
    const validatePasswordForm = () => {
        // Validate password length
        if (newPassword.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return false;
        }

        // Validate password contains numbers and special characters
        const hasNumber = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        
        if (!hasNumber || !hasSpecialChar) {
            toast.error("Mật khẩu phải chứa cả chữ số và ký tự đặc biệt");
            return false;
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
            return false;
        }

        return true;
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (validateEmailForm()) {
            setLoading(true);
            try {
                // httpClient interceptor already returns response.data
                const response = await authApi.generateOTP({
                    email: email,
                    purpose: 'password_reset'
                });

                console.log('Generate OTP Response:', response);

                if (response.success) {
                    toast.success(response.message || 'Mã OTP đã được gửi đến email của bạn');
                    // Show OTP screen after successful email submission
                    setShowOTP(true);
                    // Start cooldown timer
                    setCooldown(30);
                    setResendAvailable(false);
                } else {
                    toast.error(response.message || 'Gửi yêu cầu thất bại');
                }
            } catch (error) {
                console.error('Generate OTP Error:', error);
                const errorMessage = error.response?.data?.message || error.message || "Gửi yêu cầu thất bại";
                toast.error(errorMessage);
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

        setOtpLoading(true);
        try {
            // httpClient interceptor already returns response.data
            const response = await authApi.verifyOTP({
                email: email,
                otp: otp,
                purpose: 'password_reset'
            });

            console.log('Verify OTP Response:', response);
            
            if (response.success) {
                toast.success(response.message || 'Xác thực OTP thành công');
                setShowResetForm(true);
                setShowOTP(false);
            } else {
                toast.error(response.message || 'Xác minh OTP thất bại');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            const errorMessage = error.response?.data?.message || error.message || "Xác minh OTP thất bại";
            toast.error(errorMessage);
        } finally {
            setOtpLoading(false);
        }
    };

    // Handle resend OTP
    const handleResendOTP = async () => {
        if (resendAvailable) {
            setOtpLoading(true);
            try {
                // httpClient interceptor already returns response.data
                const response = await authApi.generateOTP({
                    email: email,
                    purpose: 'password_reset'
                });

                console.log('Resend OTP Response:', response);

                if (response.success) {
                    // Reset OTP and start new cooldown
                    setOtp("");
                    setCooldown(30);
                    setResendAvailable(false);
                    toast.success(response.message || "Mã OTP mới đã được gửi đến email của bạn");
                } else {
                    toast.error(response.message || 'Gửi lại OTP thất bại');
                }
            } catch (error) {
                console.error('Resend OTP Error:', error);
                const errorMessage = error.response?.data?.message || error.message || "Gửi lại OTP thất bại";
                toast.error(errorMessage);
            } finally {
                setOtpLoading(false);
            }
        }
    };

    // Handle password reset submission
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (validatePasswordForm()) {
            setResetLoading(true);
            try {
                // httpClient interceptor already returns response.data
                const response = await authApi.confirmPassword({
                    email: email,
                    password: newPassword,
                    password_confirmation: confirmPassword
                });

                console.log('Confirm Password Response:', response);

                if (response.success) {
                    toast.success(response.message || "Đổi mật khẩu thành công!");
                    navigate("/login");
                } else {
                    toast.error(response.message || 'Đổi mật khẩu thất bại');
                }
            } catch (error) {
                console.error('Confirm Password Error:', error);
                const errorMessage = error.response?.data?.message || error.message || "Đổi mật khẩu thất bại";
                toast.error(errorMessage);
            } finally {
                setResetLoading(false);
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

    // Render email form
    const renderEmailForm = () => (
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
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="h-11 bg-white"
                                        disabled={loading}
                                    />
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
                                            Đang gửi...
                                        </span>
                                    ) : (
                                        "Xác nhận"
                                    )}
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
                                            disabled={otpLoading}
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
                                        disabled={!resendAvailable || otpLoading}
                                        className="flex items-center gap-2"
                                    >
                                        {otpLoading && !resendAvailable ? (
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
                                        disabled={otp.length !== 6 || otpLoading}
                                    >
                                        {otpLoading ? (
                                            <span className="flex items-center justify-center">
                                                <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                                                Đang xác minh...
                                            </span>
                                        ) : (
                                            "Xác nhận"
                                        )}
                                    </Button>
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

    // Render password reset form
    const renderResetForm = () => (
        <>
            {/* Left side - Password reset form */}
            <div className="w-2/5 h-screen flex items-center justify-center p-8 bg-white">
                <div className="w-full h-full flex flex-col justify-between max-w-md">
                    {/* Logo */}
                    <div className="mt-8">
                        <img src={AppLogo} alt="App Logo" className="h-12" />
                    </div>

                    <Card className="border-0 shadow-none bg-white">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-3xl font-bold">
                                Đặt lại mật khẩu
                            </CardTitle>
                            <CardDescription className="text-base">
                                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="*******"
                                            className="h-11 bg-white pr-10"
                                            disabled={resetLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={togglePasswordVisibility}
                                            disabled={resetLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} className="!h-5 !w-5 mr-2 text-gray-600" />
                                            ) : (
                                                <Eye size={20} className="!h-5 !w-5 mr-2 text-gray-600" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="*******"
                                            className="h-11 bg-white pr-10"
                                            disabled={resetLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={toggleConfirmPasswordVisibility}
                                            disabled={resetLoading}
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
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? (
                                        <span className="flex items-center justify-center">
                                            <ButtonLoader className="-ml-1 mr-3 h-5 w-5" />
                                            Đang đặt lại...
                                        </span>
                                    ) : (
                                        "Đặt lại mật khẩu"
                                    )}
                                </Button>
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

    // Render appropriate form based on state
    if (showResetForm) {
        return renderResetForm();
    } else if (showOTP) {
        return renderOTPForm();
    } else {
        return renderEmailForm();
    }
}