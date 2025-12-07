import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configure Pusher with Reverb settings
window.Pusher = Pusher;

/**
 * Laravel Echo - Real-time Communication
 * 
 * Cấu hình Echo cho việc broadcast tin nhắn real-time
 * qua Laravel Reverb và WebSocket
 */

const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

const getAuthToken = () => {
    return localStorage.getItem('auth_token') || '';
};

const echo = new Echo({
    broadcaster: 'reverb',
    
    key: import.meta.env.VITE_REVERB_APP_KEY,
    
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 6001,
    wssPort: import.meta.env.VITE_REVERB_PORT || 6001,
    
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    
    // ⚠️ QUAN TRỌNG: Phải là enabledTransports, không phải transports
    enabledTransports: ['ws', 'wss'],
    
    // ✅ FIX: Use the correct endpoint with api prefix
    authEndpoint: '/api/broadcasting/auth',
    
    // ⚠️ QUAN TRỌNG: Cấu hình auth headers cho Sanctum token-based auth
    auth: {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Accept': 'application/json',
        }
    },
    
    // ⚠️ QUAN TRỌNG: Cho phép gửi cookies (session) cho Sanctum
    withCredentials: true,
    
    enableLogging: import.meta.env.MODE === 'development',
    disableStats: true,
});

/**
 * Hàm kết nối tới private channel
 * 
 * @param {string} channelName - Tên channel (vd: 'chat.123')
 * @param {Function} onMessageReceived - Callback khi nhận tin nhắn
 * @returns {object} Channel object
 */
export const subscribeToChannel = (channelName, onMessageReceived) => {
    const channel = echo.private(channelName);
    
    channel.listen('.message.sent', (event) => {
        if (onMessageReceived) {
            onMessageReceived(event);
        }
    });
    
    return channel;
};

/**
 * Hàm nghe sự kiện "message.sent" trên channel
 * 
 * @param {string} conversationId - ID của conversation
 * @param {Function} callback - Callback khi nhận tin nhắn
 */
export const onMessageSent = (conversationId, callback) => {
    const channelName = `chat.${conversationId}`;
    return subscribeToChannel(channelName, callback);
};

/**
 * Hàm nghe sự kiện tạo conversation mới
 * 
 * @param {Function} callback - Callback khi tạo conversation
 */
export const onConversationCreated = (callback) => {
    if (!window.userId) {
        console.warn('userId is not set on window, cannot subscribe to user channel');
        return;
    }

    // Trùng với channel trong channels.php: App.Models.User.{id}
    echo.private(`App.Models.User.${window.userId}`)
        .listen('conversation.created', (event) => {
            if (callback) {
                callback(event);
            }
        });
};


/**
 * Hàm nghe sự kiện user thay đổi trạng thái online
 * 
 * @param {Function} callback - Callback khi user thay đổi trạng thái
 */
export const onUserOnlineStatusChanged = (callback) => {
    echo.channel('users-status').listen('user.online-status-changed', (event) => {
        if (callback) {
            callback(event);
        }
    });
};

/**
 * Hàm unsubscribe từ channel users-status
 */
export const unsubscribeFromUsersStatus = () => {
    echo.leaveChannel('users-status');
};

/**
 * Hàm hủy subscription
 * 
 * @param {string} channelName - Tên channel cần hủy
 */
export const unsubscribeFromChannel = (channelName) => {
    echo.leaveChannel(channelName);
};

/**
 * Hàm cập nhật auth token khi user đăng nhập
 * 
 * @param {string} token - Auth token (Sanctum)
 */
export const updateAuthToken = (token) => {
    if (token) {
        localStorage.setItem('auth_token', token);
    }
    if (echo.options && echo.options.auth) {
        echo.options.auth.headers['Authorization'] = `Bearer ${getAuthToken()}`;
        echo.options.auth.headers['X-CSRF-TOKEN'] = getCsrfToken();
    }
};

/**
 * Hàm xóa auth token khi user đăng xuất
 */
export const clearAuthToken = () => {
    localStorage.removeItem('auth_token');
    if (echo.options.auth) {
        echo.options.auth.headers['Authorization'] = `Bearer `;
    }
};

/**
 * Hàm disconnect Echo
 */
export const disconnectEcho = () => {
    echo.disconnect();
};

/**
 * Hàm reconnect Echo
 */
export const reconnectEcho = () => {
    echo.connect();
};

/**
 * Export Echo instance để dùng trực tiếp nếu cần
 */
export default echo;
