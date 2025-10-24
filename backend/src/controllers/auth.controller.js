import { sendWelcomeEmail } from '../emails/emailHandlers.js'
import { generateToken } from '../lib/utils.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { ENV } from '../lib/env.js'

export const signUp = async (req, res) => {
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
    console.log('Error in signUp controller', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
