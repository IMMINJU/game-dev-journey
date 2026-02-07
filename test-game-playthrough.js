import { chromium, devices } from 'playwright';

(async () => {
  // 모바일 디바이스 설정 (iPhone 12 Pro)
  const iPhone = devices['iPhone 12 Pro'];

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // 각 액션 사이에 500ms 지연 (테스트 관찰용)
  });

  const context = await browser.newContext({
    ...iPhone,
    locale: 'ko-KR',
  });

  const page = await context.newPage();

  console.log('게임 접속 중...');
  await page.goto('http://localhost:5173');

  // 페이지 로딩 대기
  await page.waitForLoadState('networkidle');
  console.log('게임 로딩 완료');

  try {
    // 게임 시작 버튼 찾기 및 클릭
    console.log('게임 시작 버튼 찾는 중...');
    const startButton = await page.getByRole('button', { name: /시작|start/i }).first();
    if (startButton) {
      await startButton.click();
      console.log('게임 시작!');
      await page.waitForTimeout(2000);
    }

    // 게임 플레이 자동화 (엔딩까지)
    let dayCount = 0;
    const maxIterations = 35; // 최대 반복 횟수 (30일 + 여유)

    while (dayCount < maxIterations) {
      console.log(`Day ${dayCount + 1} 진행 중...`);

      // 선택지나 버튼 찾기
      const buttons = await page.getByRole('button').all();
      console.log(`발견된 버튼: ${buttons.length}개`);

      if (buttons.length === 0) {
        console.log('더 이상 버튼이 없습니다. 엔딩 확인 중...');
        break;
      }

      // 첫 번째 버튼 클릭 (선택지 또는 다음 버튼)
      const buttonText = await buttons[0].textContent();
      await buttons[0].click();
      console.log(`버튼 클릭 완료: "${buttonText}"`);

      // 미니게임 처리
      // 타이핑 게임 확인
      const typingInput = await page.locator('input[type="text"]').first();
      if (await typingInput.isVisible().catch(() => false)) {
        console.log('타이핑 게임 발견!');

        // 타이핑해야 할 모든 라인 완료
        const codeSnippets = [
          'function createPlayer() {',
          '  return { x: 0, y: 0 };',
          '}',
          'const enemy = new Enemy();',
          'player.attack(enemy);',
        ];

        for (const snippet of codeSnippets) {
          await page.waitForTimeout(300);
          await typingInput.fill(snippet);
          await page.waitForTimeout(500);
        }

        console.log('타이핑 게임 완료');
      }

      // 장르 선택 게임 확인
      const genreButtons = await page.locator('button:has-text("선택")').all();
      if (genreButtons.length > 0) {
        console.log('장르 선택 게임 발견!');
        await genreButtons[0].click();
        console.log('장르 선택 완료');
      }

      // "출시한다" 버튼 클릭 후 추가 대기
      if (buttonText && buttonText.includes('출시')) {
        console.log('출시 버튼 클릭! 엔딩 로딩 대기 중...');
        await page.waitForTimeout(3000);
      } else {
        await page.waitForTimeout(1500);
      }

      // 엔딩 화면 확인 (여러 엔딩 타이틀 검색)
      const endingTitles = ['타협의 출시', '완벽주의의 끝', '중도 포기', '기적적 완성'];
      let foundEnding = false;

      for (const title of endingTitles) {
        const endingElement = await page.locator(`text="${title}"`).first();
        const isVisible = await endingElement.isVisible().catch(() => false);
        if (isVisible) {
          console.log(`✅ 엔딩에 도달했습니다! (${title})`);
          foundEnding = true;

          // 스크린샷 저장
          await page.screenshot({ path: 'ending-screenshot.png' });
          console.log('엔딩 스크린샷 저장 완료');
          break;
        }
      }

      if (foundEnding) break;

      dayCount++;
    }

    if (dayCount >= maxIterations) {
      console.log('⚠️ 최대 반복 횟수에 도달했지만 엔딩을 찾지 못했습니다.');
    }

    // 최종 화면 스크린샷
    await page.screenshot({ path: 'final-screen.png' });
    console.log('최종 화면 스크린샷 저장 완료');

    // 5초 대기 후 종료
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  await browser.close();
  console.log('테스트 종료');
})();
