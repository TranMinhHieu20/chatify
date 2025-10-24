import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log('Connect DB successfully!', conn.connection.host)
  } catch (error) {
    console.log('Connect DB fail!', error)
    process.exit(1) // 1 is fail, 0 is success
  }
}
