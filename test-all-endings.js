import { chromium, devices } from 'playwright';

const ENDINGS = {
  miracle: '기적적 완성',
  perfectionism: '완벽주의의 끝',
  abandon: '중도 포기',
  compromise: '타협의 출시'
};

// 각 엔딩별 전략
const STRATEGIES = {
  miracle: {
    description: 'High quality + High progress + Few compromises',
    choicePattern: (buttonTexts) => {
      // "품질"이나 "완벽", "개선" 키워드가 있으면서 "타협"이 없는 선택지 우선
      const qualityChoice = buttonTexts.findIndex(text =>
        (text.includes('품질') || text.includes('완벽') || text.includes('개선') || text.includes('최적화'))
        && !text.includes('타협') && !text.includes('빠르게')
      );
      return qualityChoice !== -1 ? qualityChoice : 0;
    }
  },
  perfectionism: {
    description: 'Always choose perfectionism, avoid progress',
    choicePattern: (buttonTexts) => {
      // "완벽", "다시", "수정", "개선" 키워드 선택
      const perfectionChoice = buttonTexts.findIndex(text =>
        text.includes('완벽') || text.includes('다시') || text.includes('수정') ||
        text.includes('개선') || text.includes('리팩토링')
      );
      return perfectionChoice !== -1 ? perfectionChoice : 0;
    }
  },
  abandon: {
    description: 'Quit before day 15',
    shouldQuit: (day) => day >= 14 // Quit at day 14
  },
  compromise: {
    description: 'Balance between speed and quality, lean towards compromise',
    choicePattern: (buttonTexts) => {
      // "빠르게", "타협", "넘어가" 키워드 선택
      const compromiseChoice = buttonTexts.findIndex(text =>
        text.includes('빠르게') || text.includes('타협') || text.includes('넘어가') ||
        text.includes('일단') || text.includes('나중에')
      );
      return compromiseChoice !== -1 ? compromiseChoice : 1;
    }
  }
};

async function playMiniGame(page) {
  // 1. 장르 선택 (가장 먼저 나옴)
  const genreButtons = await page.locator('button:has-text("판타지"), button:has-text("사이버펑크"), button:has-text("포스트 아포칼립스")').all();
  if (genreButtons.length > 0) {
    console.log('  → 장르 선택 게임 발견');
    await genreButtons[0].click();
    await page.waitForTimeout(1000);
    console.log('  ✓ 장르 선택 완료');
    return true;
  }

  // 2. 타이핑 게임
  const typingInput = await page.locator('input[type="text"]').first();
  if (await typingInput.isVisible().catch(() => false)) {
    console.log('  → 타이핑 게임 발견');
    await page.waitForTimeout(500);

    // 타이핑 게임 완료 (최대 20줄까지 시도)
    for (let lineNum = 0; lineNum < 20; lineNum++) {
      // 현재 타겟 라인 찾기 (opacity-30 클래스)
      const targetElements = await page.locator('div.my-2 span.opacity-30').all();

      if (targetElements.length === 0) {
        console.log('  ✓ 타이핑 게임 완료 (더 이상 라인 없음)');
        break;
      }

      const targetText = await targetElements[0].textContent().catch(() => '');

      if (!targetText || !targetText.trim()) {
        console.log('  ✓ 타이핑 게임 완료');
        break;
      }

      // 정확히 동일하게 입력 (공백 포함)
      await typingInput.clear();
      await typingInput.type(targetText, { delay: 50 });
      await page.waitForTimeout(500);
      console.log(`  ✓ 타이핑 줄 ${lineNum + 1} 완료: "${targetText}"`);

      // 입력이 완료되면 자동으로 다음 라인으로 이동하는지 확인
      await page.waitForTimeout(400);
    }

    // 건너뛰기 버튼이 나타나면 클릭
    const skipButton = await page.locator('button:has-text("건너뛰기")').first();
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
      console.log('  ✓ 타이핑 게임 건너뛰기');
    }
    return true;
  }

  // 3. 버그 잡기 게임 (BugCatcher)
  const bugEmojis = await page.locator('button:has-text("🐛"), button:has-text("🐜"), button:has-text("🐞")').all();
  if (bugEmojis.length > 0) {
    console.log(`  → 버그 잡기 게임 발견 (버그 수: ${bugEmojis.length})`);
    for (let i = 0; i < bugEmojis.length; i++) {
      const bugs = await page.locator('button:has-text("🐛"), button:has-text("🐜"), button:has-text("🐞"), button:has-text("🦟"), button:has-text("🕷️"), button:has-text("🪲")').all();
      if (bugs.length > 0) {
        await bugs[0].click().catch(() => {});
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }

    // 건너뛰기 옵션 확인
    const skipBugButton = await page.locator('button:has-text("나중에 처리")').first();
    if (await skipBugButton.isVisible().catch(() => false)) {
      await skipBugButton.click();
      await page.waitForTimeout(500);
      console.log('  ✓ 버그 잡기 건너뛰기');
    } else {
      console.log('  ✓ 버그 잡기 완료');
    }
    return true;
  }

  // 4. QA 체크리스트
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  if (checkboxes.length > 5) {
    console.log(`  → QA 체크리스트 발견 (항목 수: ${checkboxes.length})`);

    // 몇 개만 체크하고 건너뛰기
    for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
      await checkboxes[i].check().catch(() => {});
      await page.waitForTimeout(1000);
    }

    const skipQAButton = await page.locator('button:has-text("대충 확인함")').first();
    if (await skipQAButton.isVisible().catch(() => false)) {
      await skipQAButton.click();
      await page.waitForTimeout(500);
      console.log('  ✓ QA 체크리스트 건너뛰기');
    }
    return true;
  }

  // 5. 빌드 테스트
  const buildProgress = await page.locator('text=빌드 테스트 중').first();
  if (await buildProgress.isVisible().catch(() => false)) {
    console.log('  → 빌드 테스트 발견');

    // 빌드 완료 또는 실패 대기
    await page.waitForTimeout(3000);

    // 재빌드 버튼 확인
    const rebuildButton = await page.locator('button:has-text("다시 빌드하기")').first();
    if (await rebuildButton.isVisible().catch(() => false)) {
      await rebuildButton.click();
      await page.waitForTimeout(3000);
      console.log('  ✓ 재빌드 시도');
    }

    // 포기 버튼 확인
    const giveUpButton = await page.locator('button:has-text("포기"), button:has-text("빌드 중단")').first();
    if (await giveUpButton.isVisible().catch(() => false)) {
      await giveUpButton.click();
      await page.waitForTimeout(500);
      console.log('  ✓ 빌드 포기');
    }
    return true;
  }

  // 6. 슬라이더 퍼즐 (버그 수정: 실행 순서)
  const sliderPuzzle = await page.locator('text=버그 수정: 실행 순서 정렬').first();
  if (await sliderPuzzle.isVisible().catch(() => false)) {
    console.log('  → 슬라이더 퍼즐 발견');

    await page.waitForTimeout(5000); // 건너뛰기 옵션 대기

    const skipPuzzleButton = await page.locator('button:has-text("나중에 수정")').first();
    if (await skipPuzzleButton.isVisible().catch(() => false)) {
      await skipPuzzleButton.click();
      await page.waitForTimeout(500);
      console.log('  ✓ 슬라이더 퍼즐 건너뛰기');
    }
    return true;
  }

  return false;
}

async function testEnding(endingKey, strategy) {
  const iPhone = devices['iPhone 12 Pro'];
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    ...iPhone,
    locale: 'ko-KR',
  });

  const page = await context.newPage();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎮 Testing Ending: ${ENDINGS[endingKey]}`);
  console.log(`   Strategy: ${strategy.description}`);
  console.log('='.repeat(60));

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 시작 버튼 클릭
    const startButton = await page.getByRole('button', { name: /시작|start/i }).first();
    if (startButton) {
      await page.waitForTimeout(1000);
      await startButton.click({ force: true }).catch(async () => {
        await startButton.evaluate(el => el.click());
      });
      await page.waitForTimeout(2000);
    }

    let day = 1;
    let foundEnding = false;
    const maxDays = 35;

    while (day <= maxDays && !foundEnding) {
      console.log(`\n📅 Day ${day}`);

      // Abandon 전략: 특정 날짜에 종료
      if (strategy.shouldQuit && strategy.shouldQuit(day)) {
        console.log('  → 중도 포기 시뮬레이션: 게임 종료');
        break;
      }

      // 미니게임 먼저 처리
      const playedMiniGame = await playMiniGame(page);
      if (playedMiniGame) {
        await page.waitForTimeout(1000);
      }

      // 선택지 버튼 찾기 (음소거 버튼 제외)
      const allButtons = await page.getByRole('button').all();
      const buttonTexts = await Promise.all(
        allButtons.map(btn => btn.textContent().catch(() => ''))
      );

      // 음소거 버튼 필터링
      const buttons = [];
      const filteredTexts = [];
      for (let i = 0; i < allButtons.length; i++) {
        const text = buttonTexts[i];
        // 음소거 버튼이 아닌 것만 포함
        if (!text.includes('🔊') && !text.includes('🔇') && text.trim() !== '') {
          buttons.push(allButtons[i]);
          filteredTexts.push(text);
        }
      }

      if (buttons.length === 0) {
        console.log('  → 선택지 버튼 없음, 엔딩 확인 중...');
        break;
      }

      console.log(`  Found ${buttons.length} buttons:`, filteredTexts.slice(0, 3));

      // 전략에 따라 선택
      let choiceIndex = 0;
      if (strategy.choicePattern) {
        choiceIndex = strategy.choicePattern(filteredTexts);
      }

      const selectedText = filteredTexts[choiceIndex];
      // Wait for animation to settle and force click
      await page.waitForTimeout(800);
      await buttons[choiceIndex].click({ force: true, timeout: 5000 }).catch(async () => {
        // Fallback: use JS click
        await buttons[choiceIndex].evaluate(el => el.click());
      });
      console.log(`  ✓ Selected: "${selectedText}"`);

      // 출시 버튼이면 더 긴 대기
      if (selectedText && selectedText.includes('출시')) {
        console.log('  → 출시 진행 중... 엔딩 확인 대기');
        await page.waitForTimeout(4000);
      } else {
        await page.waitForTimeout(1500);
      }

      // Day 30+ 에서 "출시한다" 버튼 자동 클릭
      if (day >= 30) {
        const shipButton = await page.locator('button:has-text("출시한다")').first();
        if (await shipButton.isVisible().catch(() => false)) {
          console.log('  → "출시한다" 버튼 발견! 클릭하여 엔딩 트리거');
          await page.waitForTimeout(1000);
          await shipButton.click({ force: true }).catch(async () => {
            await shipButton.evaluate(el => el.click());
          });
          await page.waitForTimeout(5000); // 엔딩 로딩 대기
        }
      }

      // 엔딩 확인
      for (const [key, title] of Object.entries(ENDINGS)) {
        const endingElement = await page.locator(`text="${title}"`).first();
        const isVisible = await endingElement.isVisible().catch(() => false);
        if (isVisible) {
          console.log(`\n✅ 엔딩 도달: ${title}`);

          // 예상 엔딩과 실제 엔딩 비교
          if (key === endingKey) {
            console.log(`✅ SUCCESS: 목표 엔딩 달성!`);
          } else {
            console.log(`⚠️  WARNING: 예상 엔딩(${ENDINGS[endingKey]})과 다름!`);
          }

          await page.screenshot({
            path: `ending-${endingKey}-actual-${key}.png`,
            fullPage: true
          });
          foundEnding = true;
          break;
        }
      }

      if (foundEnding) break;
      day++;
    }

    if (!foundEnding) {
      console.log('\n⚠️  엔딩에 도달하지 못했습니다');
      await page.screenshot({ path: `ending-${endingKey}-failed.png` });
    }

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error(`\n❌ 테스트 오류:`, error.message);
    await page.screenshot({ path: `ending-${endingKey}-error.png` });
  }

  await browser.close();
  return true;
}

async function runAllTests() {
  console.log('\n🎯 게임 엔딩 전체 테스트 시작');
  console.log('서버가 http://localhost:5173 에서 실행 중이어야 합니다\n');

  const results = [];

  for (const [endingKey, strategy] of Object.entries(STRATEGIES)) {
    try {
      await testEnding(endingKey, strategy);
      results.push({ ending: endingKey, status: 'completed' });
    } catch (error) {
      console.error(`\n❌ ${ENDINGS[endingKey]} 테스트 실패:`, error.message);
      results.push({ ending: endingKey, status: 'failed', error: error.message });
    }

    // 테스트 간 대기
    console.log('\n⏳ 다음 테스트 준비 중...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(60));

  results.forEach(({ ending, status, error }) => {
    const emoji = status === 'completed' ? '✅' : '❌';
    console.log(`${emoji} ${ENDINGS[ending]}: ${status}`);
    if (error) console.log(`   Error: ${error}`);
  });

  console.log('\n🎉 모든 테스트 완료!');
}

runAllTests();
