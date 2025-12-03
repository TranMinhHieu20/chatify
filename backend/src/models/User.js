import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true
    },
    passWord: {
      type: String,
      required: true,
      minlength: 6
    },
    profilePic: {
      type: String,
      default: ''
    },
    // Thêm public key cho E2EE
    publicKey: {
      type: String,
      default: '', // Thay unique: true + required: true
      unique: true, // Giữ unique để không có 2 public key giống nhau
      sparse: true // Thêm sparse để cho phép nhiều null values
    }
  },
  {
    timestamps: true // tu dong them createAt, updateAt
  }
)
const User = mongoose.model('User', userSchema)
export default User
