<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\OtpVerification;
use App\Models\PersonalAccessToken;
use App\Events\UserOnlineStatusChanged;
use App\Traits\TracksUserOnlineStatus;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

        // Check if user account is active
        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị vô hiệu hóa.'],
            ]);
        }

        // IMPORTANT: Invalidate any existing session and regenerate before login
        // This prevents session fixation attacks and ensures clean session for new user
        if (session()->isStarted()) {
            session()->invalidate();
            session()->regenerate();
        }

        // NOTE: We don't revoke existing tokens here to allow dual admin/user sessions
        // Each portal (admin/user) has its own token stored separately in localStorage

        // Login user vào session (Sanctum session-based auth)
        Auth::login($user);

        // Regenerate session after login for security
        if (session()->isStarted()) {
            session()->regenerate();
        }

        // Tạo token cho broadcasting authentication
        // Token này sẽ được sử dụng bởi Echo.js để authenticate với private channels
        $token = $user->createToken('broadcasting_token')->plainTextToken;

        // Broadcast user online status
        TracksUserOnlineStatus::markUserOnline($user->id);
        event(new UserOnlineStatusChanged($user, true));

        return [
            'user' => $user,
            'token' => $token
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

        // IMPORTANT: Invalidate any existing session and regenerate before login
        // This prevents session fixation attacks and ensures clean session for new user
        if (session()->isStarted()) {
            session()->invalidate();
            session()->regenerate();
        }

        // NOTE: We don't revoke existing tokens here to allow dual admin/user sessions
        // Each portal (admin/user) has its own token stored separately in localStorage

        // Login user vào session (Sanctum session-based auth)
        Auth::login($user);

        // Regenerate session after login for security
        if (session()->isStarted()) {
            session()->regenerate();
        }

        // Tạo token cho broadcasting authentication
        // Token này sẽ được sử dụng bởi Echo.js để authenticate với private channels
        $token = $user->createToken('broadcasting_token')->plainTextToken;

        // Broadcast user online status
        TracksUserOnlineStatus::markUserOnline($user->id);
        event(new UserOnlineStatusChanged($user, true));

        return [
            'user' => $user,
            'token' => $token
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
     * Logout user (from user portal)
     *
     * @param User $user
     * @param string|null $tokenId - The current token ID to revoke
     * @return void
     */
    public function logoutUser(User $user, ?string $tokenId = null): void
    {
        try {
            // Broadcast user offline status before logout
            if ($user && $user->id) {
                TracksUserOnlineStatus::markUserOffline($user->id);
                event(new UserOnlineStatusChanged($user, false));
            }
            
            // IMPORTANT: Do NOT invalidate session or call Auth::logout()
            // This would destroy the shared session and log out admin as well
            // Instead, we only revoke the current token
            
            // Only revoke the current token, not all tokens
            // This allows admin session to remain active
            if ($user && $tokenId) {
                $user->tokens()->where('id', $tokenId)->delete();
            } elseif ($user && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }
        } catch (\Exception $e) {
            Log::error('User logout error: ' . $e->getMessage());
        }
    }

    /**
     * Logout admin (from admin portal)
     *
     * @param User $user
     * @param string|null $tokenId - The current token ID to revoke
     * @return void
     */
    public function logoutAdmin(User $user, ?string $tokenId = null): void
    {
        try {
            // Broadcast user offline status before logout
            if ($user && $user->id) {
                TracksUserOnlineStatus::markUserOffline($user->id);
                event(new UserOnlineStatusChanged($user, false));
            }
            
            // IMPORTANT: Do NOT invalidate session or call Auth::logout()
            // This would destroy the shared session and log out user as well
            // Instead, we only revoke the current token
            
            // Only revoke the current token, not all tokens
            // This allows user session to remain active
            if ($user && $tokenId) {
                $user->tokens()->where('id', $tokenId)->delete();
            } elseif ($user && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }
        } catch (\Exception $e) {
            Log::error('Admin logout error: ' . $e->getMessage());
        }
    }

    /**
     * Logout user (legacy - for backward compatibility)
     * @deprecated Use logoutUser or logoutAdmin instead
     *
     * @param User $user
     * @return void
     */
    public function logout(User $user): void
    {
        // Determine role and call appropriate method
        if ($user && $user->role === 'admin') {
            $this->logoutAdmin($user);
        } else {
            $this->logoutUser($user);
        }
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