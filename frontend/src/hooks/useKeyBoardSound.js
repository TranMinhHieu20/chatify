// audio setup

const keyStrokeSounds = [
  new Audio('/sound/frontend_public_sounds_keystroke1.mp3'),
  new Audio('/sound/frontend_public_sounds_keystroke2.mp3'),
  new Audio('/sound/frontend_public_sounds_keystroke3.mp3'),
  new Audio('/sound/frontend_public_sounds_keystroke4.mp3')
]

function useKeyBoardSound() {
  const playRandomKeyStrokeSound = () => {
    const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)]
    randomSound.currentTime = 0 // this is for a beeter UX, def add this
    randomSound.play().catch((error) => console.log('Audio play failed', error))
  }
  return {
    playRandomKeyStrokeSound
  }
}

export default useKeyBoardSound
