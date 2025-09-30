const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 200
    });

    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        permissions: ['microphone']  // 授予权限
    });

    const page = await context.newPage();

    // 监听所有消息
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.error('❌', text);
        } else if (text.includes('朗读') || text.includes('speak') || text.includes('speech')) {
            console.log('🔊', text);
        } else {
            console.log('📝', text);
        }
    });

    page.on('pageerror', err => console.error('💥 页面错误:', err.message));

    const filePath = path.join(__dirname, '..', 'index.html');
    await page.goto(`file:///${filePath.replace(/\\/g, '/')}`);

    console.log('\n✅ 页面已加载\n');
    await page.waitForTimeout(2000);

    // 点击"开始游戏"按钮
    console.log('>>> 点击"开始游戏"按钮...\n');
    await page.click('text=🎮 开始游戏');
    await page.waitForTimeout(3000);

    // 检查游戏状态
    const status = await page.evaluate(() => {
        return {
            phase: LineGame?.state?.phase,
            wordsCount: LineGame?.state?.currentWords?.length || 0,
            words: LineGame?.state?.currentWords?.map(w => w.word) || [],
            speechSupported: 'speechSynthesis' in window,
            speaking: window.speechSynthesis?.speaking || false,
            pending: window.speechSynthesis?.pending || false
        };
    });

    console.log('\n📊 游戏状态:', JSON.stringify(status, null, 2));

    // 检查例句内容
    const content = await page.evaluate(() => {
        return {
            english: document.getElementById('exampleEnglish')?.textContent || '(空)',
            chinese: document.getElementById('exampleChinese')?.textContent || '(空)'
        };
    });

    console.log('\n📖 例句内容:');
    console.log('   英文:', content.english.substring(0, 100));
    console.log('   中文:', content.chinese.substring(0, 100));

    // 等待观察朗读
    console.log('\n⏳ 等待15秒观察朗读情况...\n');
    await page.waitForTimeout(15000);

    // 再次检查语音状态
    const speechStatus = await page.evaluate(() => {
        return {
            speaking: window.speechSynthesis?.speaking || false,
            pending: window.speechSynthesis?.pending || false,
            paused: window.speechSynthesis?.paused || false
        };
    });

    console.log('\n🔊 语音状态:', speechStatus);

    // 截图
    console.log('\n📸 保存截图...');
    await page.screenshot({ path: path.join(__dirname, 'test_result.png'), fullPage: true });

    // 保持浏览器打开一会儿让用户观察
    console.log('\n⏸️  浏览器将保持打开30秒供观察...\n');
    await page.waitForTimeout(30000);

    await browser.close();
    console.log('\n✅ 测试完成');
})();