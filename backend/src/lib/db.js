import mongoose from 'mongoose'
import { ENV } from './env.js'
export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV
    if (!MONGO_URI) throw new Error('"MONGO_URI not is set')
    const conn = await mongoose.connect(MONGO_URI)
    console.log('Connect DB successfully!', conn.connection.host)
  } catch (error) {
    console.log('Connect DB fail!', error)
    process.exit(1) // 1 is fail, 0 is success
  }
}
