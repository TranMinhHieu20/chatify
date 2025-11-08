import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js'
import { ENV } from './lib/env.js'
import { app, server } from './lib/socket.js'

// const app = express()
const __dirname = path.resolve()

const PORT = ENV.PORT || 3001

app.use(express.json({ limit: '10mb' })) // req.body, tang dung luong khi gui anh
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })) // cho frontend try cap backend khi chay o domain khac, gui cookie tu front len backend
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

// make ready for deployment
if (ENV.NODE_ENV == 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.use('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'))
  })
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}: http://localhost:${PORT}`)
  connectDB()
})
