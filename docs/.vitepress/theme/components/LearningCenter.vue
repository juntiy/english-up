<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import families from '../../../../data/wordfamilies/l0-phonics.json'
import { useProgress } from '../composables/useProgress'
import DailyDrill from './DailyDrill.vue'

const prog = useProgress()
const ready = ref(false)
const drilling = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const importMsg = ref('')

onMounted(() => {
  ready.value = true
})

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const l0Total = (families as any[]).reduce((n, f) => n + f.members.length + 1, 0)

const levelStats = computed(() =>
  prog.getLevelStats({ L0: l0Total, A1: 120, A2: 200, B1: 350, B2: 500, C1: 800 }),
)

const levels = [
  { key: 'L0', name: 'L0 发音地基', status: '进行中' },
  { key: 'A1', name: 'A1 入门', status: '进行中' },
  { key: 'A2', name: 'A2 基础', status: '规划中' },
  { key: 'B1', name: 'B1 进阶', status: '规划中' },
  { key: 'B2', name: 'B2 中高级', status: '规划中' },
  { key: 'C1', name: 'C1+ 高级', status: '规划中' },
]

const week = computed(() => (ready.value ? prog.last7Days() : []))

function exportProgress() {
  const blob = new Blob([prog.exportData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'english-up-progress.json'
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  importMsg.value = ''
  fileInput.value?.click()
}

function onImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const ok = prog.importData(String(reader.result))
    importMsg.value = ok ? '✓ 进度已导入' : '✗ 文件格式不对'
  }
  reader.readAsText(file)
}

function resetProgress() {
  if (confirm('确定清空所有学习进度？此操作不可恢复。')) {
    prog.reset()
    importMsg.value = '已重置'
  }
}
</script>

<template>
  <div class="lc">
    <!-- 紧凑 hero -->
    <header class="hero">
      <div class="hero-left">
        <h1>english-up</h1>
        <p class="tag">可操作的英语进阶系统 · 学 · 练 · 测 · 复习，闭环训练</p>
      </div>
      <RouterLink class="about" to="/guide/philosophy">了解理念 →</RouterLink>
    </header>

    <!-- 顶部数据条 -->
    <section v-if="ready" class="stats">
      <div class="stat">
        <span class="ico">🔥</span><span class="val">{{ prog.state.streak }}</span><span class="lbl">连续天数</span>
      </div>
      <div class="stat">
        <span class="ico">⭐</span><span class="val">{{ prog.state.xp }}</span><span class="lbl">累计 XP</span>
      </div>
      <div class="stat">
        <span class="ico">📅</span><span class="val">{{ todayStr().slice(5) }}</span><span class="lbl">今天</span>
      </div>
      <div class="stat">
        <span class="ico">🃏</span><span class="val">{{ Object.keys(prog.state.cards).length }}</span><span class="lbl">已学词卡</span>
      </div>
    </section>

    <!-- 开始今日学习 -->
    <section class="cta">
      <button class="start" @click="drilling = true">🚀 开始今日学习</button>
      <p class="cta-sub">约 5 分钟 · 复习到期词卡 → 小测验 → 听力跟读，坚持就有连击 🔥</p>
    </section>

    <!-- 闯关流 -->
    <DailyDrill v-if="drilling" @exit="drilling = false" />

    <!-- 我的进度 -->
    <section v-if="ready && !drilling" class="block">
      <h2>我的进度</h2>
      <div class="levels">
        <div v-for="lv in levels" :key="lv.key" class="lv" :class="{ done: lv.status === '规划中' }">
          <div class="lv-top">
            <span class="lv-name">{{ lv.name }}</span>
            <span class="lv-status">{{ lv.status }}</span>
          </div>
          <div class="ring">
            <div class="ring-fill" :style="{ width: (levelStats[lv.key]?.pct || 0) + '%' }"></div>
          </div>
          <div class="lv-pct">{{ levelStats[lv.key]?.pct || 0 }}% · {{ levelStats[lv.key]?.reviewed || 0 }}/{{ levelStats[lv.key]?.total || 0 }}</div>
        </div>
      </div>
    </section>

    <!-- 7天日历 -->
    <section v-if="ready && !drilling" class="block">
      <h2>最近 7 天</h2>
      <div class="week">
        <div v-for="d in week" :key="d.date" class="day" :class="{ on: d.studied }">
          <span class="dow">{{ d.dow }}</span>
          <span class="dot">{{ d.studied ? '🔥' : '·' }}</span>
        </div>
      </div>
    </section>

    <!-- 自由练习 -->
    <section v-if="ready && !drilling" class="block">
      <h2>自由练习</h2>
      <div class="links">
        <a class="link" href="/english-up/levels/l0/phonics">🃏 L0 词族卡（71 族）</a>
        <a class="link" href="/english-up/levels/a1/vocabulary">📚 A1 核心词汇</a>
        <a class="link" href="/english-up/levels/l0/checkpoint">✅ L0 自测过关</a>
        <a class="link" href="/english-up/levels/a1/checkpoint">✅ A1 自测过关</a>
        <a class="link" href="/english-up/demo/word-family">🎴 词族卡交互 Demo</a>
      </div>
    </section>

    <!-- 数据备份 -->
    <section v-if="ready && !drilling" class="block">
      <h2>进度备份</h2>
      <div class="backup">
        <button class="btn" @click="exportProgress">⬇️ 导出进度</button>
        <button class="btn" @click="triggerImport">⬆️ 导入进度</button>
        <button class="btn danger" @click="resetProgress">🗑️ 重置</button>
        <input ref="fileInput" type="file" accept="application/json" hidden @change="onImport" />
        <span v-if="importMsg" class="msg">{{ importMsg }}</span>
      </div>
      <p class="hint">进度保存在你自己的浏览器里（localStorage），换设备或清缓存会丢失，建议定期导出备份。</p>
    </section>
  </div>
</template>

<style scoped>
.lc {
  max-width: 860px;
  margin: 0 auto;
  padding: 8px 4px 40px;
}
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  padding: 10px 0 22px;
  border-bottom: 1px solid var(--vp-c-divider, #e2e2e3);
}
.hero h1 {
  font-size: 30px;
  margin: 0;
  background: linear-gradient(90deg, #3451b2, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.tag {
  color: var(--vp-c-text-2, #57606a);
  font-size: 14px;
  margin: 6px 0 0;
}
.about {
  color: var(--vp-c-brand, #3451b2);
  font-weight: 700;
  white-space: nowrap;
  text-decoration: none;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 22px 0;
}
.stat {
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 14px;
  padding: 14px;
  text-align: center;
}
.stat .ico {
  font-size: 22px;
  display: block;
}
.stat .val {
  font-size: 24px;
  font-weight: 800;
  display: block;
  margin: 2px 0;
}
.stat .lbl {
  font-size: 12px;
  color: var(--vp-c-text-2, #57606a);
}
.cta {
  text-align: center;
  margin: 18px 0 30px;
}
.start {
  background: linear-gradient(90deg, #3451b2, #7c3aed);
  color: #fff;
  border: none;
  padding: 16px 44px;
  font-size: 19px;
  font-weight: 800;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(52, 81, 178, 0.28);
  transition: transform 0.1s;
}
.start:active {
  transform: scale(0.97);
}
.cta-sub {
  color: var(--vp-c-text-2, #57606a);
  font-size: 13px;
  margin-top: 12px;
}
.block {
  margin: 30px 0;
}
.block h2 {
  font-size: 18px;
  margin-bottom: 14px;
}
.levels {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.lv {
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 14px;
  padding: 14px 16px;
}
.lv.done {
  opacity: 0.6;
}
.lv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.lv-name {
  font-weight: 700;
}
.lv-status {
  font-size: 12px;
  color: var(--vp-c-brand, #3451b2);
  background: var(--vp-c-brand-soft, #e8ecfb);
  padding: 2px 8px;
  border-radius: 999px;
}
.lv.done .lv-status {
  color: var(--vp-c-text-2, #57606a);
  background: var(--vp-c-bg, #fff);
}
.ring {
  height: 8px;
  background: var(--vp-c-divider, #e2e2e3);
  border-radius: 999px;
  overflow: hidden;
}
.ring-fill {
  height: 100%;
  background: linear-gradient(90deg, #3451b2, #7c3aed);
  transition: width 0.4s;
}
.lv-pct {
  font-size: 12px;
  color: var(--vp-c-text-2, #57606a);
  margin-top: 6px;
}
.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.day {
  text-align: center;
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 12px;
  padding: 10px 0;
  opacity: 0.5;
}
.day.on {
  opacity: 1;
  border-color: #f59e0b;
  background: #fff7ed;
}
.day .dow {
  display: block;
  font-size: 12px;
  color: var(--vp-c-text-2, #57606a);
}
.day .dot {
  font-size: 18px;
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.link {
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 10px;
  padding: 10px 14px;
  text-decoration: none;
  color: var(--vp-c-text-1, #213547);
  font-weight: 600;
  font-size: 14px;
}
.link:hover {
  border-color: var(--vp-c-brand, #3451b2);
}
.backup {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.btn {
  padding: 9px 16px;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider, #e2e2e3);
  background: var(--vp-c-bg, #fff);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}
.btn:hover {
  border-color: var(--vp-c-brand, #3451b2);
}
.btn.danger {
  color: #dc2626;
  border-color: #fca5a5;
}
.msg {
  font-size: 13px;
  color: #16a34a;
  font-weight: 700;
}
.hint {
  font-size: 12px;
  color: var(--vp-c-text-2, #57606a);
  margin-top: 10px;
}
</style>
