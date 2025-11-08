import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import { ENV } from './env.js'
import { socketAuthMiddleWare } from '../middleware/socket.middleware.js'

const app = express()
const server = http.createServer(app)

//Tạo Socket.IO server và bật CORS
// Socket.IO không chạy trực tiếp trên Express
// ✅ Nó cần 1 server HTTP làm “cơ sở” để gắn vào
// ✔ Ở đây bạn tạo server bằng http.createServer(app) để Socket.IO có thể sử dụng.
const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true
  }
})

// Áp dụng socketAuthMiddleware
// Lấy JWT từ cookie
// ✅ verify JWT
// ✅ Tìm user trong DB
// ✅ Nếu hợp lệ → cho phép kết nối
// ✅ Nếu sai → chặn socket
// apply authentication middleware for all socket connections
io.use(socketAuthMiddleWare)

// Danh sách user online
// this is for storing online users
const userSocketMap = {} // userId: socketId

// Sự kiện connection
io.on('connection', (socket) => {
  console.log('A user connected', socket.user.fullName)

  // . Lưu socketId của user
  const userId = socket.userId
  userSocketMap[userId] = socket.id

  // Gửi danh sách user online cho tất cả client
  // io.emit() is used to send events to all connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap))

  //Khi user tắt tab → socket disconnect
  // 👉 userSocketMap vẫn giữ user online → SAI
  socket.on('disconnect', () => {
    console.log('A user disconnect', socket.user.fullName)
    delete userSocketMap[socket.userId]
    io.emit('getOnlineUsers', Object.keys(userSocketMap))
  })
})

export { io, app, server }
