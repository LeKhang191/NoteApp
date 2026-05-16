# 📝 NoteApp
Một ứng dụng ghi chú hiện đại, tối giản và hiệu quả được xây dựng với ReactJS. Ứng dụng cho phép người dùng tạo, quản lý ghi chú kèm hình ảnh và tự động lưu trữ dữ liệu trực tiếp trên trình duyệt.

## ✨ Tính năng nổi bật
Quản lý ghi chú: Tạo, chỉnh sửa và xóa ghi chú dễ dàng.

Đính kèm hình ảnh: Sử dụng FileReader API để tải ảnh trực tiếp vào ghi chú.

Tự động lưu (Auto-save): Tích hợp LocalStorage API giúp dữ liệu không bị mất khi tải lại trang.

Tìm kiếm & Bộ lọc: Tìm kiếm ghi chú nhanh chóng và sắp xếp theo thời gian hoặc danh mục bằng các Array Methods tối ưu.

Giao diện Responsive: Thiết kế tinh tế với Tailwind CSS, hiển thị tốt trên mọi thiết kế màn hình.

Icon sắc nét: Sử dụng bộ thư viện Lucide React.

## 🛠️ Công nghệ sử dụng
Frontend Core
JavaScript (ReactJS): Thư viện chính để xây dựng giao diện người dùng.

HTML5 & CSS3: Cấu trúc và phong cách nền tảng.

Tailwind CSS: Framework tiện ích để thiết kế UI nhanh chóng.

Lucide React: Cung cấp hệ thống icon hiện đại.

Xử lý dữ liệu & Logic
LocalStorage API: Quản lý lưu trữ dữ liệu tạm thời dưới máy khách (Client-side).

FileReader API: Xử lý và đọc tệp hình ảnh được tải lên từ người dùng.

Array Methods: Sử dụng triệt để map(), filter(), sort() để quản lý danh sách ghi chú mượt mà.

Môi trường phát triển
Vite: Công cụ build nhanh chóng cho các ứng dụng Frontend hiện đại.

Browser DevTools: Sử dụng để kiểm tra hiệu năng và debug logic.

Hệ điều hành hỗ trợ: Phát triển và tối ưu trên ArchLinux và Windows.

## 🚀 Cài đặt và Chạy thử
Để chạy dự án này ở môi trường local, hãy làm theo các bước sau:

Clone repository:

git clone https://github.com/LeKhang191/NoteApp.git

cd NoteApp

Cài đặt các thư viện phụ thuộc:

npm install
hoặc
yarn install

Chạy ứng dụng trong môi trường phát triển:

npm run dev
hoặc
yarn dev

Mở trình duyệt:
Truy cập đường dẫn http://localhost:5173 (hoặc cổng mặc định của Vite).

## 📂 Cấu trúc thư mục (Tham khảo)
Plaintext
src/
- components/     # Các thành phần giao diện tái sử dụng
- hooks/          # Custom hooks (nếu có) cho LocalStorage
- assets/         # Hình ảnh và icons
- App.jsx         # Logic chính của ứng dụng
- main.jsx        # Điểm đầu vào của dự án
