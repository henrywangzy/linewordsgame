/**
 * 连线单词游戏核心逻辑
 */

// 游戏状态管理
const LineGame = {
    // 游戏配置
    config: {
        gridCols: 6,
        gridRows: 7,  // 改为7行以适应手机屏幕
        observeSpeed: 800, // 字母显示时间（毫秒）
        observeInterval: 200, // 字母间隔时间
    },

    // 游戏状态
    state: {
        currentGrade: 1,
        currentDifficulty: 'medium',
        currentWords: [], // 当前要记忆的单词组
        currentWordIndex: 0,
        wordList: [],
        paths: [], // 所有单词的路径
        userPaths: [], // 用户连线路径
        currentDrawingWordIndex: 0, // 当前正在连线的单词索引
        phase: 'ready', // ready | observe | draw | result
        score: 0,
        combo: 0,
        attempts: 0,
        maxAttempts: 3,
        wordsCompleted: 0,
        totalWords: 10,
        wordsPerRound: 1, // 每轮需要记忆的单词数
        isDrawing: false,
        startCell: null,
        errorSteps: 0, // 错误步骤数累计
        startTime: null, // 游戏开始时间
        timerInterval: null, // 计时器interval
        isPaused: false, // 游戏是否暂停
        pausedTime: 0, // 累计暂停时间
        pauseStartTime: null, // 暂停开始时间
        observeTaskId: 0, // 观察任务ID，用于取消上一次的观察
    },

    // 初始化游戏
    init(grade, difficulty) {
        console.log('初始化连线游戏:', { grade, difficulty });

        this.state.currentGrade = grade;
        this.state.currentDifficulty = difficulty;
        this.state.score = 0;
        this.state.combo = 0;
        this.state.wordsCompleted = 0;
        this.state.currentWordIndex = 0;
        this.state.errorSteps = 0;

        // 启动计时器
        this.startTimer();

        // 设置难度参数
        this.setupDifficulty(difficulty);

        // 获取单词列表
        this.state.wordList = this.getRandomWords(grade, this.state.totalWords);

        // 确保状态栏可见
        const statusBar = document.getElementById('lineStatusBar');
        if (statusBar) {
            statusBar.style.display = 'flex';
        }

        // 创建网格
        this.createGrid();

        // 更新UI
        this.updateStats();

        // 开始第一轮
        this.nextRound();
    },

    // 设置难度参数
    setupDifficulty(difficulty) {
        switch(difficulty) {
            case 'easy':
                this.state.wordsPerRound = 1; // 初级：一次记忆1个单词
                this.config.observeSpeed = 1000;
                this.config.observeInterval = 300;
                this.state.maxAttempts = 999;
                break;
            case 'medium':
                this.state.wordsPerRound = 2; // 中级：一次记忆2个单词
                this.config.observeSpeed = 800;
                this.config.observeInterval = 200;
                this.state.maxAttempts = 3;
                break;
            case 'hard':
                this.state.wordsPerRound = 3; // 高级：一次记忆3个单词
                this.config.observeSpeed = 600;
                this.config.observeInterval = 100;
                this.state.maxAttempts = 2;
                break;
        }
    },

    // 获取随机单词
    getRandomWords(grade, count) {
        const words = wordDatabase[grade] || wordDatabase[1];
        const shuffled = [...words].sort(() => Math.random() - 0.5);

        // 根据难度筛选单词长度
        let filtered = shuffled;
        if (this.state.currentDifficulty === 'easy') {
            filtered = shuffled.filter(w => w.word.length <= 4);
        } else if (this.state.currentDifficulty === 'medium') {
            filtered = shuffled.filter(w => w.word.length >= 4 && w.word.length <= 6);
        } else {
            filtered = shuffled.filter(w => w.word.length >= 5);
        }

        // 如果筛选后数量不足，使用原列表
        if (filtered.length < count) {
            filtered = shuffled;
        }

        return filtered.slice(0, count);
    },

    // 创建网格
    createGrid() {
        const grid = document.getElementById('lineGrid');
        grid.innerHTML = '';

        for (let row = 0; row < this.config.gridRows; row++) {
            for (let col = 0; col < this.config.gridCols; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.index = row * this.config.gridCols + col;

                // 添加事件监听
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                cell.addEventListener('touchstart', (e) => this.handleTouchStart(e));
                cell.addEventListener('touchmove', (e) => this.handleTouchMove(e));
                cell.addEventListener('touchend', (e) => this.handleTouchEnd(e));

                grid.appendChild(cell);
            }
        }
    },

    // 下一轮游戏
    nextRound() {
        if (this.state.currentWordIndex >= this.state.wordList.length) {
            this.gameOver();
            return;
        }

        // 获取本轮需要记忆的单词
        this.state.currentWords = [];
        this.state.paths = [];
        this.state.userPaths = [];

        const wordsNeeded = Math.min(
            this.state.wordsPerRound,
            this.state.wordList.length - this.state.currentWordIndex
        );

        for (let i = 0; i < wordsNeeded; i++) {
            this.state.currentWords.push(
                this.state.wordList[this.state.currentWordIndex + i]
            );
            this.state.userPaths.push([]);
        }

        this.state.attempts = 0;
        this.state.currentDrawingWordIndex = 0;

        // 更新显示
        this.updateWordDisplay();

        // 生成所有单词的路径（确保不重叠）
        this.generateAllPaths();

        // 开始观察阶段
        this.startObservePhase();
    },

    // 更新单词显示
    updateWordDisplay() {
        const wordInfoEl = document.getElementById('currentWordInfo');
        if (wordInfoEl) {
            if (this.state.currentWords.length === 1) {
                // 单个单词
                const word = this.state.currentWords[0];
                wordInfoEl.textContent = `${word.word} · ${word.chinese}`;
            } else {
                // 多个单词
                const wordList = this.state.currentWords
                    .map((w, i) => `${i+1}. ${w.word}`)
                    .join(' ');
                wordInfoEl.textContent = wordList;
            }
        }
    },

    // 下一个单词（用于完成后跳转）
    nextWord() {
        // 清除所有显示和连线
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'grid-cell';
        });

        const svg = document.getElementById('lineSvgLayer');
        svg.querySelectorAll('path').forEach(p => p.remove());

        this.state.currentWordIndex += this.state.wordsPerRound;
        this.nextRound();
    },

    // 生成所有单词的路径（确保不重叠）
    generateAllPaths() {
        const totalCells = this.config.gridRows * this.config.gridCols;
        let allUsedCells = new Set();
        this.state.paths = [];

        for (let wordIndex = 0; wordIndex < this.state.currentWords.length; wordIndex++) {
            const word = this.state.currentWords[wordIndex].word.toUpperCase();
            let path = null;
            let attempts = 0;
            const maxAttempts = 100;

            // 尝试生成不重叠的路径
            while (!path && attempts < maxAttempts) {
                attempts++;
                path = this.generateSinglePath(word, allUsedCells);
            }

            if (!path) {
                console.error('无法生成不重叠的路径，重新开始');
                // 如果无法生成，清空已用格子重试
                allUsedCells.clear();
                this.state.paths = [];
                wordIndex = -1; // 重新开始
                continue;
            }

            this.state.paths.push(path);
            // 将此路径的格子加入已使用集合
            path.forEach(index => allUsedCells.add(index));
        }
    },

    // 生成单个单词的路径
    generateSinglePath(word, usedCells) {
        const totalCells = this.config.gridRows * this.config.gridCols;

        // 找出所有可用的起点
        let availableStarts = [];
        for (let i = 0; i < totalCells; i++) {
            if (!usedCells.has(i)) {
                availableStarts.push(i);
            }
        }

        if (availableStarts.length === 0) return null;

        // 随机选择起点
        const startIndex = availableStarts[Math.floor(Math.random() * availableStarts.length)];
        let path = [startIndex];
        let tempUsedCells = new Set(usedCells);
        tempUsedCells.add(startIndex);

        // 生成路径
        for (let i = 1; i < word.length; i++) {
            let neighbors = this.getNeighbors(path[path.length - 1]);
            neighbors = neighbors.filter(n => !tempUsedCells.has(n));

            if (neighbors.length === 0) {
                // 如果无路可走，返回null表示失败
                return null;
            }

            const nextIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
            path.push(nextIndex);
            tempUsedCells.add(nextIndex);
        }

        return path;
    },

    // 获取相邻格子
    getNeighbors(index) {
        const row = Math.floor(index / this.config.gridCols);
        const col = index % this.config.gridCols;
        const neighbors = [];

        // 上
        if (row > 0) neighbors.push((row - 1) * this.config.gridCols + col);
        // 下
        if (row < this.config.gridRows - 1) neighbors.push((row + 1) * this.config.gridCols + col);
        // 左
        if (col > 0) neighbors.push(row * this.config.gridCols + col - 1);
        // 右
        if (col < this.config.gridCols - 1) neighbors.push(row * this.config.gridCols + col + 1);

        return neighbors;
    },

    // 开始观察阶段
    startObservePhase() {
        if (this.state.isPaused) return;

        // 增加任务ID，用于取消上一次的观察任务
        this.state.observeTaskId++;

        this.state.phase = 'observe';
        this.updatePhase('👀 观察阶段');
        document.getElementById('gameHint').textContent = '请仔细观察字母出现的顺序...';

        // 隐藏提示按钮
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.style.display = 'none';
        }

        // 清除所有格子状态
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.className = 'grid-cell';
            cell.textContent = '';
        });

        // 清除SVG连线
        const svg = document.getElementById('lineSvgLayer');
        svg.querySelectorAll('path').forEach(p => p.remove());

        // 依次显示所有单词
        this.showAllWords();
    },

    // 显示所有单词
    async showAllWords() {
        const cells = document.querySelectorAll('.grid-cell');
        const currentTaskId = this.state.observeTaskId;

        // 依次显示每个单词
        for (let wordIndex = 0; wordIndex < this.state.currentWords.length; wordIndex++) {
            // 检查是否被取消（新的任务已开始）
            if (currentTaskId !== this.state.observeTaskId) {
                return;
            }

            // 如果暂停，等待恢复
            while (this.state.isPaused && currentTaskId === this.state.observeTaskId) {
                await this.sleep(100);
            }

            // 再次检查是否被取消
            if (currentTaskId !== this.state.observeTaskId) {
                return;
            }

            const word = this.state.currentWords[wordIndex].word.toUpperCase();
            const path = this.state.paths[wordIndex];

            // 朗读单词
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                speechSynthesis.speak(utterance);
            }

            // 显示单词编号
            if (this.state.currentWords.length > 1) {
                document.getElementById('gameHint').textContent =
                    `正在显示第 ${wordIndex + 1} 个单词: ${word}`;
            }

            // 显示该单词的字母
            for (let i = 0; i < path.length; i++) {
                // 检查是否被取消
                if (currentTaskId !== this.state.observeTaskId) {
                    return;
                }

                // 如果暂停，等待恢复
                while (this.state.isPaused && currentTaskId === this.state.observeTaskId) {
                    await this.sleep(100);
                }

                // 再次检查是否被取消
                if (currentTaskId !== this.state.observeTaskId) {
                    return;
                }

                const cell = cells[path[i]];
                cell.classList.add('showing');
                cell.textContent = word[i];

                // 播放音效
                this.playSound('ding');

                await this.sleep(this.config.observeSpeed);

                cell.classList.remove('showing');
                cell.textContent = '';

                if (i < path.length - 1) {
                    await this.sleep(this.config.observeInterval);
                }
            }

            // 单词之间的间隔
            if (wordIndex < this.state.currentWords.length - 1) {
                await this.sleep(1000);
            }
        }

        // 只有任务没被取消才进入连线阶段
        if (currentTaskId === this.state.observeTaskId) {
            this.startDrawPhase();
        }
    },

    // 开始连线阶段
    startDrawPhase() {
        this.state.phase = 'draw';
        this.state.currentDrawingWordIndex = 0;
        this.state.userPaths = this.state.currentWords.map(() => []);
        this.updatePhase('✏️ 连线阶段');

        // 清除所有格子的内容（观察阶段的残留）
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('showing');
        });

        // 显示提示按钮
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.style.display = 'inline-block';
        }

        // 显示当前需要连接的单词
        if (this.state.currentWords.length > 1) {
            const word = this.state.currentWords[this.state.currentDrawingWordIndex];
            document.getElementById('gameHint').textContent = `请连接第1个单词: ${word.word}`;
        } else {
            document.getElementById('gameHint').textContent = '请按记忆的路径连接字母';
        }

        // 不再高亮起点，让玩家凭记忆开始
        // const cells = document.querySelectorAll('.grid-cell');
        // cells[this.state.path[0]].classList.add('highlight');

        this.playSound('ready');
    },

    // 处理格子点击
    handleCellClick(e) {
        if (this.state.phase !== 'draw' || this.state.isPaused) return;

        const cell = e.target;
        const index = parseInt(cell.dataset.index);

        // 获取当前单词的路径和用户路径
        const currentPath = this.state.paths[this.state.currentDrawingWordIndex];
        const currentUserPath = this.state.userPaths[this.state.currentDrawingWordIndex];

        if (currentUserPath.length === 0) {
            // 第一次点击，必须是起点
            if (index === currentPath[0]) {
                this.addToPath(index);
            } else {
                this.showError(cell);
            }
        } else {
            // 检查是否是正确的下一个格子
            const expectedIndex = currentPath[currentUserPath.length];
            if (index === expectedIndex) {
                this.addToPath(index);
            } else {
                this.showError(cell);
                this.resetUserPath();
            }
        }
    },

    // 添加到用户路径
    addToPath(index) {
        const cells = document.querySelectorAll('.grid-cell');
        const cell = cells[index];
        const currentWord = this.state.currentWords[this.state.currentDrawingWordIndex];
        const word = currentWord.word.toUpperCase();
        const currentUserPath = this.state.userPaths[this.state.currentDrawingWordIndex];
        const currentPath = this.state.paths[this.state.currentDrawingWordIndex];

        // 显示字母
        cell.classList.add('correct');
        cell.textContent = word[currentUserPath.length];

        // 画连线
        if (currentUserPath.length > 0) {
            this.drawLine(currentUserPath[currentUserPath.length - 1], index);
        }

        this.state.userPaths[this.state.currentDrawingWordIndex].push(index);

        // 播放音效
        this.playSound('correct');

        // 检查当前单词是否完成
        if (this.state.userPaths[this.state.currentDrawingWordIndex].length === currentPath.length) {
            this.onSingleWordComplete();
        }
    },

    // 单个单词完成
    onSingleWordComplete() {
        const currentWord = this.state.currentWords[this.state.currentDrawingWordIndex];

        // 如果还有更多单词要连接
        if (this.state.currentDrawingWordIndex < this.state.currentWords.length - 1) {
            // 显示成功提示
            document.getElementById('gameHint').textContent =
                `✅ ${currentWord.word} 完成！继续下一个单词...`;

            // 延迟后开始下一个单词
            setTimeout(() => {
                // 标记当前单词的路径为已完成（保留显示和字母）
                const cells = document.querySelectorAll('.grid-cell');
                const completedWord = this.state.currentWords[this.state.currentDrawingWordIndex].word.toUpperCase();
                this.state.userPaths[this.state.currentDrawingWordIndex].forEach((cellIndex, i) => {
                    cells[cellIndex].classList.remove('correct');
                    cells[cellIndex].classList.add('completed-word');
                    // 保持字母显示
                    cells[cellIndex].textContent = completedWord[i];
                });

                // 给当前单词的连线添加已完成标记（但不删除）
                const svg = document.getElementById('lineSvgLayer');
                const paths = svg.querySelectorAll('path');
                paths.forEach(p => {
                    p.classList.add('completed-line');
                    p.style.opacity = '0.5';
                });

                // 进入下一个单词
                this.state.currentDrawingWordIndex++;
                const nextWord = this.state.currentWords[this.state.currentDrawingWordIndex];
                document.getElementById('gameHint').textContent =
                    `请连接第${this.state.currentDrawingWordIndex + 1}个单词: ${nextWord.word}`;
            }, 1500);
        } else {
            // 所有单词都完成了
            this.onWordComplete();
        }
    },

    // 显示错误
    showError(cell) {
        cell.classList.add('error');
        this.playSound('wrong');

        // 累加错误步骤数
        this.state.errorSteps++;
        this.updateErrorSteps();

        setTimeout(() => {
            cell.classList.remove('error');
        }, 300);

        this.state.attempts++;
        if (this.state.attempts >= this.state.maxAttempts) {
            this.showCorrectPath();
        }
    },

    // 重置用户路径
    resetUserPath() {
        const cells = document.querySelectorAll('.grid-cell');
        const currentUserPath = this.state.userPaths[this.state.currentDrawingWordIndex] || [];

        currentUserPath.forEach(index => {
            cells[index].classList.remove('correct');
            cells[index].textContent = '';
        });

        // 只清除当前单词的连线（不是已完成的）
        const svg = document.getElementById('lineSvgLayer');
        svg.querySelectorAll('path:not(.completed-line)').forEach(p => p.remove());

        this.state.userPaths[this.state.currentDrawingWordIndex] = [];

        // 不再高亮起点
        // cells[this.state.path[0]].classList.add('highlight');

        // 更新提示
        document.getElementById('gameHint').textContent = '再试一次，你可以的！';
    },

    // 显示正确路径
    showCorrectPath() {
        const cells = document.querySelectorAll('.grid-cell');
        const currentWord = this.state.currentWords[this.state.currentDrawingWordIndex];
        const word = currentWord.word.toUpperCase();
        const currentPath = this.state.paths[this.state.currentDrawingWordIndex];

        currentPath.forEach((index, i) => {
            cells[index].classList.add('correct');
            cells[index].textContent = word[i];

            if (i > 0) {
                this.drawLine(this.state.path[i - 1], index);
            }
        });

        document.getElementById('gameHint').textContent = '这是正确路径，记住它！';

        // 显示操作按钮
        setTimeout(() => {
            const hintEl = document.getElementById('gameHint');
            hintEl.innerHTML = `
                <button onclick="LineGame.resetUserPath(); LineGame.state.phase='draw'; LineGame.updatePhase('✏️ 连线阶段')"
                    style="margin: 0 5px; padding: 8px 20px; background: #667eea; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 14px;">
                    重试
                </button>
                <button onclick="LineGame.state.currentWordIndex++; LineGame.nextWord();"
                    style="margin: 0 5px; padding: 8px 20px; background: #4CAF50; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 14px;">
                    跳过
                </button>
            `;
        }, 2000);
    },

    // 单词完成
    onWordComplete() {
        this.state.phase = 'result';
        this.updatePhase('🎉 完成！');

        // 在提示区显示继续按钮（作为备用）
        const hintEl = document.getElementById('gameHint');
        hintEl.innerHTML = `
            <span>太棒了！</span>
            <button onclick="if(window.LineGame && LineGame.state) { LineGame.state.currentWordIndex++; LineGame.nextWord(); }"
                style="margin-left: 10px; padding: 5px 15px; background: #4CAF50; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 14px;">
                继续下一个
            </button>
        `;

        // 计算得分
        const baseScore = 100;
        const comboBonus = this.state.combo * 10;
        const attemptBonus = this.state.attempts === 0 ? 50 : 0;
        const totalScore = baseScore + comboBonus + attemptBonus;

        this.state.score += totalScore;
        this.state.combo++;
        this.state.wordsCompleted++;

        // 更新统计
        this.updateStats();

        // 更新完成单词计数器
        const wordCount = document.getElementById('wordCount');
        if (wordCount) {
            wordCount.textContent = this.state.wordsCompleted;
        }

        // 显示单词卡片（显示所有当前回合的单词）
        if (this.state.currentWords && this.state.currentWords.length > 0) {
            if (this.state.currentWords.length === 1) {
                // 单个单词，显示完整信息
                showWordExample(this.state.currentWords[0]);
            } else {
                // 多个单词，显示紧凑版本
                showMultipleWordExamples(this.state.currentWords);
            }
        }

        // 播放成功音效
        this.playSound('success');

        // 不再自动进入下一个单词，等待用户点击继续按钮
    },

    // 绘制连线
    drawLine(fromIndex, toIndex) {
        const cells = document.querySelectorAll('.grid-cell');
        const fromCell = cells[fromIndex];
        const toCell = cells[toIndex];

        // 获取格子在网格中的位置
        const fromRow = Math.floor(fromIndex / this.config.gridCols);
        const fromCol = fromIndex % this.config.gridCols;
        const toRow = Math.floor(toIndex / this.config.gridCols);
        const toCol = toIndex % this.config.gridCols;

        // 计算SVG坐标（基于格子大小和间距）
        const cellSize = 50;  // 格子大小
        const gap = 5;        // 间距

        const x1 = fromCol * (cellSize + gap) + cellSize / 2;
        const y1 = fromRow * (cellSize + gap) + cellSize / 2;
        const x2 = toCol * (cellSize + gap) + cellSize / 2;
        const y2 = toRow * (cellSize + gap) + cellSize / 2;

        const svg = document.getElementById('lineSvgLayer');

        // 设置SVG视图大小
        const gridWidth = this.config.gridCols * (cellSize + gap);
        const gridHeight = this.config.gridRows * (cellSize + gap);
        svg.setAttribute('viewBox', `0 0 ${gridWidth} ${gridHeight}`);
        svg.style.width = '100%';
        svg.style.height = '100%';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1},${y1} L ${x2},${y2}`);
        path.setAttribute('class', 'connection-line');
        path.setAttribute('stroke', '#667eea');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.8');

        svg.appendChild(path);
    },

    // 更新阶段显示
    updatePhase(text) {
        const badge = document.getElementById('phaseBadge');
        if (!badge) {
            console.log('阶段:', text);
            return;
        }

        badge.textContent = text;

        // 根据阶段改变颜色
        if (text.includes('观察')) {
            badge.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        } else if (text.includes('连线')) {
            badge.style.background = 'linear-gradient(135deg, #66BB6A, #4CAF50)';
        } else if (text.includes('完成')) {
            badge.style.background = 'linear-gradient(135deg, #FFB74D, #FF9800)';
        }
    },

    // 更新统计
    updateStats() {
        document.getElementById('scoreValue').textContent = this.state.score;
        document.getElementById('stat1Value').textContent = `×${this.state.combo}`;
        document.getElementById('stat2Value').textContent =
            `${this.state.wordsCompleted + 1}/${this.state.totalWords}`;

        // 更新完成单词计数器
        const wordCount = document.getElementById('wordCount');
        if (wordCount) {
            wordCount.textContent = this.state.wordsCompleted;
        }

        // 更新错误步骤数
        this.updateErrorSteps();
    },

    // 更新错误步骤数显示
    updateErrorSteps() {
        const errorStepsEl = document.getElementById('errorStepsValue');
        if (errorStepsEl) {
            errorStepsEl.textContent = this.state.errorSteps;
        }
    },

    // 启动计时器
    startTimer() {
        // 清除旧的计时器
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }

        this.state.startTime = Date.now();

        // 立即更新一次
        this.updateTimer();

        // 每秒更新
        this.state.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    },

    // 更新计时器显示
    updateTimer() {
        if (!this.state.startTime || this.state.isPaused) return;

        const elapsed = Math.floor((Date.now() - this.state.startTime - this.state.pausedTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        const timerEl = document.getElementById('timerValue');
        if (timerEl) {
            timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    },

    // 停止计时器
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    },

    // 切换暂停状态
    togglePause() {
        this.state.isPaused = !this.state.isPaused;

        if (this.state.isPaused) {
            // 记录暂停开始时间
            this.state.pauseStartTime = Date.now();

            // 停止计时器更新
            if (this.state.timerInterval) {
                clearInterval(this.state.timerInterval);
            }
        } else {
            // 计算暂停时长并累加
            if (this.state.pauseStartTime) {
                this.state.pausedTime += Date.now() - this.state.pauseStartTime;
                this.state.pauseStartTime = null;
            }

            // 恢复计时器
            this.state.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 1000);

            // 立即更新一次
            this.updateTimer();
        }

        return this.state.isPaused;
    },

    // 游戏结束
    gameOver() {
        // 显示游戏结束界面
        // 停止计时器
        this.stopTimer();

        document.getElementById('finalScore').textContent = this.state.score;
        document.getElementById('wordsLearned').textContent = this.state.wordsCompleted;
        document.getElementById('accuracyRate').textContent =
            Math.round((this.state.wordsCompleted / this.state.totalWords) * 100) + '%';

        showScreen('gameOverScreen');
    },

    // 触摸事件处理
    handleTouchStart(e) {
        if (this.state.phase !== 'draw' || this.state.isPaused) return;
        e.preventDefault();

        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (cell && cell.classList.contains('grid-cell')) {
            this.handleCellClick({ target: cell });
            this.state.isDrawing = true;
        }
    },

    handleTouchMove(e) {
        if (!this.state.isDrawing || this.state.isPaused) return;
        e.preventDefault();

        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (cell && cell.classList.contains('grid-cell')) {
            const index = parseInt(cell.dataset.index);
            const currentPath = this.state.paths[this.state.currentDrawingWordIndex];
            const currentUserPath = this.state.userPaths[this.state.currentDrawingWordIndex];
            const expectedIndex = currentPath[currentUserPath.length];

            if (index === expectedIndex && !currentUserPath.includes(index)) {
                this.addToPath(index);
            }
        }
    },

    handleTouchEnd(e) {
        this.state.isDrawing = false;
    },

    // 播放音效
    playSound(type) {
        // 简单的音效实现
        const audio = new Audio();
        switch(type) {
            case 'ding':
                // 使用Web Audio API创建简单音效
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;

            case 'correct':
                // 正确音效
                break;
            case 'wrong':
                // 错误音效
                break;
            case 'success':
                // 成功音效
                break;
            case 'ready':
                // 准备音效
                break;
        }
    },

    // 辅助函数：延迟
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// 导出给全局使用
window.LineGame = LineGame;