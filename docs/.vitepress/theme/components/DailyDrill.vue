<script setup lang="ts">
import { ref, computed } from 'vue'
import families from '../../../../data/wordfamilies/l0-phonics.json'
import a1Quiz from '../../../../data/quizzes/a1.json'
import { useProgress } from '../composables/useProgress'
import Quiz from './Quiz.vue'

const emit = defineEmits<{ (e: 'exit'): void }>()
const prog = useProgress()

interface Card {
  id: string
  word: string
  ipa: string
  cn: string
  image: string
  level: string
}

// 把词族库铺平成单卡列表（锚点 + 成员）
const allCards: Card[] = []
for (const f of families as any[]) {
  allCards.push({
    id: f.id + '-a',
    word: f.anchor.word,
    ipa: f.anchor.ipa,
    cn: f.anchor.cn,
    image: f.anchor.image,
    level: f.level,
  })
  ;(f.members as any[]).forEach((m, i) => {
    allCards.push({
      id: f.id + '-m' + i,
      word: m.word,
      ipa: m.ipa,
      cn: m.cn,
      image: m.image,
      level: f.level,
    })
  })
}

type Phase = 'intro' | 'review' | 'quiz' | 'listen' | 'done'
const phase = ref<Phase>('intro')

const reviewQueue = ref<Card[]>([])
const reviewIndex = ref(0)
const reviewedCount = ref(0)

const quizScore = ref(0)

const listenQueue = ref<Card[]>([])
const listenIndex = ref(0)

const xpEarned = ref(0)

const currentReview = computed(() => reviewQueue.value[reviewIndex.value])
const currentListen = computed(() => listenQueue.value[listenIndex.value])
const quizQuestions = (a1Quiz as any).questions as any[]

function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }
}

function start() {
  const due = prog.getDueCards(
    allCards.map((c) => ({ id: c.id, level: c.level })),
    5,
  )
  reviewQueue.value = due.length ? due.map((d) => allCards.find((c) => c.id === d.id)!) : allCards.slice(0, 5)
  reviewIndex.value = 0
  reviewedCount.value = 0
  phase.value = 'review'
}

function review(quality: number) {
  const c = currentReview.value
  if (!c) return
  prog.reviewCard(c.id, c.level, quality)
  reviewedCount.value += 1
  reviewIndex.value += 1
  if (reviewIndex.value >= reviewQueue.value.length) startQuiz()
}

function startQuiz() {
  phase.value = 'quiz'
}

function onQuizComplete(payload: { score: number; total: number }) {
  quizScore.value = payload.score
  prog.recordQuiz('a1', payload.score)
  startListen()
}

function startListen() {
  // 取复习过的词里前 3 个做跟读
  listenQueue.value = reviewQueue.value.slice(0, 3)
  listenIndex.value = 0
  phase.value = listenQueue.value.length ? 'listen' : 'done'
  if (phase.value === 'done') finish()
}

function listenNext() {
  listenIndex.value += 1
  if (listenIndex.value >= listenQueue.value.length) finish()
}

function finish() {
  xpEarned.value =
    reviewedCount.value * 2 + quizScore.value * 5 + listenQueue.value.length * 2
  prog.recordStudyToday()
  prog.addXp(xpEarned.value)
  phase.value = 'done'
}

function restart() {
  quizScore.value = 0
  xpEarned.value = 0
  phase.value = 'intro'
}
</script>

<template>
  <div class="drill">
    <!-- 开场 -->
    <div v-if="phase === 'intro'" class="panel center">
      <div class="big-emoji">🎯</div>
      <h2>今日练习</h2>
      <p class="sub">约 5 分钟 · 复习词卡 → 小测验 → 听力跟读</p>
      <button class="btn primary lg" @click="start">开始</button>
    </div>

    <!-- 复习词卡 -->
    <div v-else-if="phase === 'review'" class="panel">
      <div class="step-bar">第 {{ reviewIndex + 1 }} / {{ reviewQueue.length }} 张 · 复习</div>
      <div v-if="currentReview" class="rcard">
        <div class="emoji">{{ currentReview.image }}</div>
        <div class="word" @click="speak(currentReview.word)">
          {{ currentReview.word }} <span class="sp">🔊</span>
        </div>
        <div class="ipa">{{ currentReview.ipa }}</div>
        <div class="cn">{{ currentReview.cn }}</div>
        <div class="hint">还记得它吗？点🔊听发音</div>
      </div>
      <div class="review-btns">
        <button class="btn bad" @click="review(1)">😵 不熟</button>
        <button class="btn mid" @click="review(2)">🤔 模糊</button>
        <button class="btn good" @click="review(3)">😎 认识</button>
      </div>
    </div>

    <!-- 小测验 -->
    <div v-else-if="phase === 'quiz'" class="panel">
      <div class="step-bar">小测验</div>
      <Quiz :questions="quizQuestions" title="A1 自测" @complete="onQuizComplete" />
    </div>

    <!-- 听力跟读 -->
    <div v-else-if="phase === 'listen'" class="panel center">
      <div class="step-bar">听力跟读 {{ listenIndex + 1 }} / {{ listenQueue.length }}</div>
      <div v-if="currentListen" class="rcard">
        <div class="emoji">{{ currentListen.image }}</div>
        <button class="btn primary lg" @click="speak(currentListen.word)">🔊 播放</button>
        <div class="word">{{ currentListen.word }}</div>
        <div class="cn">{{ currentListen.cn }}</div>
        <p class="sub">跟着读出来，然后点「读好了」</p>
      </div>
      <button class="btn good lg" @click="listenNext">
        {{ listenIndex + 1 >= listenQueue.length ? '完成' : '读好了 →' }}
      </button>
    </div>

    <!-- 结算 -->
    <div v-else class="panel center">
      <div class="big-emoji">🎉</div>
      <h2>今日练习完成！</h2>
      <div class="rewards">
        <div class="reward"><span class="num">+{{ xpEarned }}</span><span class="lbl">⭐ XP</span></div>
        <div class="reward"><span class="num">🔥 {{ prog.state.streak }}</span><span class="lbl">连续天数</span></div>
        <div class="reward"><span class="num">{{ prog.state.drillsDone + 1 }}</span><span class="lbl">累计闯关</span></div>
      </div>
      <p class="sub">明天再来，连击不断 💪</p>
      <div class="row">
        <button class="btn primary" @click="restart">再练一次</button>
        <button class="btn ghost" @click="emit('exit')">返回学习中心</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drill {
  max-width: 600px;
  margin: 0 auto;
}
.panel {
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 16px;
  padding: 28px 24px;
}
.panel.center {
  text-align: center;
}
.step-bar {
  font-size: 13px;
  color: var(--vp-c-brand, #3451b2);
  font-weight: 700;
  margin-bottom: 16px;
}
.big-emoji {
  font-size: 56px;
  margin-bottom: 8px;
}
h2 {
  margin: 4px 0 6px;
}
.sub {
  color: var(--vp-c-text-2, #57606a);
  font-size: 14px;
  margin: 6px 0 18px;
}
.rcard {
  text-align: center;
  padding: 20px 0;
}
.rcard .emoji {
  font-size: 64px;
}
.rcard .word {
  font-size: 32px;
  font-weight: 800;
  margin: 8px 0 4px;
  cursor: pointer;
}
.rcard .ipa {
  color: var(--vp-c-text-2, #57606a);
}
.rcard .cn {
  font-size: 18px;
  margin-top: 4px;
}
.rcard .hint,
.rcard .sub {
  margin-top: 14px;
}
.sp {
  font-size: 18px;
}
.review-btns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 14px;
}
.btn {
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  transition: transform 0.1s, opacity 0.15s;
}
.btn:active {
  transform: scale(0.97);
}
.btn.lg {
  padding: 14px 32px;
  font-size: 17px;
}
.btn.primary {
  background: var(--vp-c-brand, #3451b2);
  color: #fff;
}
.btn.good {
  background: #16a34a;
  color: #fff;
}
.btn.mid {
  background: #f59e0b;
  color: #fff;
}
.btn.bad {
  background: #dc2626;
  color: #fff;
}
.btn.ghost {
  background: transparent;
  border: 1.5px solid var(--vp-c-divider, #e2e2e3);
  color: var(--vp-c-text-1, #213547);
}
.btn:hover {
  opacity: 0.92;
}
.rewards {
  display: flex;
  justify-content: center;
  gap: 26px;
  margin: 10px 0 6px;
}
.reward {
  display: flex;
  flex-direction: column;
}
.reward .num {
  font-size: 26px;
  font-weight: 800;
  color: var(--vp-c-brand, #3451b2);
}
.reward .lbl {
  font-size: 12px;
  color: var(--vp-c-text-2, #57606a);
}
.row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 18px;
}
</style>
