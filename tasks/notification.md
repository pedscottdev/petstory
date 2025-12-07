## Mô tả nghiệp vụ chức năng:
Cho phép Người dùng đã xác thực xem danh sách thông báo (notification) do hệ thống gửi đến theo thời gian thực.
Thông báo được tạo ra khi có hoạt động liên quan đến người dùng, chẳng hạn như:
•	Người dùng khác thích bài viết của họ.
- Người dùng khác bình luận bài viết của họ
•	Người dùng khác bắt đầu theo dõi họ.
•	Người dùng khác thích thú cưng của họ.

Người dùng có thể xem danh sách thông báo mới, xem số lượng thông báo mới, bấm vào thông báo để đánh dấu đã đọc hoặc bấm "đánh dấu tất cả là đã đọc" để đánh dấu đã đọc tất cả thông báo chưa đọc.

## Loại thông báo và thông tin hiển thị
Mỗi thông báo sẽ chứa avatar người kích hoạt, icon loại thông báo, nội dung thông báo và thời gian thông báo. 
Có 4 loại thông báo dựa trên hành động kích hoạt tương ứng, mỗi loại thông báo sẽ hiển thị thông tin khác nhau:

1/ Thông báo lượt thích bài viết
Kích hoạt khi có người dùng thích bài viết của bạn.
Nội dung: [Người dùng A] đã thích bài viết [6 chữ đầu của nội dung bài viết + '...']. 

2/ Thông báo lượt bình luận
Kích hoạt khi có người dùng bình luận bài viết.
Nội dung: [Người dùng A]  đã bình luận bài viết [6 chữ đầu của nội dung bài viết + '...']. 

3/ Thông báo lượt theo dõi
Kích hoạt khi có người dùng theo dõi bạn
Nội dung: [Người dùng A] đã bắt đầu theo dõi bạn.

4/ Thông báo lượt thích thú cưng 
Nội dung: [Người dùng A] đã thích thú cưng [Tên thú cưng của bạn].

## Hiển thị số lượng thông báo đã gửi và đánh dấu đã nhận
- Số lượng thông báo đã gửi từ hệ thống sẽ được hiển thị tại icon chuông thông báo (header.jsx)
- Khi người dùng bấm vào biểu tượng chuông, hệ thống đánh dấu các thông báo đó là người dùng đã nhận

## Hiển thị danh sách thông báo
- Khi người dùng bấm vào biểu tượng icon chuông thông báo (header.jsx) mở cửa sổ thông báo, hệ thống tải 5 thông báo mới nhất trước và hiển thị nút "Xem thêm thông báo"
- "Khi người dùng bấm "Xem thêm thông báo", hệ thống tiếp tục tải 5 thông báo cũ hơn và khi người dùng kéo đến cuối, hệ thống tự động lazy loading thêm 5 thông báo (tiếp tục cho đến khi load hết thông báo).

## Đánh dấu thông báo đã đọc
- Thông báo đã nhận nhưng chưa đọc sẽ được đánh dấu trong danh sách thông báo, người dùng click vào thông báo để đánh dấu đã đọc cho thông báo đó
- Người dùng có thể bấm "Đánh dấu tất cả là đã đọc" để đánh dấu tất cả những thông báo chưa đọc thành đã đọc 