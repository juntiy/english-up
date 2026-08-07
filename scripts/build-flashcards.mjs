// build-flashcards.mjs
// 读取 data/wordfamilies/*.json，校验并生成词族卡数据报告。
// 后续可扩展为：自动生成 docs/levels/<level>/word-family-*.md 页面。
//
// 用法：node scripts/build-flashcards.mjs

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const familiesDir = join(__dirname, '..', 'data', 'wordfamilies')

let total = 0
const report = []

for (const file of readdirSync(familiesDir)) {
  if (!file.endsWith('.json')) continue
  const raw = readFileSync(join(familiesDir, file), 'utf-8')
  const families = JSON.parse(raw)
  for (const f of families) {
    const count = (f.members?.length || 0) + 1
    total += count
    report.push(`  ${f.id}  ${f.phonics} ${f.sound}  ${f.level}  词数=${count}`)
  }
}

const out = [`词族卡数据报告`, `总词数(含锚点): ${total}`, ...report].join('\n')
console.log(out)

// 写出报告，供 CI / 本地查阅
writeFileSync(join(__dirname, '..', '.wordfamily-report.txt'), out, 'utf-8')
