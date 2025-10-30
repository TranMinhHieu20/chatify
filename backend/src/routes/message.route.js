import express from 'express'
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatsPartners
} from '../controllers/message.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'
import { arcjetProtection } from '../lib/arcjet.middleware.js'

const router = express.Router()

router.use(arcjetProtection, protectRoute)

router.get('/contacts', getAllContacts)
router.get('/chats', getChatsPartners)
router.get('/:id', getMessagesByUserId)
router.post('/send/:id', sendMessage)

export default router
