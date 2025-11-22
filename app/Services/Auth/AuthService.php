<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\OtpVerification;
use App\Models\PersonalAccessToken;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthService
{
    /**
     * Login user for user portal
     *
     * @param string $email
     * @param string $password
     * @return array
     * @throws ValidationException
     */
    public function loginUser(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        if ($user->role !== 'user') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn không có quyền truy cập vào trang này.'],
            ]);
        }

        // Login user vào session (Sanctum session-based auth)
        Auth::login($user);

        return [
            'user' => $user,
            'token' => null
        ];
    }

    /**
     * Login admin for admin portal
     *
     * @param string $email
     * @param string $password
     * @return array
     * @throws ValidationException
     */
    public function loginAdmin(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        if ($user->role !== 'admin') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn không có quyền truy cập vào trang này.'],
            ]);
        }

        // Login user vào session (Sanctum session-based auth)
        Auth::login($user);

        return [
            'user' => $user,
            'token' => null
        ];
    }

    /**
     * Register a new user (only creates user after OTP verification)
     *
     * @param array $data
     * @return User
     */
    public function register(array $data): User
    {
        // Check if OTP was verified for this email
        $verifiedOtp = OtpVerification::where('email', $data['email'])
            ->where('purpose', 'registration')
            ->whereNotNull('consumed_at')
            ->where('consumed_at', '>', Carbon::now()->subMinutes(10))
            ->first();

        if (!$verifiedOtp) {
            throw ValidationException::withMessages([
                'email' => ['OTP verification required before registration.'],
            ]);
        }

        $data['password'] = Hash::make($data['password']);
        $data['avatar_url'] = '/images/default-avatar.jpg';
        $data['role'] = 'user'; // Default role is user
        $data['is_active'] = true;
        
        return User::create($data);
    }

    /**
     * Logout user
     *
     * @param User $user
     * @return void
     */
    public function logout(User $user): void
    {
        // For session-based auth with Sanctum, we logout from session
        Auth::logout();
        // Also revoke all tokens for the user (if using API tokens)
        $user->tokens()->delete();
    }

    /**
     * Generate OTP for email verification or password reset
     *
     * @param string $email
     * @param string $purpose
     * @return array Contains OtpVerification and plain OTP
     */
    public function generateOTP(string $email, string $purpose): array
    {
        // Delete any existing OTP for this email and purpose
        OtpVerification::where('email', $email)
            ->where('purpose', $purpose)
            ->where('consumed_at', null)
            ->delete();

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Hash the OTP for storage
        $otpHash = Hash::make($otp);
        
        // Set expiration time (5 minutes)
        $expiresAt = Carbon::now()->addMinutes(5);

        // Create OTP verification record
        $otpVerification = OtpVerification::create([
            'email' => $email,
            'purpose' => $purpose,
            'channel' => 'email',
            'code_hash' => $otpHash,
            'attempts' => 0,
            'expires_at' => $expiresAt,
            'sent_to' => $email
        ]);

        return [
            'otpVerification' => $otpVerification,
            'otp' => $otp // Return plain OTP for email sending
        ];
    }

    /**
     * Verify OTP
     *
     * @param string $email
     * @param string $otp
     * @param string $purpose
     * @return bool
     * @throws ValidationException
     */
    public function verifyOTP(string $email, string $otp, string $purpose): bool
    {
        $otpVerification = OtpVerification::where('email', $email)
            ->where('purpose', $purpose)
            ->where('consumed_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otpVerification) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.'],
            ]);
        }

        // Check attempts
        if ($otpVerification->attempts >= 3) {
            throw ValidationException::withMessages([
                'otp' => ['Maximum attempts exceeded. Please request a new OTP.'],
            ]);
        }

        // Increment attempts
        $otpVerification->increment('attempts');

        // Verify OTP
        if (!Hash::check($otp, $otpVerification->code_hash)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP.'],
            ]);
        }

        // Mark as consumed
        $otpVerification->update([
            'consumed_at' => Carbon::now()
        ]);

        return true;
    }

    /**
     * Confirm and update user password after OTP verification
     *
     * @param string $email
     * @param string $newPassword
     * @return User
     */
    public function confirmNewPassword(string $email, string $newPassword): User
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($newPassword)
        ]);

        return $user;
    }
}