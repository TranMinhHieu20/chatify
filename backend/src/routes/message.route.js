import express from 'express'
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatsPartners,
  getPublicKey
} from '../controllers/message.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'
import { arcjetProtection } from '../middleware/arcjet.middleware.js'

const router = express.Router()

router.use(arcjetProtection, protectRoute)

router.get('/contacts', getAllContacts)
router.get('/chats', getChatsPartners)
router.get('/public-key/:userId', getPublicKey) // Thêm dòng này
router.get('/:id', getMessagesByUserId)
router.post('/send/:id', sendMessage)

export default router
