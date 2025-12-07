## Mô tả nghiệp vụ
Cho phép Người dùng đã xác thực tìm kiếm thú cưng (không phải của bản thân) hoặc người dùng khác trên toàn hệ thống
- Người dùng nhập tên người dùng khác (role = 'user')  khác hoặc thú cưng muốn tìm kiếm
- Hệ thống trả về danh sách người dùng và thú cưng trên hệ thống tương thích

## HIển thị kết quả tìm kiếm
Dữ liệu kết quả tìm kiếm trả về bao gồm
- Thông tin người dùng: id, tên người dùng (fullname), avatar_url, email
- Thông tin thú cưng; id, tên thú cưng, avatar_url, giống thú cưng, id owner, fullname của owner

Khi người dùng bấm vào thú cưng hay người dùng trong kết quả thì sẽ điều hướng trang đến trang cá nhân của người dùng (trang cá nhân của owner thú cưng)

## Hiển thị giao diện tìm kiếm
- Khi người dùng mở giao diện tìm kiếm, hệ thống lấy 5 người dùng và 5 thú cưng ngẫu nhiên trong danh sách theo dõi và đang theo dõi của người dùng đăng nhập
- Khi người dùng nhập từ khóa tìm kiếm, hệ thống gọi api và hiển thị skeleton để thể hiện trang thái loading dữ liệu
- Khi không có kết quả tương ứng, hệ thống thể hiện trạng thái empty state (Không tìm thấy kết quả tương ứng) 