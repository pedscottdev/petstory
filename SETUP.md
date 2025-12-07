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

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Hoặc trên Windows:
copy .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Cấu hình Database (MongoDB)

Mở file `.env` và cập nhật các biến sau:

```env
# Database connection
DB_CONNECTION=mongodb
DB_URI=mongodb://localhost:27017
DB_DATABASE=petstory
```

### 5. Cấu hình Reverb (WebSocket)

Thêm các biến sau vào file `.env`:

```env
# Broadcasting với Reverb
BROADCAST_CONNECTION=reverb

# Reverb Config
REVERB_APP_ID=petstory
REVERB_APP_KEY=petstory-key
REVERB_APP_SECRET=petstory-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Reverb Server Config
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Vite (Frontend) Reverb Config
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### 6. Cấu hình Session & Cache

```env
# Session & Cache
SESSION_DRIVER=file
CACHE_STORE=file
```

> **Lưu ý:** Với MongoDB, session và cache nên dùng `file` thay vì `database`.

### 7. Seed Database (Dữ liệu mẫu)

```bash
php artisan db:seed
```

Lệnh này sẽ tạo:
- Người dùng mặc định (`DefaultUsersSeeder`)
- Nhóm (`GroupSeeder`)
- Dữ liệu mẫu mạng xã hội (`SocialSampleDataSeeder`)

---

## ▶️ Khởi chạy Ứng dụng

### Phương pháp 1: Chạy các service riêng lẻ (Khuyến nghị cho Development)

Mở **3 terminal** riêng biệt và chạy các lệnh sau:

#### Terminal 1 - Laravel Server (Backend API)
```bash
php artisan serve
```
> Server chạy tại: `http://localhost:8000`

#### Terminal 2 - Reverb Server (WebSocket)
```bash
php artisan reverb:start --debug
```
> WebSocket server chạy tại: `ws://localhost:8080`
>
> Flag `--debug` giúp xem log real-time

#### Terminal 3 - Vite Dev Server (Frontend)
```bash
npm run dev
```
> Frontend dev server chạy tại: `http://localhost:5173`

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
