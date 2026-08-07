---
title: 自然拼读 Phonics
---

<script setup lang="ts">
import families from '../../../data/wordfamilies/l0-phonics.json'

// 按分组归类，短元音 / 长元音 / 组合
const GROUP_LABEL: Record<string, string> = {
  'short-a': '短元音 a（/æ/）',
  'short-e': '短元音 e（/e/）',
  'short-i': '短元音 i（/ɪ/）',
  'short-o': '短元音 o（/ɒ/）',
  'short-u': '短元音 u（/ʌ/）',
  'long-a': '长元音 a（/eɪ/，magic e）',
  'long-e': '长元音 e（/iː/）',
  'long-i': '长元音 i（/aɪ/，magic e）',
  'long-o': '长元音 o（/əʊ/，magic e）',
  'long-u': '长元音 u（/juː/，magic e）',
  'blend': '常见字母组合',
}
const order = ['short-a','short-e','short-i','short-o','short-u','long-a','long-e','long-i','long-o','long-u','blend']
const grouped: Record<string, any[]> = {}
for (const f of families as any[]) {
  ;(grouped[f.group] ||= []).push(f)
}
</script>

# 自然拼读 Phonics

> **核心思想**：英语里大量单词共享同一个"词尾 + 发音"。记住一个中心词，就能顺藤摸瓜带出一整族——这就是"词族记忆法"。

**怎么用这些卡：**

- 🔴 **红色部分** = 共享词尾（如 `-eep`），它们发音完全一样
- 👆 **点击卡片** → 翻转看背面（单词 — 释义）
- 🔊 **点击单词右侧喇叭** → 听真人式发音（Web Speech TTS），跟着读

下面按元音分组，建议**每天攻克 1–2 组**，配合[L0 字母与发音](./alphabet)和[L0 音标](./ipa)一起练。

<div v-for="g in order" :key="g">
  <h2 :id="g">{{ GROUP_LABEL[g] || g }} <span class="cnt">（{{ (grouped[g]||[]).length }} 族）</span></h2>
  <WordFamilyCard v-for="f in (grouped[g]||[])" :key="f.id" :family="f" />
</div>

<p class="tip">💡 小贴士：同一组里的词，只要会读中心词，其余只是换了开头的辅音——这就是"见词能读"的底层能力。</p>

<style>
.cnt { color: #94a3b8; font-size: 14px; font-weight: 400; }
.tip { margin-top: 24px; padding: 12px 16px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 6px; color: #075985; }
</style>
