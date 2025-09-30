const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 }
    });
    const page = await context.newPage();

    // 监听所有日志
    page.on('console', msg => console.log('🔵', msg.text()));
    page.on('pageerror', err => console.error('🔴 错误:', err.message));

    const filePath = path.join(__dirname, '..', 'index.html');
    await page.goto(`file:///${filePath.replace(/\\/g, '/')}`);

    console.log('\n=== 1. 检查页面元素 ===');
    await page.waitForTimeout(1000);

    const hasGrid = await page.locator('.line-grid').count() > 0;
    const hasBtn = await page.locator('text=观察阶段').count() > 0;
    console.log('网格存在:', hasGrid);
    console.log('观察按钮存在:', hasBtn);

    console.log('\n=== 2. 检查 LineGame 对象 ===');
    const gameCheck = await page.evaluate(() => {
        return {
            exists: typeof LineGame !== 'undefined',
            currentWords: LineGame?.state?.currentWords?.length || 0,
            phase: LineGame?.state?.phase
        };
    });
    console.log('游戏对象:', gameCheck);

    console.log('\n=== 3. 点击观察阶段按钮 ===');
    await page.click('text=观察阶段');
    await page.waitForTimeout(1000);

    console.log('\n=== 4. 检查观察阶段状态 ===');
    const afterClick = await page.evaluate(() => {
        return {
            phase: LineGame?.state?.phase,
            currentWords: LineGame?.state?.currentWords?.length || 0,
            speechSynthesis: 'speechSynthesis' in window,
            speaking: window.speechSynthesis?.speaking || false
        };
    });
    console.log('观察后状态:', afterClick);

    console.log('\n=== 5. 检查例句显示 ===');
    await page.waitForTimeout(2000);
    const examples = await page.evaluate(() => {
        const eng = document.getElementById('exampleEnglish')?.textContent || '';
        const chn = document.getElementById('exampleChinese')?.textContent || '';
        return { english: eng, chinese: chn };
    });
    console.log('例句:', examples);

    console.log('\n=== 6. 手动调用 speakAllWords ===');
    const speakResult = await page.evaluate(() => {
        try {
            console.log('调用 speakAllWords...');
            LineGame.speakAllWords();
            return { success: true, error: null };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });
    console.log('朗读调用结果:', speakResult);

    await page.waitForTimeout(3000);

    console.log('\n=== 7. 截图保存 ===');
    await page.screenshot({ path: path.join(__dirname, 'debug.png'), fullPage: true });

    await browser.close();
    console.log('\n测试完成');
})();