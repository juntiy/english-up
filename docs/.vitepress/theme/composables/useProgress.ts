// 学习进度存储（纯前端，localStorage）
// 负责：XP、连续学习天数(连击)、已学词卡(SRS)、测验最佳分、关卡进度、7天日历
// 支持：导出 / 导入（备份迁移）、重置
import { ref } from 'vue'

const STORAGE_KEY = 'english-up-progress-v1'

export interface CardProgress {
  level: string
  lastReviewed: string | null
  dueDate: string
  interval: number
  ease: number
  reps: number
}

export interface ProgressState {
  xp: number
  streak: number
  lastStudyDate: string | null
  studyDates: string[]
  cards: Record<string, CardProgress>
  quizBest: Record<string, number>
  levelProgress: Record<string, number>
  drillsDone: number
  createdAt: string
}

function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime()
  const db = new Date(b + 'T00:00:00').getTime()
  return Math.round((db - da) / 86400000)
}

function defaultState(): ProgressState {
  return {
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    studyDates: [],
    cards: {},
    quizBest: {},
    levelProgress: {},
    drillsDone: 0,
    createdAt: todayStr(),
  }
}

function load(): ProgressState {
  if (typeof localStorage === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

// 模块级单例：所有组件共享同一份进度
const state = ref<ProgressState>(load())

function save() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  } catch {
    /* 忽略写入异常（隐私模式等） */
  }
}

export function useProgress() {
  function recordStudyToday() {
    const t = todayStr()
    if (state.value.lastStudyDate === t) {
      save()
      return
    }
    const last = state.value.lastStudyDate
    if (last && daysBetween(last, t) === 1) state.value.streak += 1
    else state.value.streak = 1
    state.value.lastStudyDate = t
    if (!state.value.studyDates.includes(t)) state.value.studyDates.push(t)
    save()
  }

  function addXp(n: number) {
    state.value.xp += n
    save()
  }

  function ensureCard(id: string, level: string) {
    if (!state.value.cards[id]) {
      state.value.cards[id] = {
        level,
        lastReviewed: null,
        dueDate: todayStr(),
        interval: 0,
        ease: 2.5,
        reps: 0,
      }
    }
  }

  // quality: 1=不熟 2=模糊 3=认识（SM-2 简化版）
  function reviewCard(id: string, level: string, quality: number) {
    ensureCard(id, level)
    const c = state.value.cards[id]
    c.lastReviewed = todayStr()
    if (quality < 3) {
      c.reps = 0
      c.interval = 1
    } else {
      c.reps += 1
      if (c.reps === 1) c.interval = 1
      else if (c.reps === 2) c.interval = 6
      else c.interval = Math.round(c.interval * c.ease)
    }
    c.ease = Math.max(1.3, c.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    c.dueDate = addDays(todayStr(), c.interval)
    save()
  }

  function getDueCards(allIds: { id: string; level: string }[], limit = 6) {
    const t = todayStr()
    const due = allIds.filter((x) => {
      const c = state.value.cards[x.id]
      return !c || c.dueDate <= t
    })
    return due.slice(0, limit)
  }

  function setLevelProgress(level: string, pct: number) {
    state.value.levelProgress[level] = Math.max(0, Math.min(100, Math.round(pct)))
    save()
  }

  function recordQuiz(id: string, score: number) {
    const prev = state.value.quizBest[id] || 0
    state.value.quizBest[id] = Math.max(prev, score)
    save()
  }

  function getLevelStats(totalByLevel: Record<string, number>) {
    const stats: Record<string, { reviewed: number; total: number; pct: number }> = {}
    for (const lv of Object.keys(totalByLevel)) {
      const total = totalByLevel[lv]
      const reviewed = Object.values(state.value.cards).filter((c) => c.level === lv && c.reps > 0).length
      stats[lv] = {
        reviewed,
        total,
        pct: total ? Math.min(100, Math.round((reviewed / total) * 100)) : 0,
      }
    }
    return stats
  }

  function last7Days() {
    const t = todayStr()
    const arr: { date: string; studied: boolean; dow: string }[] = []
    const dows = ['日', '一', '二', '三', '四', '五', '六']
    for (let i = 6; i >= 0; i--) {
      const d = addDays(t, -i)
      const dt = new Date(d + 'T00:00:00')
      arr.push({ date: d, studied: state.value.studyDates.includes(d), dow: dows[dt.getDay()] })
    }
    return arr
  }

  function exportData(): string {
    return JSON.stringify(state.value, null, 2)
  }

  function importData(json: string): boolean {
    try {
      const parsed = JSON.parse(json)
      state.value = { ...defaultState(), ...parsed }
      save()
      return true
    } catch {
      return false
    }
  }

  function reset() {
    state.value = defaultState()
    save()
  }

  return {
    state,
    recordStudyToday,
    addXp,
    ensureCard,
    reviewCard,
    getDueCards,
    setLevelProgress,
    recordQuiz,
    getLevelStats,
    last7Days,
    exportData,
    importData,
    reset,
  }
}
