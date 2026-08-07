import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import WordFamilyCard from './components/WordFamilyCard.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 全局注册词族联想卡，所有页面均可直接使用 <WordFamilyCard />
    app.component('WordFamilyCard', WordFamilyCard)
  },
} satisfies Theme
