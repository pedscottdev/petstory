## Bảng điều khiển admin
- Bảng điều khiển hiển thị thông tin tổng quan hệ thống bao gồm
+ Thông tin tổng bài viết (số lượng bài viết, % tăng so với tháng trước)
+ Thông tin tổng người dùng (số lượng người dùng, % tăng so với tháng trước)
+ Lượt vi phạm mới (số lượng vi phạm trong tháng, % tăng/giảm so với tháng trước)
+ Người dùng mới trong tháng (% tăng so với tháng trước đó)

+ Top 5 người dùng có nhiều người theo dõi nhất
+ Top 5 thú cưng có nhiều lượt thích nhất

## Quản lý người dùng
Trang quản lý người dùng hiển thị danh sách người dùng trong hệ thống (trừ user role = 'admin')
Các chức năng:
Tìm kiếm theo tên
Lọc theo trạng thái (kích hoạt/vô hiệu)
Lọc theo ngày tham gia (từ ngày đến ngày)
Vô hiệu và kích hoạt người dùng 

Lưu ý: Người dùng sau khi vô hiệu không thể đăng nhập hệ thống. Khi đăng nhập bằng tài khoản vô hiệu sẽ hiển thị thông báo 'Tài khoản của bạn đã bị vô hiệu hóa'

## Quản lý bài viết
Trang quản lý bài viết hiển thị danh sách bài viết trong hệ thống
Các chức năng:
Tìm kiếm bài viết theo người đăng
Lọc theo trạng thái (đang bị chặn/hiển thị)
Chặn/bỏ chặn bài viết

Lưu ý: Bài viết bị chặn sẽ không hiển thị ở bất cứ đâu trên hệ thống

## Quản lý báo cáo
Trang quản lý báo cáo hiển thị danh sách thông tin báo cáo của người dùng hệ thống
Các chức năng:
Lọc theo trạng thái (Chờ xử lý/đã xử lý)
Xử lý báo cáo bài viết/người dùng: Mỗi báo cáo khi được tạo sẽ có trạng thái "Chờ xử lý", người dùng bấm nút xử lý trên báo cáo để chọn 1 trong 2 phương án (Xác nhận vi phạm và Xác nhận không vi phạm), khi xác nhận vi phạm thì bài viết/người dùng sẽ bị chặn và bài viết chuyển trạng thái "Đã xử lý", ngược lại nếu xác nhận không vi phạm thì bài viết/người dùng bỏ qua và báo cáo chuyển trạng thái "Đã xử lý" 
Xem chi tiết bài viết/người dùng: Quản trị bấm vào nút Xem để xem chi tiết bài viết hoặc người dùng, nếu xem bài viết, hệ thống sẽ hiển thị dialog chứa thông tin bài viết
Nếu xem chi tiết người dùng, hệ thống điều hướng hiển thị trang thông tin người dùng.