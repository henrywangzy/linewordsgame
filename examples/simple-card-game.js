/**
 * 简单卡片游戏示例
 * 这是一个基于模板的简单实现示例
 * 演示如何使用通用框架创建自己的游戏
 */

// 游戏全局变量
let simpleGame = null;

/**
 * 简单卡片游戏类
 */
class SimpleCardGame {
    constructor(grade, difficulty) {
        this.grade = grade;
        this.difficulty = difficulty;
        this.score = 0;
        this.currentWord = null;
        this.options = [];
        this.timer = null;

        this.init();
    }

    init() {
        // 获取单词数据
        this.words = wordDatabase[this.grade] || wordDatabase[1];

        // 创建游戏界面
        this.createGameBoard();

        // 开始第一轮
        this.nextRound();
    }

    createGameBoard() {
        const gameArea = document.getElementById('gameMainArea');
        gameArea.innerHTML = `
            <div style="width: 100%; max-width: 350px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #333; margin-bottom: 10px;">选择正确的中文意思</h2>
                    <div id="targetWord" style="font-size: 32px; font-weight: bold; color: #2196F3; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                        <!-- 目标单词 -->
                    </div>
                </div>

                <div id="optionsContainer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                    <!-- 选项卡片 -->
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <div style="font-size: 18px; color: #666;">
                        得分: <span id="gameScore" style="color: #4CAF50; font-weight: bold;">0</span>
                    </div>
                </div>
            </div>
        `;
    }

    nextRound() {
        // 随机选择一个单词
        const randomIndex = Math.floor(Math.random() * this.words.length);
        this.currentWord = this.words[randomIndex];

        // 显示英文单词
        document.getElementById('targetWord').textContent = this.currentWord.word;

        // 播放单词发音
        if (typeof speakWord === 'function') {
            speakWord(this.currentWord.word);
        }

        // 生成选项（1个正确答案 + 3个错误答案）
        this.generateOptions();

        // 显示选项
        this.displayOptions();
    }

    generateOptions() {
        this.options = [];

        // 添加正确答案
        this.options.push({
            text: this.currentWord.chinese,
            isCorrect: true
        });

        // 添加3个错误答案
        const wrongWords = this.words.filter(w => w.chinese !== this.currentWord.chinese);
        for (let i = 0; i < 3; i++) {
            if (wrongWords.length > 0) {
                const randomWrong = wrongWords[Math.floor(Math.random() * wrongWords.length)];
                this.options.push({
                    text: randomWrong.chinese,
                    isCorrect: false
                });
                // 从数组中移除已选择的错误答案，避免重复
                wrongWords.splice(wrongWords.indexOf(randomWrong), 1);
            }
        }

        // 打乱选项顺序
        this.options.sort(() => Math.random() - 0.5);
    }

    displayOptions() {
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';

        this.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.style.cssText = `
                padding: 15px;
                font-size: 18px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                background: white;
                cursor: pointer;
                transition: all 0.3s;
            `;
            button.textContent = option.text;

            // 鼠标悬停效果
            button.onmouseover = () => {
                button.style.background = '#f5f5f5';
                button.style.borderColor = '#2196F3';
            };
            button.onmouseout = () => {
                button.style.background = 'white';
                button.style.borderColor = '#e0e0e0';
            };

            // 点击事件
            button.onclick = () => this.checkAnswer(option, button);

            container.appendChild(button);
        });
    }

    checkAnswer(option, button) {
        // 禁用所有按钮
        const buttons = document.querySelectorAll('#optionsContainer button');
        buttons.forEach(btn => btn.disabled = true);

        if (option.isCorrect) {
            // 正确答案
            button.style.background = '#4CAF50';
            button.style.color = 'white';
            button.style.borderColor = '#4CAF50';

            // 增加分数
            this.score += 10;
            document.getElementById('gameScore').textContent = this.score;

            // 更新主界面分数
            document.getElementById('scoreValue').textContent = this.score;

            // 显示单词例句弹窗
            if (typeof showWordExample === 'function') {
                showWordExample(this.currentWord);
            }

            // 2秒后进入下一轮
            setTimeout(() => this.nextRound(), 2000);

        } else {
            // 错误答案
            button.style.background = '#f44336';
            button.style.color = 'white';
            button.style.borderColor = '#f44336';

            // 显示正确答案
            buttons.forEach(btn => {
                if (btn.textContent === this.currentWord.chinese) {
                    btn.style.background = '#4CAF50';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#4CAF50';
                }
            });

            // 3秒后进入下一轮
            setTimeout(() => this.nextRound(), 3000);
        }
    }

    pause() {
        // 暂停游戏逻辑
        clearTimeout(this.timer);
    }

    resume() {
        // 继续游戏逻辑
    }

    restart() {
        // 重新开始
        this.score = 0;
        document.getElementById('gameScore').textContent = this.score;
        document.getElementById('scoreValue').textContent = this.score;
        this.nextRound();
    }
}

/**
 * 游戏初始化函数（覆盖模板中的函数）
 */
function initializeGame(grade, difficulty) {
    console.log('启动简单卡片游戏');

    // 更新UI显示
    document.getElementById('gradeInfo').textContent = `${grade}年级`;
    document.getElementById('difficultyInfo').textContent =
        difficulty === 'easy' ? '简单' :
        difficulty === 'medium' ? '中等' : '困难';

    // 创建游戏实例
    simpleGame = new SimpleCardGame(grade, difficulty);
}

/**
 * 重新开始游戏（覆盖模板中的函数）
 */
function restartGame() {
    if (simpleGame) {
        simpleGame.restart();
    }
}

/**
 * 暂停游戏处理
 */
function onGamePause() {
    if (simpleGame) {
        simpleGame.pause();
    }
}

/**
 * 继续游戏处理
 */
function onGameResume() {
    if (simpleGame) {
        simpleGame.resume();
    }
}

// 导出说明
console.log('简单卡片游戏示例已加载');
console.log('使用方法：将此文件的代码复制到 index.html 的 <script> 部分');
console.log('或者在 index.html 中添加: <script src="examples/simple-card-game.js"></script>');