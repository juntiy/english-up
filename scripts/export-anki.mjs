// export-anki.mjs
// 将 data/wordlists 与 data/wordfamilies 导出为 Anki 可用的导入格式（TSV）。
// 完整 .apkg 生成计划在 P4 阶段实现（需 genanki 或 anki-packager）。
//
// 用法：node scripts/export-anki.mjs
//
// 当前输出：标准 TSV（制表符分隔：front\tback），可直接用 Anki "导入" 加载。

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')

const lines = ['# 英文\t中文\t音标\t例句']

// 词表
const wl = JSON.parse(readFileSync(join(dataDir, 'wordlists', 'a1.json'), 'utf-8'))
for (const w of wl.words) {
  lines.push([w.word, w.cn, w.ipa, w.example || ''].join('\t'))
}

// 词族（锚点 + 成员）
for (const file of readdirSync(join(dataDir, 'wordfamilies'))) {
  if (!file.endsWith('.json')) continue
  const families = JSON.parse(readFileSync(join(dataDir, 'wordfamilies', file), 'utf-8'))
  for (const f of families) {
    const all = [f.anchor, ...(f.members || [])]
    for (const m of all) {
      lines.push([m.word, m.cn, m.ipa, m.example || ''].join('\t'))
    }
  }
}

const out = lines.join('\n')
writeFileSync(join(__dirname, '..', 'anki-import.tsv'), out, 'utf-8')
console.log(`已生成 anki-import.tsv（${lines.length - 1} 张卡片）`)
