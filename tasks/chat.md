## Task 1: Tạo cuộc trò chuyện mới
- Người dùng bấm vào button để tạo cuộc trò chuyện mới
- Dialog hiển thị danh sách 7 người dùng ngẫu nhiên trong danh sách người theo dõi và đang theo dõi của người dùng
- Người dùng có thể tìm kiếm người dùng bất kỳ trên hệ thống bằng cách nhập tên vào thanh tìm kiếm
- Người dùng chọn 1 người dùng cần trò chuyện để tạo cuộc trò chuyện và bấm "Nhắn tin"
- Hệ thống hiển thị giao diện cuộc hội thoại chi tiết và thêm id người dùng vào url (Giả sử url là /chats/ id là 1234 thì khi mở giao diện cuộc hội thoại chi tiết url sẽ thành /chats/1234)
- Kể từ lúc người dùng gửi tin nhắn đầu tiên thì cuộc trò chuyện được tạo
- Sử dụng skeleton minh họa load dữ liệu

## Task 2: Xem cuộc trò chuyện
- Khi truy cập trang nhắn tin, hệ thống sẽ load danh sách cuộc trò chuyện và hiển thị danh sách các cuộc trò chuyện đã tạo bao gồm Tên cuộc trò chuyện, tin nhắn mới nhất, thời gian gửi, số lượng tin chưa đọc
- Người dùng có thể tìm kiếm cuộc trò chuyện bằng cách gõ tên
- Người dùng bấm vào cuộc trò chuyện bất kỳ để xem chi tiết cuộc trò chuyện
- Sử dụng Skeleton để minh họa trạng thái load dữ liệu danh sách cuộc trò chuyện

## Task 3: Gửi tin nhắn
- Sau khi truy cập trang chi tiết cuộc trò chuyện, người dùng nhập nội dung tin nhắn và bấm gửi để gửi tin
- Người dùng có thể đính kèm ảnh cùng tin nhắn bằng cách tải lên ảnh (chỉ tải lên được 1 ảnh đính kèm)
- Ảnh đính kèm sẽ được lưu trữ tại storage/uploads/chats/id/

## Task 4: Hiển thị số lượng tin chưa đọc trên header
- Giao diện header hiển thị số lượng tin nhắn đến chưa đọc trên giao diện (qua label)
- Label sẽ mất khi người dùng bấm vào trang tin nhắn