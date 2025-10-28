import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { ENV } from '../lib/env.js'

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt
    if (!token) {
      // chua dang nhap
      return res.status(401).json({ message: 'Unauthorized - No token provided' })
    }

    // xem co hop le ko, token con han khong
    const decoded = jwt.verify(token, ENV.JWT_SECRET)
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' })
    }

    // Dựa vào userId trong token, middleware tìm người dùng trong MongoDB.
    //Nếu không có user nào khớp → token đó không hợp lệ hoặc user đã bị xóa.
    const user = await User.findById(decoded.userId).select('-passWord')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    req.user = user
    next()
  } catch (error) {
    console.log('Error in protectRoute middleware:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
