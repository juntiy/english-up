---
title: 词族联想卡 Demo
---

<script setup lang="ts">
// 演示数据：与 data/wordfamilies/l0-phonics.json 中 -eep 词族一致
const family = {
  phonics: '-eep',
  sound: '/iːp/',
  anchor: { word: 'deep', ipa: '/diːp/', cn: '深的', image: '🌊' },
  members: [
    { word: 'sheep',  ipa: '/ʃiːp/',  cn: '绵羊',   image: '🐑', example: 'The sheep is on the hill.' },
    { word: 'sleep', ipa: '/sliːp/', cn: '睡觉',   image: '😴', example: 'I sleep at 10 p.m.' },
    { word: 'keep',   ipa: '/kiːp/',  cn: '保持',   image: '🛡️', example: 'Keep the change.' },
    { word: 'jeep',   ipa: '/dʒiːp/', cn: '吉普车', image: '🚙', example: 'He drives a jeep.' },
  ],
  note: '长元音 /iːp/ 词族 —— 记住 deep，整族一起记',
}
</script>

# 词族联想卡 Demo

**点击任意卡片**可以翻转看例句；**点击单词右侧 🔊** 可发音跟读。

<WordFamilyCard :family="family" />

## 它为什么有效

- **网状记忆**：一个中心词（deep）辐射 4 个同族词，比线性列表记得牢。
- **多感官**：单词 + 音标 + 中文 + 配图 + 发音，五感同时编码。
- **结构化**：同一词尾 `-eep` 共享 `/iːp/` 发音，一次掌握一组。

> 这是 english-up 的核心教具。完整词族库（50–80 个高频词族）将在 P1 阶段通过 `data/wordfamilies/` 数据驱动填充。
