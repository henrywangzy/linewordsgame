# 卡牌类游戏通用开发模板

## 🎮 项目简介

这是一个功能完整的卡牌类游戏开发模板，包含了完整的单词学习系统、游戏框架和通用功能。您只需要在游戏主体区域实现自己的游戏逻辑，其他所有功能都已经为您准备好了！

## ✨ 包含功能

### 通用功能（已实现）
- 📚 **完整单词库**：1200+单词，按1-6年级分类
- 🎵 **背景音乐系统**：自动播放和控制
- 📖 **单词本功能**：完整的单词学习、搜索、分页
- 👀 **单词浏览**：卡片式浏览，支持音标、例句、记忆技巧
- ⏸️ **暂停系统**：游戏暂停/继续功能
- 💬 **单词弹窗**：自动显示例句和发音
- 📱 **响应式设计**：完美适配手机端

### 游戏区框架
- 顶部信息栏（年级、难度、计时器、音乐控制、暂停）
- 游戏主体区域（等待您的实现）
- 底部统计栏（可自定义的统计显示区域）
  - 默认显示：得分
  - 可选统计项1、统计项2（根据游戏需求自定义）
  - 开发者可以修改标签和内容
- 游戏结束页面

## 🚀 快速开始

### 1. 修改游戏配置
编辑 `game-config.js` 文件：

```javascript
const GAME_CONFIG = {
    title: "您的游戏名称",  // 修改游戏标题

    logoCards: {
        // 配置首页Logo卡片
    },

    gameHelp: {
        // 游戏目标
        objective: "描述您的游戏目标",

        // 游戏规则（数组格式）
        rules: [
            "规则1：第一条游戏规则",
            "规则2：第二条游戏规则",
            "规则3：第三条游戏规则"
        ],

        // 游戏技巧（数组格式）
        tips: [
            "技巧1：游戏技巧提示",
            "技巧2：游戏技巧提示"
        ]
    }
};
```

### 2. 实现游戏逻辑
在 `index.html` 中找到游戏主体区域：

```html
<!-- 游戏主体区域 - 在此处实现您的游戏逻辑 -->
<div class="game-main-area" id="gameMainArea">
    <!-- 您的游戏内容将在这里实现 -->
</div>
```

在 JavaScript 部分实现游戏初始化：

```javascript
function initializeGame(grade, difficulty) {
    // 获取单词数据
    const words = wordDatabase[grade];

    // 创建游戏界面
    const gameArea = document.getElementById('gameMainArea');

    // 实现您的游戏逻辑
    // ...
}
```

## 📚 可用API

### 单词数据访问
```javascript
// 获取指定年级的单词
const words = wordDatabase[grade];  // grade: 1-6

// 单词结构
{
    word: "Apple",          // 英文
    chinese: "苹果",        // 中文
    pronunciation: "/ˈæpl/", // 音标
    example: "I like apples. 我喜欢苹果。",  // 例句
    tip: "记忆技巧"         // 记忆提示
}
```

### 音效和语音
```javascript
// 播放单词发音
speakWord("Apple");

// 播放单词和中文
speakWordWithChinese(wordData);

// 显示单词弹窗（包含例句）
showWordExample(wordData);
```

### 游戏控制
```javascript
// 暂停游戏
togglePause();

// 返回首页
goHome();

// 重新开始
restartGame();

// 更新得分显示
document.getElementById('scoreValue').textContent = score;

// 更新计时器
document.getElementById('timerValue').textContent = "01:30";

// 更新自定义统计项（可选）
document.getElementById('stat1Value').textContent = "x5";  // 例如：连击数
document.getElementById('stat2Value').textContent = "3/10"; // 例如：完成进度

// 也可以修改统计项标签
document.querySelector('#stat1Value').previousElementSibling.textContent = "连击";
document.querySelector('#stat2Value').previousElementSibling.textContent = "进度";
```

### 背景音乐控制
```javascript
// 播放背景音乐
playBackgroundMusic();

// 切换背景音乐
toggleBackgroundMusic();
```

## 📂 文件结构

```
0.democard/
├── index.html          # 主文件（包含所有功能）
├── game-config.js      # 游戏配置文件
├── background.mp3      # 背景音乐
├── README.md          # 本文档
└── examples/          # 示例游戏
    └── memory-game.js # 记忆翻牌游戏示例
```

## 🎯 开发步骤

1. **复制模板**：将整个项目复制到新目录
2. **修改配置**：编辑 `game-config.js` 设置游戏名称
3. **设计游戏**：规划您的游戏玩法
4. **实现逻辑**：在游戏主体区域编写代码
5. **添加样式**：在 CSS 部分添加游戏特定样式
6. **测试调试**：在手机端测试游戏效果

## 💡 开发建议

### 游戏设计原则
- 保持简单直观的操作
- 充分利用单词库资源
- 结合学习和娱乐
- 添加激励机制（得分、星级等）

### 性能优化
- 使用 CSS 动画而非 JavaScript 动画
- 合理使用事件委托
- 避免频繁的 DOM 操作
- 及时清理不用的定时器

### 用户体验
- 添加操作反馈（音效、动画）
- 保持界面简洁美观
- 确保触摸操作流畅
- 提供清晰的游戏引导

## 🛠️ 通用功能说明

### 年级选择
- 支持1-6年级
- 每个年级200个精选单词
- 难度递进，符合学习规律

### 难度设置
- 简单：适合初学者
- 中等：适合有基础的学习者
- 困难：适合熟练掌握的学习者

### 单词本
- 自动记录学习进度
- 支持搜索和筛选
- 标记掌握状态
- 支持单词朗读

### 单词浏览
- 卡片式展示
- 显示音标和例句
- 提供记忆技巧
- 支持上下翻页

## 📝 注意事项

1. **保持通用框架**：不要修改框架代码，只在指定区域添加游戏逻辑
2. **利用现有功能**：充分使用已有的API，避免重复开发
3. **测试兼容性**：确保在不同手机上正常运行
4. **优化性能**：注意内存管理，避免内存泄漏

## 🎨 自定义样式

在 CSS 部分的游戏特定样式区域添加：

```css
/* 游戏特定样式 - 请在此处添加您的游戏样式 */
.your-game-class {
    /* 您的样式 */
}
```

## 📱 响应式适配

模板已包含完整的响应式设计：
- 最大宽度：390px（iPhone标准宽度）
- 最大高度：844px（iPhone标准高度）
- 自动适配各种屏幕尺寸

## 🤝 技术支持

如有问题或建议，欢迎联系：
- 公众号：泡泡妈学AI

## 📄 许可证

本模板可自由使用和修改，请保留原作者信息。

---

**祝您开发愉快！🎉**