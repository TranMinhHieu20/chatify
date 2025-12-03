import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64 } from 'tweetnacl-util'

// Tạo key pair cho user
export const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair()
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey)
  }
}

// Mã hóa tin nhắn
export const encryptMessage = (message, recipientPublicKey, senderPrivateKey) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const messageUint8 = new TextEncoder().encode(message)

  const encrypted = nacl.box(messageUint8, nonce, decodeBase64(recipientPublicKey), decodeBase64(senderPrivateKey))

  return {
    encryptedText: encodeBase64(encrypted),
    nonce: encodeBase64(nonce)
  }
}

// Giải mã tin nhắn
export const decryptMessage = (encryptedText, nonce, senderPublicKey, recipientPrivateKey) => {
  const decrypted = nacl.box.open(
    decodeBase64(encryptedText),
    decodeBase64(nonce),
    decodeBase64(senderPublicKey),
    decodeBase64(recipientPrivateKey)
  )

  if (!decrypted) {
    throw new Error('Failed to decrypt message')
  }

  return new TextDecoder().decode(decrypted)
}
