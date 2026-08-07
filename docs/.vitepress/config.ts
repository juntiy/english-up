import { defineConfig } from 'vitepress'

// 部署到 GitHub Pages 项目站点：https://juntiy.github.io/english-up/
export default defineConfig({
  base: '/english-up/',
  title: 'english-up',
  description: '一份面向中文母语者的可操作英语进阶系统',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '路线图', link: '/guide/roadmap' },
      { text: '词族卡 Demo', link: '/demo/word-family' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '学习理念', link: '/guide/philosophy' },
          { text: '如何使用', link: '/guide/how-to-use' },
          { text: '路线图', link: '/guide/roadmap' },
        ],
      },
      {
        text: '课程',
        items: [
          {
            text: 'L0 准备 · 发音地基',
            collapsed: false,
            items: [
              { text: '概览', link: '/levels/l0/overview' },
              { text: '字母与发音', link: '/levels/l0/alphabet' },
              { text: '自然拼读词族卡', link: '/levels/l0/phonics' },
              { text: '拼读规则', link: '/levels/l0/grammar' },
              { text: 'IPA 音标', link: '/levels/l0/ipa' },
              { text: '工具 App', link: '/levels/l0/tools' },
              { text: '听音训练', link: '/levels/l0/listening' },
              { text: '发音练习', link: '/levels/l0/speaking' },
              { text: '书写拼写', link: '/levels/l0/writing' },
              { text: '自测过关', link: '/levels/l0/checkpoint' },
            ],
          },
          {
            text: 'A1 入门',
            collapsed: true,
            items: [
              { text: '概览', link: '/levels/a1/overview' },
              { text: '核心词汇', link: '/levels/a1/vocabulary' },
              { text: '语法', link: '/levels/a1/grammar' },
              { text: '听力', link: '/levels/a1/listening' },
              { text: '口语', link: '/levels/a1/speaking' },
              { text: '写作', link: '/levels/a1/writing' },
              { text: '自测过关', link: '/levels/a1/checkpoint'           },
        ],
      },
      {
        text: '进阶（陆续更新）',
        collapsed: true,
        items: [
          { text: 'A2 基础', link: '/levels/a2/overview' },
          { text: 'B1 进阶', link: '/levels/b1/overview' },
          { text: 'B2 中高级', link: '/levels/b2/overview' },
          { text: 'C1+ 高级', link: '/levels/c1/overview' },
        ],
      },
    ],
      },
      {
        text: '练习',
        items: [
          { text: '每日打卡 Day 1', link: '/drills/day-001' },
          { text: '词族卡 Demo', link: '/demo/word-family' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/juntiy/english-up' },
    ],
    footer: {
      message: '用 ❤️ 为学英语的人打造 · english-up',
      copyright: 'Copyright © 2026 juntiy',
    },
  },
})
