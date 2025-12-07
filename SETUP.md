# 🐾 PetStory - Hướng dẫn Cài đặt & Khởi chạy

> Ứng dụng Laravel 12 + React + MongoDB với real-time WebSocket (Reverb)

## 📋 Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|----------|---------------------|
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |
| MongoDB | 6.0+ |

---

## 🚀 Cài đặt

Link tải laragon: https://io.bikegremlin.com/35435/laragon-6-php-8-4-install/
Link tải php 8.3.4: https://1drv.ms/f/c/9cb0cc208e25f479/Eo3gNSnAAyNJuIUVGw2heKgBFazasuXr2XeIKHPnVtHl6Q

### 1. Clone Repository
```bash
git clone <repository-url>
cd petstory
```

### 2. Cài đặt Dependencies

```bash
# Cài đặt PHP dependencies
composer install

# Cài đặt Node.js dependencies
npm install
```

### 3. Cấu hình Environment

Tải file .env từ folder ENV trên drive và paste vào source 
https://1drv.ms/f/c/9cb0cc208e25f479/Eo3gNSnAAyNJuIUVGw2heKgBFazasuXr2XeIKHPnVtHl6Q

---

Tải về thư mục "uploads" trên drive https://1drv.ms/f/c/9cb0cc208e25f479/Eo3gNSnAAyNJuIUVGw2heKgBFazasuXr2XeIKHPnVtHl6Q và sao chép vào thư mục C:\laragon\www\petstory\public\storage

Nếu đã có thư mục uploads thì xóa bỏ thư mục đang tồn tại và thay bằng thư mục vừa tải xuống trên drive
```
```
### 4. Cấu hình Database (MongoDB)

Tải extention "MongoDB" cho VS Code
Connect bằng URL: mongodb+srv://admin:SECRET1q2w3e@petstory.wn1tugg.mongodb.net/
Nếu không connect được, truy cập https://www.whatismyip.com/, lấy địa chỉ IPv4 của máy
và liên hệ với Pedro để đăng ký IP.


### 4. Cấu hình hệ thống

#### Link Storage (để up ảnh)
```laragon terminal
php artisan storage:link
```
> WebSocket server chạy tại: `ws://localhost:8080`
>
> Flag `--debug` giúp xem log real-time

#### Build hệ thống
```bash
npm run build
```
---

## ▶️ Khởi chạy Ứng dụng


Mở **3 terminal** riêng biệt và chạy các lệnh sau:

```
#### Terminal 1 - Laravel Server (Backend API)
```laragon terminal
php artisan serve
```
> Server chạy tại: `http://localhost:8000`

#### Terminal 2 - Reverb Server (WebSocket)
```laragon terminal
php artisan reverb:start --debug
```
> WebSocket server chạy tại: `ws://localhost:8080`
>
> Flag `--debug` giúp xem log real-time

#### Terminal 3 - Vite Dev Server (Frontend)
```bash
npm run dev
```

Truy cập ứng dụng tại: http://localhost:8000

---

## 🌐 Truy cập Ứng dụng

| Service | URL |
|---------|-----|
| **Frontend (Vite HMR)** | http://localhost:5173 |
| **Backend API** | http://localhost:8000/api |
| **WebSocket (Reverb)** | ws://localhost:8080 |

---

## 📁 Cấu trúc Project

```
petstory/
├── app/                    # Laravel Application (Controllers, Models, Services)
├── config/                 # Laravel Configuration
├── database/
│   └── seeders/           # Database Seeders
├── public/                 # Public assets & index.php
├── resources/
│   ├── css/               # CSS Styles
│   └── js/                # React Application
│       ├── components/    # React Components
│       ├── layouts/       # Layout Components
│       ├── pages/         # Page Components
│       │   ├── admin/     # Admin Pages
│       │   └── user/      # User Pages
│       └── utils/         # Utility Functions
├── routes/                 # Laravel Routes
└── storage/               # Storage (logs, uploads)
```

---

## 🔧 Các lệnh hữu ích

```bash
# Xóa cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Build production
npm run build

# Chạy tests
php artisan test

# Xem logs
php artisan pail
```

---

## ❓ Xử lý lỗi thường gặp

### 1. Lỗi kết nối MongoDB
```
MongoDB connection refused
```
**Giải pháp:** Đảm bảo MongoDB đang chạy:
```bash
# Windows (Laragon)
Bật MongoDB trong Laragon menu

# Linux/Mac
sudo systemctl start mongod
```

### 2. Lỗi WebSocket không kết nối
```
WebSocket connection failed
```
**Giải pháp:**
- Kiểm tra Reverb đang chạy: `php artisan reverb:start`
- Kiểm tra port 8080 không bị chiếm
- Đảm bảo `VITE_REVERB_*` variables đúng trong `.env`

### 3. Lỗi CORS khi gọi API
**Giải pháp:** Truy cập frontend qua `http://localhost:5173` (Vite proxy)

### 4. Lỗi 419 CSRF Token
**Giải pháp:** Clear browser storage và thử đăng nhập lại

---

**Happy Coding! 🚀**
