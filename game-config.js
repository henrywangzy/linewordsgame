/**
 * 卡牌类游戏通用配置文件
 * 在此处配置您的游戏基本信息
 */

const GAME_CONFIG = {
    // 游戏名称 - 将显示在首页标题
    title: "连线单词",

    // 首页Logo卡片配置
    logoCards: {
        // 第1张卡片 - 显示背面（紫色带图标）
        card1: {
            backIcon: "✏️",  // 铅笔图标
            // 如果需要自动翻转，可以配置正面内容
            front: {
                en: "Line",
                cn: "连线"
            }
        },
        // 第2张卡片 - 显示正面（英文）
        card2: {
            content: "Word",  // 显示的英文
            style: "color: #667eea;"  // 可选样式
        },
        // 第3张卡片 - 显示正面（中文）
        card3: {
            content: "单词",  // 显示的中文
            style: "color: #667eea;"  // 可选样式
        }
    },

    // 游戏说明配置
    gameHelp: {
        // 游戏目标
        objective: "通过观察和记忆字母出现的路径，连线重现单词拼写，在游戏中学习英语单词",

        // 游戏规则
        rules: [
            "👀 观察阶段：字母会依次在格子中闪现，仔细记住出现的位置和顺序",
            "✏️ 连线阶段：点击格子连接字母，重现刚才观察到的单词路径",
            "📖 学习阶段：成功连线后显示单词卡片，自动朗读单词和例句",
            "🔁 重播功能：观察或连线阶段可点击重播按钮再看一次",
            "💡 提示功能：连线阶段可点击提示按钮查看起点位置"
        ],

        // 游戏技巧
        tips: [
            "记住起点位置是成功的关键，可以重点关注第一个字母",
            "观察时用手指在空中跟随路径移动，加深记忆",
            "中高难度需要同时记忆多个单词，建议分别记住每个单词的形状",
            "善用暂停功能，给自己思考和回忆的时间",
            "连错了不要紧，系统会自动重置，可以重新尝试"
        ],

        // 难度说明
        difficulty: [
            "简单：3-4个字母，闪现速度慢，无限次机会",
            "中等：5-6个字母，闪现速度适中，3次机会",
            "困难：7-8个字母，闪现速度快，2次机会"
        ]
    },

    // 游戏设置
    gameSettings: {
        // 是否启用背景音乐
        enableBackgroundMusic: true,
        // 是否启用音效
        enableSoundEffects: true,
        // 是否自动朗读单词
        enableWordSpeak: true,
        // 是否显示单词例句弹窗
        enableWordExample: true
    },

    // 开发者信息
    developer: {
        // 制作者信息（显示在首页底部）
        author: "泡泡妈学AI",
        // 公众号或网站
        website: "公众号：泡泡妈学AI"
    }
};

// 应用配置到页面
window.addEventListener('DOMContentLoaded', function() {
    // 更新游戏标题
    const titleElement = document.getElementById('gameTitle');
    if (titleElement) {
        titleElement.textContent = GAME_CONFIG.title;
    }

    // 更新页面标题
    document.title = GAME_CONFIG.title;

    // 更新Logo卡片
    // 第2张卡片
    const card2 = document.querySelector('.logo-cards .logo-card:nth-child(2) .logo-card-face.logo-card-back div');
    if (card2 && GAME_CONFIG.logoCards.card2) {
        card2.textContent = GAME_CONFIG.logoCards.card2.content;
        if (GAME_CONFIG.logoCards.card2.style) {
            card2.setAttribute('style', `font-size: 30px; font-weight: bold; ${GAME_CONFIG.logoCards.card2.style}`);
        }
    }

    // 第3张卡片
    const card3 = document.querySelector('.logo-cards .logo-card:nth-child(3) .logo-card-face.logo-card-back div');
    if (card3 && GAME_CONFIG.logoCards.card3) {
        card3.textContent = GAME_CONFIG.logoCards.card3.content;
        if (GAME_CONFIG.logoCards.card3.style) {
            card3.setAttribute('style', `font-size: 30px; font-weight: bold; ${GAME_CONFIG.logoCards.card3.style}`);
        }
    }
});