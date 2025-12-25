<script setup>
import { ref, computed } from 'vue'
import bgm from './assets/TheFirstNoel.mp3'

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
  '— From. 바봉이가',
]

/* OS */
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
const isAndroid = computed(() => !isIOS())

/* 상태 */
const isOpened = ref(false)
const displayedText = ref('')
const audioRef = ref(null)
const hasPlayedAudio = ref(false)

/* 타이핑 */
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

/* 음악 */
const playBgm = () => {
  if (!audioRef.value || hasPlayedAudio.value) return
  audioRef.value.volume = 0.25
  audioRef.value.loop = true
  audioRef.value.play()
  hasPlayedAudio.value = true
}

/* 편지 열기 */
const openLetter = () => {
  if (isOpened.value) return
  isOpened.value = true

  if (isIOS()) {
    playBgm() // iOS는 여기서 바로 OK
  }

  startTyping()
}

/* 안드: 편지 열린 후 배경 클릭 */
const handleBackgroundClick = () => {
  if (!isAndroid.value) return
  if (!isOpened.value) return
  playBgm()
}
</script>

<template>
  <div class="page" @click="handleBackgroundClick">
    <audio ref="audioRef" :src="bgm" preload="auto"></audio>

    <div class="card" @click.stop="openLetter">
      <div v-if="!isOpened" class="closed">
        ✉️<br />To 윤수연
      </div>
      <pre v-else class="letter">{{ displayedText }}</pre>
    </div>

    <!-- 안드 전용 안내 -->
    <div v-if="isAndroid && isOpened && !hasPlayedAudio" class="android-hint">
      배경을 한 번 더 터치하면<br />음악이 나와요 🎵
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100svh;
  background: linear-gradient(180deg, #0f2027, #203a43, #2c5364);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.card {
  background: rgba(255,255,255,0.96);
  max-width: 340px;
  width: 100%;
  padding: 28px;
  border-radius: 22px;
}

.closed {
  text-align: center;
  font-size: 16px;
}

.letter {
  white-space: pre-wrap;
  line-height: 1.7;
}

.android-hint {
  position: fixed;
  bottom: 24px;
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 13px;
  opacity: 0.85;
}
</style>
