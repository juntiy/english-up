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
          { text: 'L0 准备', link: '/levels/l0/overview' },
          { text: 'A1 入门', link: '/levels/a1/overview' },
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
