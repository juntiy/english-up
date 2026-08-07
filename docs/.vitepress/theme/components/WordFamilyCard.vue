<script setup lang="ts">
import { ref } from 'vue'

export interface FamilyMember {
  word: string
  ipa: string
  cn: string
  image?: string
  example?: string
}

export interface Family {
  phonics?: string
  sound?: string
  anchor: FamilyMember
  members: FamilyMember[]
  note?: string
}

const props = defineProps<{ family: Family }>()

const flipped = ref<Record<number, boolean>>({})
function toggle(i: number) {
  flipped.value[i] = !flipped.value[i]
}

function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }
}

/** 把词按 phonics 后缀拆分，高亮词尾 */
function highlightWord(word: string, phonics?: string) {
  if (!phonics || !word.endsWith(phonics)) return { pre: word, suffix: '' }
  const pre = word.slice(0, -phonics.length)
  return { pre, suffix: phonics }
}
</script>

<template>
  <div class="wfc">
    <div class="wfc-head" v-if="family.phonics || family.sound">
      <span class="tag">词族 {{ family.phonics }}</span>
      <span class="sound">{{ family.sound }}</span>
    </div>

    <div class="grid">
      <button
        v-for="(m, i) in family.members"
        :key="i"
        class="card"
        :class="['pos-' + i, { flip: flipped[i] }]"
        @click="toggle(i)"
      >
        <div class="face front">
          <div class="emoji">{{ m.image || '📘' }}</div>
          <div class="word" @click.stop="speak(m.word)">
            {{ highlightWord(m.word, family.phonics).pre }}<span class="hl">{{ highlightWord(m.word, family.phonics).suffix }}</span> <span class="sp">🔊</span>
          </div>
          <div class="ipa">{{ m.ipa }}</div>
          <div class="cn">{{ m.cn }}</div>
        </div>
        <div class="face back">
          <div class="word">
            {{ highlightWord(m.word, family.phonics).pre }}<span class="hl">{{ highlightWord(m.word, family.phonics).suffix }}</span>
          </div>
          <div class="ex">{{ m.example || '（例句待补充）' }}</div>
          <div class="hint">点击返回</div>
        </div>
      </button>

      <div class="card anchor">
        <div class="emoji">{{ family.anchor.image || '⭐' }}</div>
        <div class="word" @click.stop="speak(family.anchor.word)">
          {{ highlightWord(family.anchor.word, family.phonics).pre }}<span class="hl">{{ highlightWord(family.anchor.word, family.phonics).suffix }}</span> <span class="sp">🔊</span>
        </div>
        <div class="ipa">{{ family.anchor.ipa }}</div>
        <div class="cn">{{ family.anchor.cn }}</div>
      </div>
    </div>

    <p class="note" v-if="family.note">{{ family.note }}</p>
  </div>
</template>

<style scoped>
.wfc { max-width: 660px; margin: 1.2rem auto; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
.wfc-head { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; justify-content: center; }
.tag { background: #3b82f6; color: #fff; padding: 3px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
.sound { color: #64748b; font-size: 15px; }
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 14px;
  align-items: center;
}
.card {
  border: 2px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px 10px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  min-height: 104px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .15s ease, box-shadow .15s ease;
  font-family: inherit;
}
.card:hover { box-shadow: 0 8px 22px rgba(15, 23, 42, .10); transform: translateY(-2px); }
.anchor { border-color: #ef4444; background: #fff5f5; grid-column: 2; grid-row: 2; }
.pos-0 { grid-column: 1; grid-row: 1; }
.pos-1 { grid-column: 3; grid-row: 1; }
.pos-2 { grid-column: 1; grid-row: 3; }
.pos-3 { grid-column: 3; grid-row: 3; }
.pos-4 { grid-column: 1; grid-row: 4; }
.pos-5 { grid-column: 3; grid-row: 4; }
.face { width: 100%; }
.emoji { font-size: 32px; line-height: 1; }
.word { font-weight: 700; font-size: 18px; margin-top: 4px; }
.hl { color: #ef4444; }
.sp { font-size: 13px; opacity: .65; }
.ipa { color: #2563eb; font-size: 13px; margin-top: 2px; }
.cn { color: #475569; font-size: 13px; margin-top: 2px; }
.back .ex { font-size: 13px; color: #334155; padding: 0 6px; line-height: 1.5; }
.back .hint { font-size: 11px; color: #94a3b8; margin-top: 6px; }
.front { display: block; }
.back { display: none; }
.card.flip .front { display: none; }
.card.flip .back { display: block; }
.note { text-align: center; color: #94a3b8; font-size: 13px; margin-top: 14px; }

@media (max-width: 540px) {
  .grid { grid-template-columns: 1fr 1fr; }
  .anchor { grid-column: 1 / span 2; grid-row: auto; }
  .pos-0, .pos-1, .pos-2, .pos-3, .pos-4, .pos-5 { grid-column: auto; grid-row: auto; }
}
</style>
