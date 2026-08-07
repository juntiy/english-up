# english-up

> 一份面向中文母语者的「可操作英语进阶系统」——既是"从零到流利"的分级课程体系，也是带练习、测验、复习节奏的训练台。人人可学、可 Fork、可贡献。

[![Deploy VitePress to Pages](https://github.com/juntiy/english-up/actions/workflows/deploy.yml/badge.svg)](https://github.com/juntiy/english-up/actions/workflows/deploy.yml)

🌐 在线站点：https://juntiy.github.io/english-up/

## 与"知识库"的区别

普通英语学习仓库是"读"的；english-up 是"练"的——每个知识点都配 **学 → 练 → 测 → 复习** 闭环。

## 核心特性

- 📚 **分级课程体系**：L0 发音地基 → A1/A2/B1/B2 → C1+，每一级都有"你能做什么"清单
- 🃏 **词族联想卡 WordFamilyCard**：一个中心词带动整族词，放射状记忆，比单词表高效数倍
- 🎴 **闪卡 / SRS**：间隔重复，抗遗忘
- ✅ **测验 / 听写**：每级 checkpoint 把关
- 🔊 **发音模块**：IPA 音标 + TTS 跟读
- 📅 **每日打卡**：单词复习 + 听写 + 跟读，形成习惯
- 📊 **进度看板**：看得见成长

## 目录结构

```
english-up/
├── docs/                     # VitePress 站点
│   ├── .vitepress/           # 配置 + 主题 + 组件(WordFamilyCard)
│   ├── index.md              # 首页
│   ├── guide/                # 理念、用法、路线图
│   ├── levels/               # l0 / a1 / a2 / b1 / b2 ...
│   ├── drills/               # 每日练习
│   └── demo/                 # 组件演示
├── data/                     # 结构化数据（驱动闪卡/词族卡/测验）
│   ├── wordlists/
│   ├── wordfamilies/         # ⭐ 词族联想卡数据
│   └── quizzes/
├── scripts/                  # build-flashcards / export-anki
├── .github/workflows/        # 部署到 GitHub Pages
└── LICENSE
```

## 本地运行

```bash
npm install
npm run dev        # 本地预览 http://localhost:5173
npm run build      # 构建到 docs/.vitepress/dist
```

## 路线图

- **P0** 脚手架 + 部署上线（当前阶段）
- **P1** L0 + A1 完整内容 + 词族联想卡组件 + 基础测验
- **P2** 闪卡/SRS + 发音模块 + 每日打卡
- **P3** A2 / B1 / B2 内容填充 + 词族库扩展至 80+
- **P4** 社区贡献流程 + 资源库 + Anki 导出

## 贡献

欢迎提交词族卡、词表、测验或纠错。详见 `CONTRIBUTING.md`（规划中）。

## License

代码采用 MIT License；教学内容建议署名转载（CC BY-NC 4.0 精神）。
