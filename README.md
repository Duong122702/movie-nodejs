# 🎬 Movie API - Backend Service

Hệ thống RESTful API quản lý và cung cấp dữ liệu phim ảnh (Movies, Seasons, Episodes, Ratings, Comments, Favorites, Analytics) được xây dựng bằng **Node.js**, **Express**, **TypeScript** và **MongoDB**.

---

## 📌 Tính năng chính

- 🔐 **Xác thực & Người dùng (Authentication & Authorization):**
  - Đăng ký, đăng nhập, đăng xuất.
  - Xác thực qua JWT (Access Token & Refresh Token).
  - Quản lý thông tin cá nhân, gửi email kích hoạt tài khoản / đặt lại mật khẩu.
  - Phân quyền người dùng, quản trị viên.

- 🎥 **Quản lý Phim & Tập phim (Movies, Seasons & Episodes):**
  - Quản lý phim lẻ, phim bộ theo danh mục, thể loại, trạng thái.
  - Quản lý danh sách mùa phim (Seasons) và tập phim (Episodes).

- ⭐ **Đánh giá & Xếp hạng (Ratings):**
  - Chấm điểm và đánh giá phim.
  - Tính toán điểm đánh giá trung bình.

- 💬 **Bình luận & Tương tác (Comments & Reactions):**
  - Bình luận trên từng phim / tập phim.
  - Thả cảm xúc / reaction vào bình luận.

- ❤️ **Yêu thích / Danh sách xem (Favorites):**
  - Thêm, xóa và xem danh sách phim yêu thích của từng người dùng.

- 📊 **Thống kê (Analytics):**
  - Thống kê lượt xem, tương tác và dữ liệu tổng hợp.

- 🛡️ **Bảo mật & Chuẩn hóa dữ liệu:**
  - Middleware xử lý lỗi tập trung (Error Handling).
  - Validate request chặt chẽ.
  - Blacklist token khi logout.

---

## 🛠️ Công nghệ sử dụng

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Cơ sở dữ liệu:** [MongoDB](https://www.mongodb.com/)
- **Linter & Code Formatter:** [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
- **Công cụ dev:** [Nodemon](https://nodemon.io/), `ts-node`

---

## 📂 Cấu trúc thư mục

```text
movie-nodejs/
├── src/
│   ├── constants/            # Các hằng số, enum, mã HTTP, thông báo lỗi/regex
│   │   ├── blacklist.ts
│   │   ├── enums.ts
│   │   ├── httpStatus.ts
│   │   ├── messages.ts
│   │   └── regex.ts
│   ├── controllers/          # Tầng xử lý logic request/response
│   │   ├── analytics.controller.ts
│   │   ├── comments.controller.ts
│   │   ├── episodes.controller.ts
│   │   ├── favorites.controller.ts
│   │   ├── movies.controller.ts
│   │   ├── ratings.controller.ts
│   │   ├── seasons.controller.ts
│   │   └── users.controller.ts
│   ├── middlewares/          # Các middleware xác thực, phân quyền, validate & error handler
│   │   ├── comments.middleware.ts
│   │   ├── common.middlewares.ts
│   │   ├── error.middlewares.ts
│   │   ├── favorites.middleware.ts
│   │   ├── movies.middlewares.ts
│   │   ├── ratings.middleware.ts
│   │   └── users.middlewares.ts
│   ├── models/
│   │   ├── requests/         # Type/Interface định nghĩa dữ liệu Request
│   │   └── schemas/          # Data schema / Collection models
│   ├── routes/               # Khai báo các endpoint API
│   │   ├── analytics.routes.ts
│   │   ├── comments.routes.ts
│   │   ├── favorites.routes.ts
│   │   ├── movies.routes.ts
│   │   ├── ratings.routes.ts
│   │   └── users.routes.ts
│   ├── services/             # Tầng nghiệp vụ xử lý logic và làm việc với Database
│   │   ├── analytics.services.ts
│   │   ├── comments.services.ts
│   │   ├── database.services.ts
│   │   ├── episodes.services.ts
│   │   ├── favorites.services.ts
│   │   ├── movies.services.ts
│   │   ├── ratings.services.ts
│   │   ├── seasons.services.ts
│   │   └── users.services.ts
│   ├── utils/                # Các hàm tiện ích (JWT, Crypto, Validation, Email, Error Wrapper)
│   │   ├── Errors.ts
│   │   ├── crypto.utils.ts
│   │   ├── email.ts
│   │   ├── handlers.ts
│   │   ├── jwt.ts
│   │   └── validate.ts
│   ├── type.d.ts             # Type override & mở rộng
│   └── index.ts              # File khởi chạy ứng dụng
├── .editorconfig
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nodemon.json
├── package.json
├── tsconfig.json
└── yarn.lock
```
## Hướng dẫn cài đặt & Chạy dự án
### 1. Yêu cầu môi trường
* Node.js >= 18.x
* MongoDB (Local instance hoặc MongoDB Atlas)
* Quản lý gói: Yarn hoặc NPM
### 2. Cài đặt dependencies
```bash
# Sử dụng Yarn
yarn install

# Hoặc sử dụng NPM
npm install
```
### 3. Cấu hình biến môi trường (.env)
Tạo file .env tại thư mục gốc của dự án và điền các cấu hình cần thiết:
```plaintext
# Server Config
PORT=4000
HOST=localhost

# Database Config
DB_URI=mongodb://localhost:27017
DB_NAME=movie_db

# JWT Secrets & Expiration
JWT_SECRET_ACCESS_TOKEN=your_access_token_secret
JWT_SECRET_REFRESH_TOKEN=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=100d

# Email Service Config (Nodemailer / AWS SES / v.v.)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
```
### 4. Chạy ứng dụng
Chế độ phát triển (Development):
```bash
# Sử dụng Yarn
yarn dev

# Hoặc sử dụng NPM
npm run dev
```
Biên dịch và chạy trên môi trường Production:
```bash
# Build TypeScript sang JavaScript
yarn build # hoặc npm run build

# Khởi chạy server đã build
yarn start # hoặc npm start
```
## 📡 Danh sách Routes chính
| Prefix Route | Chức năng |
| :--- | :--- |
| `/users` | Đăng ký, đăng nhập, quên mật khẩu, cập nhật hồ sơ, quản lý token |
| `/movies` | Quản lý phim, danh sách mùa (Seasons), tập phim (Episodes) |
| `/ratings` | Đánh giá, xếp hạng điểm phim |
| `/comments` | Bình luận, phản hồi và thả cảm xúc (Reactions) |
| `/favorites` | Quản lý danh sách phim yêu thích của người dùng |
| `/analytics` | Thống kê số liệu, lượt xem và hiệu suất |
## 📝 Code Style & Format
```bash
# Kiểm tra lỗi cú pháp bằng ESLint
yarn lint

# Format code tự động bằng Prettier
yarn format
```
## 📄 License
Dự án được phân phối dưới giấy phép MIT.
