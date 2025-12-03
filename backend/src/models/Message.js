import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    image: {
      type: String
    },
    // Thêm ciphertext (tin nhắn được mã hóa)
    encryptedText: {
      type: String,
      trim: true
    },
    // Thêm nonce (số ngẫu nhiên cho mã hóa)
    nonce: {
      type: String
    },
    senderPublicKey: {
      // ✅ Thêm để receiver có thể giải mã
      type: String
    }
  },
  { timestamps: true } // auto update createdAt & updatedAt
)

const Message = mongoose.model('Message', messageSchema)

export default Message
