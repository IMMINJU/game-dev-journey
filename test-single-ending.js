import { chromium, devices } from 'playwright';

(async () => {
  const iPhone = devices['iPhone 12 Pro'];
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    ...iPhone,
    locale: 'ko-KR',
  });

  const page = await context.newPage();

  console.log('🎮 게임 접속 중...');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // 시작 버튼 클릭
  console.log('게임 시작...');
  const startButton = await page.locator('button:has-text("시작하기")').first();
  if (startButton) {
    await page.waitForTimeout(1000);
    await startButton.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  let day = 1;
  const maxDays = 32;

  while (day <= maxDays) {
    console.log(`\n📅 Day ${day}`);

    // 미니게임 처리
    await page.waitForTimeout(500);

    // 미니게임 건너뛰기 (타이핑, 버그잡기 등 모두 처리)
    // 건너뛰기 버튼이 나타날 때까지 최대 20초 대기
    const skipSelectors = [
      'button:has-text("건너뛰기")',
      'button:has-text("나중에 처리")',
      'button:has-text("대충 확인함")',
      'button:has-text("포기")',
      'button:has-text("빌드 중단")'
    ];

    let skipped = false;
    for (let attempt = 0; attempt < 20 && !skipped; attempt++) {
      await page.waitForTimeout(1000);
      for (const selector of skipSelectors) {
        const skipBtn = await page.locator(selector).first();
        if (await skipBtn.isVisible().catch(() => false)) {
          await skipBtn.click({ force: true }).catch(() => {});
          console.log(`  ✓ 미니게임 건너뛰기`);
          await page.waitForTimeout(1000);
          skipped = true;
          break;
        }
      }
    }

    // 모든 버튼 가져오기
    const allButtons = await page.getByRole('button').all();
    const texts = await Promise.all(allButtons.map(b => b.textContent().catch(() => '')));

    // 음소거 버튼과 버그 이모지 제외
    const bugEmojis = ['🐛', '🐜', '🐞', '🦟', '🕷️', '🪲'];
    const gameButtons = [];
    for (let i = 0; i < allButtons.length; i++) {
      const text = texts[i].trim();
      const isMuteButton = text.includes('🔊') || text.includes('🔇');
      const isBugButton = bugEmojis.some(emoji => text === emoji);

      if (!isMuteButton && !isBugButton && text) {
        gameButtons.push({ button: allButtons[i], text: texts[i] });
      }
    }

    if (gameButtons.length === 0) {
      console.log('  → 버튼 없음');
      break;
    }

    console.log(`  Found: ${gameButtons.map(b => b.text).slice(0, 3).join(', ')}`);

    // 첫 번째 버튼 클릭
    const selected = gameButtons[0];
    await page.waitForTimeout(800);
    await selected.button.click({ force: true }).catch(() => {
      selected.button.evaluate(el => el.click());
    });
    console.log(`  ✓ Clicked: ${selected.text}`);

    // Day 30에서 "출시한다" 버튼 찾기
    if (day === 30) {
      await page.waitForTimeout(2000);
      const shipBtn = await page.locator('button:has-text("출시한다")').first();
      if (await shipBtn.isVisible().catch(() => false)) {
        console.log('  → "출시한다" 버튼 발견! 클릭');
        await page.waitForTimeout(1000);
        await shipBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(3000);
      }
    }

    await page.waitForTimeout(1500);

    // 엔딩 확인
    const endings = ['타협의 출시', '완벽주의의 끝', '중도 포기', '기적적 완성'];
    for (const ending of endings) {
      const elem = await page.locator(`text="${ending}"`).first();
      if (await elem.isVisible().catch(() => false)) {
        console.log(`\n✅ 엔딩 도달: ${ending}`);
        await page.screenshot({ path: `ending-${ending}.png`, fullPage: true });
        await page.waitForTimeout(5000);
        await browser.close();
        process.exit(0);
      }
    }

    day++;
  }

  console.log('\n⚠️  엔딩에 도달하지 못함');
  await page.screenshot({ path: 'ending-failed-final.png', fullPage: true });
  await browser.close();
})();
