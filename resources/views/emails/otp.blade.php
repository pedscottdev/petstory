<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mã OTP</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5;">
    
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 40px; background-color: #ffffff; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{ $message->embed(public_path('images/app-logo.svg')) }}" alt="App Logo" style="height: 50px; width: auto;">
        </div>

        <div style="color: #333333; font-size: 16px; line-height: 1.6;">
            <p style="margin-bottom: 10px;">Xin chào,</p>
            <p style="margin-top: 0;">Mã xác thực (OTP) của bạn là:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; color: #dc2626; font-size: 32px; font-weight: 700; letter-spacing: 5px; padding: 10px 20px; border: 2px dashed #fecaca; border-radius: 8px; background-color: #fef2f2;">
                    {{ $otp }}
                </span>
            </div>

            <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; width: 100%;text-align: center;">
                © 2025 PEDROLAB. All rights reserved.
            </p>
        </div>
    </div>

</body>
</html>