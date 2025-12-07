## Task 1: Chức năng thích/hủy thích bài viết
- Người dùng bấm like/unlike button để thích hoặc huỷ thích bài viết
- Sau khi bấm thích/hủy thích, nút sẽ bị disabled đến khi api phản hồi
- Hệ thống sẽ cập nhật số lượt like/unlike của bài viết và hiển thị toast thông báo phản hồi thành công hoặc thất bại

## Task 2: Chức năng chỉnh sửa bài viết (của bản thân)
- Người dùng bấm vào lựa chọn "Chỉnh sửa bài viết" trong dropdown menu để sửa bài viết
- Thông tin được chỉnh sửa là nội dung bài viết
- Hệ thống sẽ cập nhật nội dung bài viết và hiển thị toast thông báo phản hồi thành công hoặc thất bại
- Lưu ý: lựa chọn "Chỉnh sửa bài viết" chỉ hiển thị với chủ bài viết

## Task 3: Chức năng báo cáo bài viết (của người dùng khác)
- Người dùng bấm vào lựa chọn "Báo cáo bài viết" trong dropdown menu để báo cáo bài viết
- Hệ thống sẽ hiển thị form báo cáo và người dùng có thể chọn lý do báo cáo
- Hệ thống sẽ lưu trữ thông tin báo cáo và hiển thị toast thông báo phản hồi thành công hoặc thất bại
- Lưu ý: lựa chọn "Báo cáo bài viết" chỉ hiển thị với bài viết của người dùng khác

## Task 4: Chức năng xoá bài viết (của bản thân)
- Người dùng bấm vào lựa chọn "Xoá bài viết" trong dropdown menu để xoá bài viết
- Hệ thống sẽ hiển thị alert dialog để yêu cầu xác nhận từ người dùng
- Nếu người dùng bấm "Xác nhận", bài viết sẽ được xoá và hệ thống cập nhật danh sách bài viết
- Nếu người dùng bấm "Hủy", confirm dialog sẽ đóng và không có thay đổi nào
- Lưu ý: lựa chọn "Xoá bài viết" chỉ hiển thị với chủ bài viết

## Task 5: Chức năng bình luận bài viết
- Người dùng có thể nhập nội dung bình luận vào input bình luận ở dưới mỗi bài viết và bấm "Gửi" để gửi bình luận
- Hệ thống sẽ cập nhật danh sách bình luận, số lượng bình luận và hiển thị toast thông báo phản hồi thành công hoặc thất bại
- Người dùng có thể phản hồi bình luận của một người dùng khác bằng cách bấm phản hồi ở dưới mỗi bình luận
- Hệ thống hiển thị input phản hồi bình luận để người dùng nhập nội dung phản hồi và bấm "Gửi"
- Hệ thống sẽ cập nhật danh sách bình luận và hiển thị toast thông báo phản hồi thành công hoặc thất bại
- Lưu ý: Chỉ có tối đa 1 cấp phản hồi, tất cả các phản hồi sẽ được hiển thị chung 1 cấp và hiển thị theo thứ tự thời gian, cũ nhất lên trước

## Task 6: Xóa bình luận của bản thân
- Người dùng có thể xóa bình luận của bản thân bằng cách bấm vào lựa chọn "Xóa" bên dưới mỗi bình luận
- Hệ thống sẽ hiển thị alert dialog để yêu cầu xác nhận từ người dùng
- Nếu người dùng bấm "Xác nhận", bình luận sẽ được xóa và hệ thống cập nhật danh sách bình luận
- Nếu người dùng bấm "Hủy", confirm dialog sẽ đóng và không có thay đổi nào
- Lưu ý: lựa chọn "Xóa" chỉ hiển thị với người dùng là chủ bình luận
