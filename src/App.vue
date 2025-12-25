<script setup>
import { ref, computed, onMounted } from 'vue'
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

/* OS */
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
const isAndroid = computed(() => !isIOS())

/* 상태 */
const isOpened = ref(false)
const displayedText = ref('')
const audioRef = ref(null)
const hasPlayedAudio = ref(false)

/* 디버그(안드에서 왜 안 나는지 화면에 표시) */
const audioStatus = ref('') // 예: "blocked: NotAllowedError" / "error: MEDIA_ERR_SRC_NOT_SUPPORTED" 등

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

/* 오디오 에러 메시지 정리 */
const mapMediaError = (err) => {
  if (!err) return 'unknown error'
  // HTMLMediaElement.error.code: 1~4
  const code = err.code
  if (code === 1) return 'MEDIA_ERR_ABORTED'
  if (code === 2) return 'MEDIA_ERR_NETWORK'
  if (code === 3) return 'MEDIA_ERR_DECODE'
  if (code === 4) return 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  return `MEDIA_ERR_${code ?? 'UNKNOWN'}`
}

/* 가장 중요한: play()는 반드시 Promise 결과를 잡는다 */
const tryPlay = async () => {
  const el = audioRef.value
  if (!el) {
    audioStatus.value = 'audio element missing'
    return
  }

  try {
    // 안드에서 가끔 로드가 덜 된 채로 play하면 씹히는 케이스가 있어서 강제 준비
    el.preload = 'auto'
    el.loop = true
    el.volume = 0.25
    el.muted = false

    // 어떤 기기에서 currentTime 접근이 막히는 경우 방지
    try {
      if (el.readyState === 0) {
        el.load()
      }
    } catch {}

    const p = el.play()
    if (p && typeof p.then === 'function') {
      await p
    }

    hasPlayedAudio.value = true
    audioStatus.value = ''
  } catch (e) {
    // 여기서부터가 핵심: 안드에서 왜 막혔는지 "진짜 이유"가 나온다
    const msg = e?.name ? `${e.name}: ${e.message ?? ''}` : String(e)
    audioStatus.value = `blocked: ${msg}`

    // 추가로 media error가 있으면 더 구체적으로 표시
    const err = audioRef.value?.error
    if (err) {
      audioStatus.value += ` / error: ${mapMediaError(err)}`
    }
  }
}

/* iOS: 편지 열 때 재생 */
const openLetter = async () => {
  if (isOpened.value) return
  isOpened.value = true

  if (isIOS()) {
    await tryPlay()
  }

  startTyping()
}

/* Android: 배경(pointerdown)에서 재생 */
const handleBackgroundTouch = async (e) => {
  if (!isAndroid.value) return
  if (hasPlayedAudio.value) return

  // 안드에서 "사용자 제스처" 인정 확률 올리기
  e.preventDefault()

  await tryPlay()
}

/* 오디오 element 자체 이벤트로도 상태 잡기 */
onMounted(() => {
  const el = audioRef.value
  if (!el) return

  el.addEventListener('error', () => {
    const err = el.error
    audioStatus.value = `error: ${mapMediaError(err)}`
  })

  el.addEventListener('canplay', () => {
    // 로드가 됐는지 확인용
    if (!hasPlayedAudio.value && isAndroid.value) {
      // 너무 시끄럽지 않게: 상태가 비어있을 때만
      if (!audioStatus.value) audioStatus.value = 'ready (tap background to play)'
    }
  })
})

/* 눈 */
const snows = Array.from({ length: 40 }).map(() => ({
  left: Math.random() * 100 + '%',
  duration: 6 + Math.random() * 8 + 's',
  delay: Math.random() * 5 + 's',
  opacity: 0.4 + Math.random() * 0.6,
  size: 4 + Math.random() * 4 + 'px',
}))
</script>

<template>
  <div class="page" @pointerdown="handleBackgroundTouch" @click="openLetter">
    <!-- 오디오: 반드시 DOM에 있어야 함 -->
    <audio
      ref="audioRef"
      :src="bgm"
      preload="auto"
      playsinline
      webkit-playsinline
    ></audio>

    <!-- Android 안내 문구 -->
    <div v-if="isAndroid && !hasPlayedAudio" class="android-hint">
      배경을 한 번 터치하면<br />
      음악이 시작돼요 🎵
    </div>

    <!-- Android 디버그 상태(실제 실패 이유를 보여줌) -->
    <div v-if="isAndroid && !hasPlayedAudio && audioStatus" class="android-debug">
      {{ audioStatus }}
    </div>

    <div class="card">
      <div v-if="!isOpened" class="closed">
        <div class="icon">✉️</div>
        <div class="hint">To 윤수연</div>
      </div>

      <pre v-else class="letter">{{ displayedText }}</pre>
    </div>

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

.android-debug {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 82px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.35;
  z-index: 6;
  word-break: break-word;
}

@keyframes fadePulse {
  0% { opacity: 0.45; }
  50% { opacity: 1; }
  100% { opacity: 0.45; }
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
