<?php

use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

Route::get('/preview-otp', function () {
    $otp = '123456';
    return view('emails.otp', compact('otp'));
});

Route::get('/test-mail', function () {
    $otp = rand(100000, 999999);

    Mail::send('emails.otp', ['otp' => $otp], function ($message) {
        $message->to('pedscott.dev@outlook.com')
                ->subject('Mã xác thực OTP');
    });

    return 'Đã gửi mail test (nếu không lỗi).';
});
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');


