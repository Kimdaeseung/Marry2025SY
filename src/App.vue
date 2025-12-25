<script setup>
import { ref, computed } from 'vue'
import bgm from './assets/TheFirstNoel.mp3'

/* ======================
   편지 내용
====================== */
const messageLines = [
  '메리 크리스마스 수연아~',
  '',
  '올 한 해 정말 고생 많았어.',
  '바쁘고 힘든 날도 많았겠지만,',
  '그래도 여기까지 잘 와줘서 고마워.',
  '',
  '우리가 만난지 벌써 1년이 다되어 가네~',
  '난 아직도 처음만났을때처럼...',
  '아직도 두근거리구~',
  '같이 있구싶구~',
  '너무나 사랑하고 있어.',
  '',
  '따뜻한 하루 보내고',
  '아저씨한테 꼭 아빠라고 못부르는거 때문에~',
  '크게 마음 쓰지말구~',
  '아저씨두 이해 하실거야.',
  '무슨일이든 급하지말구~',
  '천천히..',
  '항상 웃음 가득한 연말이 되길♡',
  '',
  '— From. 마음을 담아서 바봉이가',
]

/* ======================
   OS 판별
====================== */
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
const isAndroid = computed(() => !isIOS())

/* ======================
   상태
====================== */
const isOpened = ref(false)
const displayedText = ref('')
const audioRef = ref(null)
const hasPlayedAudio = ref(false)

/* ======================
   타이핑 효과
====================== */
let lineIndex = 0
let charIndex = 0

const startTyping = () => {
  if (lineIndex >= messageLines.length) return

  const line = messageLines[lineIndex]

  if (charIndex <= line.length) {
    displayedText.value =
      messageLines.slice(0, lineIndex).join('\n') +
      '\n' +
      line.slice(0, charIndex)

    charIndex++
    setTimeout(startTyping, 70)
  } else {
    lineIndex++
    charIndex = 0
    setTimeout(startTyping, 500)
  }
}

/* ======================
   오디오 (동기 재생)
====================== */
const playBgmSync = () => {
  if (!audioRef.value) return
  audioRef.value.volume = 0.25
  audioRef.value.loop = true
  audioRef.value.play()
  hasPlayedAudio.value = true
}

/* ======================
   iOS: 편지 열 때 재생
====================== */
const openLetter = () => {
  if (isOpened.value) return

  isOpened.value = true

  if (isIOS()) {
    playBgmSync()
  }

  startTyping()
}

/* ======================
   Android: 배경 터치 시 재생
====================== */
const handleBackgroundTouch = (e) => {
  if (!isAndroid.value) return
  if (hasPlayedAudio.value) return

  e.preventDefault()
  playBgmSync()
}

/* ======================
   눈
====================== */
const snows = Array.from({ length: 40 }).map(() => ({
  left: Math.random() * 100 + '%',
  duration: 6 + Math.random() * 8 + 's',
  delay: Math.random() * 5 + 's',
  opacity: 0.4 + Math.random() * 0.6,
  size: 4 + Math.random() * 4 + 'px',
}))
</script>

<template>
  <div
    class="page"
    @pointerdown="handleBackgroundTouch"
    @click="openLetter"
  >
    <!-- 🎵 audio -->
    <audio
      ref="audioRef"
      :src="bgm"
      preload="auto"
      playsinline
    ></audio>

    <!-- 💡 Android 안내 문구 -->
    <div
      v-if="isAndroid && !hasPlayedAudio"
      class="android-hint"
    >
      배경을 한 번 터치하면<br />
      음악이 시작돼요 🎵
    </div>

    <div class="card">
      <div v-if="!isOpened" class="closed">
        <div class="icon">✉️</div>
        <div class="hint">To 윤수연</div>
      </div>

      <pre v-else class="letter">{{ displayedText }}</pre>
    </div>

    <!-- ❄️ 눈 -->
    <span
      v-for="(snow, i) in snows"
      :key="i"
      class="snow"
      :style="{
        left: snow.left,
        width: snow.size,
        height: snow.size,
        opacity: snow.opacity,
        animationDuration: snow.duration,
        animationDelay: snow.delay,
      }"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100svh;
  min-width: 300px;
  background: linear-gradient(180deg, #0f2027, #203a43, #2c5364);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

/* 💡 Android 안내 */
.android-hint {
  position: fixed;
  bottom: 28px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
  z-index: 5;
  animation: fadePulse 2s ease-in-out infinite;
}

@keyframes fadePulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.card {
  background: rgba(255, 255, 255, 0.96);
  width: 100%;
  max-width: 340px;
  padding: 28px 24px;
  border-radius: 22px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  z-index: 2;
}

.closed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  color: #555;
}

.icon {
  font-size: 42px;
  margin-bottom: 12px;
}

.hint {
  font-size: 15px;
  opacity: 0.85;
}

.letter {
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.75;
  color: #333;
  margin: 0;
}

.snow {
  position: absolute;
  top: -10px;
  background: white;
  border-radius: 50%;
  animation: fall linear infinite;
  pointer-events: none;
}

@keyframes fall {
  to {
    transform: translateY(110vh);
  }
}
</style>
