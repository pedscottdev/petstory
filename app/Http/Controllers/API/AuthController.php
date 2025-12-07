<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\OtpVerification;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * User login
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function loginUser(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông tin đăng nhập không hợp lệ.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = $this->authService->loginUser(
                $request->email,
                $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập người dùng thành công',
                'data' => [
                    'user' => $result['user'],
                    'token' => $result['token']
                ]
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không đúng.',
                'errors' => $e->errors()
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống, vui lòng thử lại sau.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin login
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function loginAdmin(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông tin đăng nhập không hợp lệ.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = $this->authService->loginAdmin(
                $request->email,
                $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập quản trị viên thành công',
                'data' => [
                    'user' => $result['user'],
                    'token' => $result['token']
                ]
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thông tin đăng nhập không đúng',
                'errors' => $e->errors()
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống, vui lòng thử lại sau.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register a new user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'bio' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông tin đăng ký không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $this->authService->register($request->only([
                'email',
                'password',
                'first_name',
                'last_name',
                'bio'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký tài khoản thành công',
                'data' => $user
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đăng ký thất bại',
                'errors' => $e->errors()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống, vui lòng thử lại sau.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Always try to logout regardless of errors
            $this->authService->logout($user ?? new User());
            
            // Regenerate session ID for security (only if session exists)
            // When using Sanctum token auth, there's no session
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json([
                'success' => true,
                'message' => 'Đăng xuất thành công!'
            ], 200);
        } catch (\Exception $e) {
            // Even if there's an error in the logout process, we still want to ensure
            // the frontend can clear the user state and redirect to login
            Log::error('Logout API error: ' . $e->getMessage());
            
            // Still clear session data manually as a fallback
            if ($request->hasSession()) {
                $request->session()->flush();
            }
            
            // Return success to frontend so user can be redirected to login
            return response()->json([
                'success' => true,
                'message' => 'Đăng xuất thành công!'
            ], 200);
        }
    }

    /**
     * Generate OTP for email verification or password reset
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generateOTP(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'purpose' => 'required|in:registration,password_reset'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông tin không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            // For registration, check if email already exists
            if ($request->purpose === 'registration') {
                $existingUser = User::where('email', $request->email)->first();
                if ($existingUser) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email đã được sử dụng',
                        'errors' => ['email' => ['Email này đã được đăng ký']]
                    ], 422);
                }
            }

            // For password reset, check if email exists
            if ($request->purpose === 'password_reset') {
                $user = User::where('email', $request->email)->first();
                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email không tồn tại',
                        'errors' => ['email' => ['Email này chưa được đăng ký']]
                    ], 422);
                }
            }

            $result = $this->authService->generateOTP(
                $request->email,
                $request->purpose
            );

            // Send OTP via email
            Mail::to($request->email)->send(new SendOtpMail($result['otp']));

            return response()->json([
                'success' => true,
                'message' => 'Mã OTP đã được gửi đến email của bạn',
                'data' => [
                    'email' => $result['otpVerification']->email,
                    'purpose' => $result['otpVerification']->purpose,
                    'expires_at' => $result['otpVerification']->expires_at
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi gửi OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verifyOTP(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'otp' => 'required|string|size:6',
                'purpose' => 'required|in:registration,password_reset'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông tin không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $isValid = $this->authService->verifyOTP(
                $request->email,
                $request->otp,
                $request->purpose
            );

            if ($isValid) {
                return response()->json([
                    'success' => true,
                    'message' => 'Xác thực OTP thành công'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Xác thực OTP thất bại'
            ], 400);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mã OTP không chính xác',
                'errors' => $e->errors()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xác thực OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ], 200);
    }

    /**
     * Confirm and update password after OTP verification
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirmNewPassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:8|confirmed'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông tin không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $this->authService->confirmNewPassword(
                $request->email,
                $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật mật khẩu thành công',
                'data' => $user
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật mật khẩu thất bại',
                'errors' => $e->errors()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật mật khẩu',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}