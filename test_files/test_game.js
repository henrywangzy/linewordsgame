const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('启动测试...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();

    // 监听控制台输出
    page.on('console', msg => {
        console.log('浏览器控制台:', msg.type(), msg.text());
    });

    // 监听页面错误
    page.on('pageerror', err => {
        console.error('页面错误:', err.message);
    });

    // 打开游戏页面
    const filePath = path.join(__dirname, '..', 'index.html');
    await page.goto(`file:///${filePath.replace(/\\/g, '/')}`);

    console.log('页面已加载');

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    // 检查页面标题
    const title = await page.title();
    console.log('页面标题:', title);

    // 检查游戏网格是否存在
    const gridExists = await page.locator('.line-grid').count();
    console.log('网格数量:', gridExists);

    // 检查单词展示区是否存在
    const wordDisplayExists = await page.locator('.word-display-area').count();
    console.log('单词展示区数量:', wordDisplayExists);

    // 检查"观察阶段"按钮是否存在
    const observeBtn = await page.locator('text=观察阶段').first();
    console.log('观察阶段按钮是否可见:', await observeBtn.isVisible());

    // 点击"观察阶段"按钮
    console.log('点击观察阶段按钮...');
    await observeBtn.click();

    // 等待观察阶段开始
    await page.waitForTimeout(1000);

    // 检查网格是否有字母显示
    const cells = await page.locator('.grid-cell').all();
    console.log('网格单元格数量:', cells.length);

    // 检查前几个格子的内容
    for (let i = 0; i < Math.min(5, cells.length); i++) {
        const text = await cells[i].textContent();
        console.log(`格子 ${i} 内容:`, text || '(空)');
    }

    // 检查例句展示区内容
    await page.waitForTimeout(2000);
    const exampleEnglish = await page.locator('#exampleEnglish').textContent();
    const exampleChinese = await page.locator('#exampleChinese').textContent();

    console.log('英文例句:', exampleEnglish);
    console.log('中文例句:', exampleChinese);

    // 检查语音合成是否可用
    const speechSupport = await page.evaluate(() => {
        return 'speechSynthesis' in window;
    });
    console.log('浏览器支持语音合成:', speechSupport);

    // 检查当前语音状态
    const speechStatus = await page.evaluate(() => {
        return {
            speaking: window.speechSynthesis.speaking,
            pending: window.speechSynthesis.pending,
            paused: window.speechSynthesis.paused
        };
    });
    console.log('语音状态:', speechStatus);

    // 等待一段时间观察
    console.log('等待10秒观察游戏运行...');
    await page.waitForTimeout(10000);

    // 截图
    await page.screenshot({ path: path.join(__dirname, 'screenshot.png'), fullPage: true });
    console.log('截图已保存');

    // 关闭浏览器
    await browser.close();
    console.log('测试完成');
})();