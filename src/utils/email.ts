import nodemailer from 'nodemailer'
import { config } from 'dotenv'

config()

console.log('--- DEBUG SMTP ---')
console.log('Host:', process.env.SMTP_HOST)
console.log('User:', process.env.SMTP_USER)
console.log('Pass:', process.env.SMTP_PASS ? '***Đã có password***' : 'CHƯA CÓ PASSWORD')
// Đừng in hẳn password ra console để bảo mật
console.log('------------------')

// 1. Tạo Transporter (Bộ vận chuyển email)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true cho port 465, false cho các port khác (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// 2. Hàm gửi Verify Email
export const sendVerifyEmail = async (toAddress: string, subject: string, body: string) => {
  const fromAddress = process.env.SMTP_FROM_ADDRESS

  // Cấu hình nội dung mail
  const mailOptions = {
    from: fromAddress,
    to: toAddress,
    subject: subject,
    html: body
  }

  // Gửi mail
  return transporter.sendMail(mailOptions)
}

// 3. Hàm gửi Forgot Password Email
export const sendForgotPasswordEmail = async (toAddress: string, token: string) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`
  const fromAddress = process.env.SMTP_FROM_ADDRESS

  const subject = 'Yêu cầu đặt lại mật khẩu'
  const body = `
    <h1>Đặt lại mật khẩu</h1>
    <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
    <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
    <a href="${resetLink}" target="_blank" style="padding: 10px 20px; background-color: #dfb026; color: black; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
    <p>Link này sẽ hết hạn sau 1 giờ.</p>
    <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
  `

  const mailOptions = {
    from: fromAddress,
    to: toAddress,
    subject: subject,
    html: body
  }

  return transporter.sendMail(mailOptions)
}
