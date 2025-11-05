import { useChatStore } from '../store/useChatStore.js'
import { useAuthStore } from '../store/useAuthStore.js'
import { useState, useRef } from 'react'
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from 'lucide-react'

const mouseClickSound = new Audio('/sounds/frontend_public_sounds_mouse-click.mp3')

function ProfilerHeader() {
  const { logout, authUser, updateProfile } = useAuthStore()
  const { isSoundEnabled, toggleSound } = useChatStore()
  const [selectedImg, setSelectedImg] = useState(null)

  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onloadend = async () => {
      const base64Image = reader.result
      await updateProfile({ profilePic: base64Image })
      setSelectedImg(base64Image)
    }
  }
  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => {
                fileInputRef.current.click()
              }}
            >
              <img
                src={selectedImg || authUser.profilePic || '/avatar.png'}
                alt="avatar"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          </div>
          {/* USER NAME & ONLINE TEXT */}
          <div className="">
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">{authUser.fullName}</h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>
        {/*   BUTTONS */}
        <div className="flex gap-4 items-center">
          {/* LOGOUT BTN */}
          <button className="text-slate-400 hover:text-slate-200 transition-colors" onClick={logout}>
            <LogOutIcon className="size-5" />
          </button>

          {/*   SOUNDS TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0 //reset to start dua ve 0s
              mouseClickSound.play().catch((error) => console.log('Audio play failed', error))
              toggleSound()
            }}
          >
            {isSoundEnabled ? <Volume2Icon className="size-5" /> : <VolumeOffIcon className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilerHeader
