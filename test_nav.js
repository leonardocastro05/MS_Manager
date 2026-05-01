const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('file:///home/leo/servers/msmanager/frontend/app/dashboard.html');
    await page.waitForTimeout(1000);
    // Log any console errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Try clicking offline
    console.log("Clicking offline link...");
    await Promise.all([
        page.waitForNavigation(),
        page.locator('.nav-item[href="offline.html"]').click()
    ]);
    console.log("Navigated to:", page.url());
    await browser.close();
})();
