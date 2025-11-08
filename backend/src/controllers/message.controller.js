import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from '../lib/socket.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-passWord') // loai bo user dang dang nhap { _id: { $ne: loggedInUserId }
    res.status(200).json(filteredUsers)
  } catch (error) {
    console.log('Error in getAllContacts', error.message)
    res.status(500).json({ Message: 'Server error' })
  }
}

// me and you
// i send you the message
// you send me the message

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id
    const { id: userToChatId } = req.params

    // Tìm tất cả tin nhắn giữa hai người (gồm cả gửi và nhận)
    const messages = await Message.find({
      $or: [
        // $or → lấy các bản ghi mà (sender = tôi và receiver = người kia) hoặc ngược lại.
        {
          senderId: myId,
          receiverId: userToChatId
        },
        {
          senderId: userToChatId,
          receiverId: myId
        }
      ]
    })

    res.status(200).json(messages)
  } catch (error) {
    console.log('Error in getMessageByUserId', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body
    const { id: userToChatId } = req.params
    const senderId = req.user._id

    if (!text && !image) {
      return res.status(400).json({ message: 'Text or image is required.' })
    }
    // if (senderId.equals(receiverId)) {
    //   return res.status(400).json({ message: 'Cannot send messages to yourself.' })
    // }
    // const receiverExists = await User.exists({ _id: receiverId })
    // if (!receiverExists) {
    //   return res.status(404).json({ message: 'Receiver not found.' })
    // }

    let imageUrl
    if (image) {
      // up load base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }
    const newMessage = new Message({
      senderId,
      receiverId: userToChatId,
      text,
      image: imageUrl
    })

    await newMessage.save()

    // todo: send message in real time if user is online -socket.io
    const receiverSocketId = getReceiverSocketId(userToChatId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage)
    }

    res.status(201).json(newMessage)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
    console.error('Error in sendMessage', error.message)
  }
}

export const getChatsPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    // find all the message where the logged -in user either sender or receiver
    const messages = await Message.find({
      $or: [
        // lay tat ca cac tin nhan
        {
          senderId: loggedInUserId
        },
        {
          receiverId: loggedInUserId
        }
      ]
    })

    const chatPartnersIds = [
      ...new Set(
        messages.map(
          (msg) =>
            msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString()
          //Nếu tôi là người gửi (sender), thì lấy ra ID người nhận.Còn nếu tôi là người nhận, thì lấy ra ID người gửi.”
        )
      )
    ]

    // 🔹 Lấy thông tin người dùng tương ứng, loại bỏ password
    const chatPartners = await User.find({ _id: { $in: chatPartnersIds } }).select('-passWord')
    res.status(201).json(chatPartners)
  } catch (error) {
    console.log('Error in getChatsPartners', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}
