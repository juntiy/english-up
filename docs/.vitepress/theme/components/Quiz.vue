<script setup lang="ts">
import { ref, computed } from 'vue'

interface Q {
  type: 'choice' | 'fill'
  prompt: string
  options?: string[]
  answer: number | string
}

const props = defineProps<{ questions: Q[]; title?: string }>()
const emit = defineEmits<{ (e: 'complete', payload: { score: number; total: number }): void }>()

const idx = ref(0)
const selected = ref<number | null>(null)
const text = ref('')
const answered = ref(false)
const correct = ref(false)
const score = ref(0)

const q = computed(() => props.questions[idx.value])
const total = computed(() => props.questions.length)
const isLast = computed(() => idx.value === total.value - 1)

function submit() {
  if (!q.value) return
  if (q.value.type === 'choice' && selected.value === null) return
  if (q.value.type === 'fill' && !text.value.trim()) return
  answered.value = true
  if (q.value.type === 'choice') {
    correct.value = selected.value === q.value.answer
  } else {
    correct.value =
      String(text.value).trim().toLowerCase() === String(q.value.answer).trim().toLowerCase()
  }
  if (correct.value) score.value += 1
}

function next() {
  if (isLast.value) {
    emit('complete', { score: score.value, total: total.value })
    return
  }
  idx.value += 1
  selected.value = null
  text.value = ''
  answered.value = false
  correct.value = false
}

function answerText(): string {
  if (!q.value) return ''
  return q.value.type === 'choice' ? String(q.value.options?.[q.value.answer as number]) : String(q.value.answer)
}
</script>

<template>
  <div class="quiz">
    <div class="q-head">
      <span class="q-title">{{ title || '小测验' }}</span>
      <span class="q-progress">{{ idx + 1 }} / {{ total }}</span>
    </div>
    <div class="q-prompt">{{ q?.prompt }}</div>

    <div v-if="q?.type === 'choice'" class="options">
      <button
        v-for="(opt, i) in q.options"
        :key="i"
        class="opt"
        :class="{
          sel: selected === i,
          right: answered && i === q.answer,
          wrong: answered && selected === i && i !== q.answer,
        }"
        :disabled="answered"
        @click="selected = i"
      >
        {{ opt }}
      </button>
    </div>

    <div v-else class="fill">
      <input
        v-model="text"
        :disabled="answered"
        placeholder="输入英文答案"
        @keyup.enter="submit"
      />
    </div>

    <div v-if="!answered" class="actions">
      <button class="btn primary" @click="submit">提交</button>
    </div>
    <div v-else class="feedback">
      <div :class="correct ? 'ok' : 'no'">
        {{ correct ? '✓ 回答正确' : '✗ 正确答案：' + answerText() }}
      </div>
      <button class="btn primary" @click="next">{{ isLast ? '完成' : '下一题' }}</button>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 14px;
  padding: 20px;
  max-width: 560px;
  margin: 0 auto;
}
.q-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--vp-c-text-2, #57606a);
  margin-bottom: 12px;
}
.q-title {
  font-weight: 700;
}
.q-progress {
  background: var(--vp-c-default-soft, #eaeaea);
  padding: 2px 10px;
  border-radius: 999px;
}
.q-prompt {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.options {
  display: grid;
  gap: 10px;
}
.opt {
  text-align: left;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider, #e2e2e3);
  background: var(--vp-c-bg, #fff);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.15s;
}
.opt:hover:not(:disabled) {
  border-color: var(--vp-c-brand, #3451b2);
}
.opt.sel {
  border-color: var(--vp-c-brand, #3451b2);
  background: var(--vp-c-brand-soft, #e8eoff);
}
.opt.right {
  border-color: #16a34a;
  background: #dcfce7;
  color: #14532d;
}
.opt.wrong {
  border-color: #dc2626;
  background: #fee2e2;
  color: #7f1d1d;
}
.fill input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider, #e2e2e3);
  font-size: 16px;
  outline: none;
}
.fill input:focus {
  border-color: var(--vp-c-brand, #3451b2);
}
.actions {
  margin-top: 16px;
  text-align: right;
}
.feedback {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ok {
  color: #16a34a;
  font-weight: 700;
}
.no {
  color: #dc2626;
  font-weight: 700;
}
.btn {
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
}
.btn.primary {
  background: var(--vp-c-brand, #3451b2);
  color: #fff;
}
.btn.primary:hover {
  opacity: 0.9;
}
</style>
