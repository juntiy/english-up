import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import WordFamilyCard from './components/WordFamilyCard.vue'
import LearningCenter from './components/LearningCenter.vue'
import DailyDrill from './components/DailyDrill.vue'
import Quiz from './components/Quiz.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 全局注册组件，所有页面均可直接使用
    app.component('WordFamilyCard', WordFamilyCard)
    app.component('LearningCenter', LearningCenter)
    app.component('DailyDrill', DailyDrill)
    app.component('Quiz', Quiz)
  },
} satisfies Theme
