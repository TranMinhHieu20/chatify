import { sendWelcomeEmail } from '../emails/emailHandlers.js'
import { generateToken } from '../lib/utils.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { ENV } from '../lib/env.js'
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) => {
  const { fullName, email, passWord } = req.body
  try {
    if (!fullName || !email || !passWord) {
      return res.status(400).json({ message: 'All field are required' })
    }

    //check emails valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'invalid email format' })
    }

    // check length passWord
    if (passWord.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // connect model
    const user = await User.findOne({ email: email })
    if (user) {
      return res.status(400).json({ message: 'Email already exits' })
    }

    // ma hoa mk vd: 123123 => @gdhasd_123..
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(passWord, salt)

    const newUser = User({
      fullName,
      email,
      passWord: hashedPassword
    })

    if (newUser) {
      // generateToken(newUser._id, res)
      // await newUser.save()

      // persist user first, then issue auth cookie
      const saveUser = await newUser.save()
      generateToken(saveUser._id, res)

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic
      })

      // todo: send a welcome email to user

      try {
        await sendWelcomeEmail(saveUser.email, saveUser.fullName, ENV.CLIENT_URL)
      } catch (error) {
        console.error('Failed to send welcome email: ', error)
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    console.error('Error in signup controller', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const login = async (req, res) => {
  const { email, passWord } = req.body
  try {
    if (!email || !passWord) {
      return res.status(400).json({ message: 'All field are required' })
    }
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    // never tell the client which one is incorrect: email or password
    const isPasswordCorrect = await bcrypt.compare(passWord, user.passWord)

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    generateToken(user._id, res)

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    })
  } catch (error) {
    console.error('Error in login controller', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const logout = async (req, res) => {
  res.cookie('jwt', '', { maxAge: 0 })
  res.status(200).json({ message: 'Logged out successfully' })
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body
    if (!profilePic) {
      return res.status(400).json({ message: 'Profile pic is required' })
    }
    const userId = req.user._id
    // if (!userId) {
    //   return res.status(400).json({ message: 'User id invalid' })
    // }
    const uploadResponse = await cloudinary.uploader.upload(profilePic)

    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Error in updateProfile controller', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
