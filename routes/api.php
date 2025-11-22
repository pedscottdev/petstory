<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::post('auth/login', [AuthController::class, 'loginUser']);
Route::post('auth/admin-login', [AuthController::class, 'loginAdmin']);
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('auth/generate-otp', [AuthController::class, 'generateOTP']);
Route::post('auth/verify-otp', [AuthController::class, 'verifyOTP']);
Route::post('auth/confirm-password', [AuthController::class, 'confirmNewPassword']);
Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Pet CRUD routes