import { chromium, devices } from 'playwright';

(async () => {
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

  console.log('🔍 모바일 UI 테스트 시작...\n');

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  const issues = [];

  // 테스트 헬퍼 함수들
  async function checkVisibility(selector, name) {
    try {
      const element = await page.locator(selector).first();
      const isVisible = await element.isVisible();

      if (!isVisible) {
        issues.push(`❌ ${name}: 요소가 보이지 않음`);
        return null;
      }

      const box = await element.boundingBox();
      if (!box) {
        issues.push(`❌ ${name}: bounding box를 가져올 수 없음`);
        return null;
      }

      // 화면 밖으로 벗어났는지 확인
      const viewport = page.viewportSize();
      if (box.x + box.width > viewport.width || box.y + box.height > viewport.height) {
        issues.push(`❌ ${name}: 화면 밖으로 벗어남 (x:${box.x}, y:${box.y}, w:${box.width}, h:${box.height})`);
      }

      // 너무 작은지 확인
      if (box.width < 10 || box.height < 10) {
        issues.push(`⚠️ ${name}: 요소가 너무 작음 (${box.width}x${box.height})`);
      }

      console.log(`✅ ${name}: 크기 ${Math.round(box.width)}x${Math.round(box.height)}, 위치 (${Math.round(box.x)}, ${Math.round(box.y)})`);
      return element;

    } catch (error) {
      issues.push(`❌ ${name}: ${error.message}`);
      return null;
    }
  }

  async function checkTextContrast(selector, name) {
    try {
      const element = await page.locator(selector).first();

      // 색상 정보 가져오기
      const color = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          opacity: style.opacity
        };
      });

      console.log(`   📝 ${name} 색상: ${color.color}, 배경: ${color.backgroundColor}, 투명도: ${color.opacity}`);

      // 투명도가 너무 낮은지 확인
      if (parseFloat(color.opacity) < 0.3) {
        issues.push(`⚠️ ${name}: 투명도가 너무 낮음 (${color.opacity})`);
      }

      return color;
    } catch (error) {
      issues.push(`❌ ${name} 색상 체크 실패: ${error.message}`);
      return null;
    }
  }

  async function checkOverlap(selector1, name1, selector2, name2) {
    try {
      const box1 = await page.locator(selector1).first().boundingBox();
      const box2 = await page.locator(selector2).first().boundingBox();

      if (!box1 || !box2) return;

      // 겹침 확인
      const overlap = !(
        box1.x + box1.width < box2.x ||
        box2.x + box2.width < box1.x ||
        box1.y + box1.height < box2.y ||
        box2.y + box2.height < box1.y
      );

      if (overlap) {
        issues.push(`⚠️ UI 겹침: ${name1}와 ${name2}가 겹쳐있음`);
      }
    } catch (error) {
      // 요소가 없을 수 있으므로 무시
    }
  }

  // 스크린샷 저장 헬퍼
  async function saveScreenshot(filename, description) {
    await page.screenshot({ path: `ui-test-${filename}.png`, fullPage: true });
    console.log(`📸 스크린샷 저장: ${description}`);
  }

  // ============================================
  // Day 1 - 시작 화면 체크
  // ============================================
  console.log('\n🎮 Day 1 - 시작 화면 UI 체크');
  await page.waitForTimeout(1000);

  // DAY 표시 확인
  await checkVisibility('text=/DAY/i', 'Day 표시');

  // Progress 바 확인
  await checkVisibility('text=/PROG/i', 'Progress 표시');
  await checkVisibility('text=/QUAL/i', 'Quality 표시');
  await checkVisibility('text=/ENRG/i', 'Energy 표시');
  await checkVisibility('text=/BUGS/i', 'Bugs 표시');

  // 타이틀 확인
  const title = await checkVisibility('h1', '게임 타이틀');
  if (title) {
    await checkTextContrast('h1', '타이틀 텍스트');
  }

  // 설명 텍스트 확인
  await checkTextContrast('div', '설명 텍스트');

  // 버튼 확인
  const buttons = await page.getByRole('button').all();
  console.log(`   버튼 개수: ${buttons.length}개`);

  for (let i = 0; i < buttons.length; i++) {
    const box = await buttons[i].boundingBox();
    if (box) {
      // 버튼이 터치하기 충분한 크기인지 (최소 44x44px)
      if (box.height < 44) {
        issues.push(`⚠️ 버튼 ${i+1}: 높이가 44px보다 작음 (${Math.round(box.height)}px)`);
      }
      console.log(`   버튼 ${i+1}: ${Math.round(box.width)}x${Math.round(box.height)}px`);
    }
  }

  // 오디오 컨트롤 확인
  await checkVisibility('button:has-text("🔊"), button:has-text("🔇")', '오디오 컨트롤');

  // UI 겹침 체크
  await checkOverlap('h1', '타이틀', 'button', '버튼');

  await saveScreenshot('day1', 'Day 1 화면');

  // ============================================
  // 첫 선택지 클릭 후 체크
  // ============================================
  console.log('\n🎮 첫 선택지 선택 후 UI 체크');
  await buttons[0].click();
  await page.waitForTimeout(2000);

  await checkVisibility('text=/DAY/i', 'Day 표시 (선택 후)');
  await saveScreenshot('after-choice', '선택지 선택 후');

  // ============================================
  // 타이핑 게임 UI 체크
  // ============================================
  console.log('\n⌨️ 타이핑 게임 UI 체크');

  // Day 2로 진행
  const day2Buttons = await page.getByRole('button').all();
  if (day2Buttons.length > 0) {
    await day2Buttons[0].click();
    await page.waitForTimeout(1500);
  }

  // Day 3 (타이핑 게임)으로 진행
  const day3Buttons = await page.getByRole('button').all();
  if (day3Buttons.length > 0) {
    await day3Buttons[0].click();
    await page.waitForTimeout(1500);

    // 타이핑 게임 시작
    const startButton = await page.getByRole('button').first();
    await startButton.click();
    await page.waitForTimeout(1000);

    // 타이핑 입력창 확인
    const typingInput = await checkVisibility('input[type="text"]', '타이핑 입력창');
    if (typingInput) {
      const inputBox = await typingInput.boundingBox();
      console.log(`   입력창 크기: ${Math.round(inputBox.width)}x${Math.round(inputBox.height)}px`);
    }

    // 코드 스니펫 표시 확인
    await checkVisibility('.font-mono', '코드 스니펫');
    await checkTextContrast('.font-mono', '코드 텍스트');

    // Progress 표시 확인
    await checkVisibility('text=/Progress/i', '타이핑 진행도');

    await saveScreenshot('typing-game', '타이핑 게임 화면');

    // 타이핑 게임 완료
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

    await page.waitForTimeout(1000);
  }

  // ============================================
  // 중반 게임 UI 체크 (Day 15)
  // ============================================
  console.log('\n🎮 게임 중반 UI 체크 (빠른 진행)');

  // Day 15까지 빠르게 진행
  for (let i = 0; i < 12; i++) {
    const btns = await page.getByRole('button').all();
    if (btns.length > 0) {
      await btns[0].click();
      await page.waitForTimeout(800);
    }
  }

  await checkVisibility('text=/DAY/i', 'Day 표시 (중반)');
  await checkVisibility('text=/PROG/i', 'Progress (중반)');

  // 진행도가 올라갔는지 확인
  const progressText = await page.locator('text=/PROG/i').first().textContent();
  console.log(`   현재 Progress: ${progressText}`);

  await saveScreenshot('midgame', '게임 중반 화면');

  // ============================================
  // 후반 게임 UI 체크 (Day 25+)
  // ============================================
  console.log('\n🎮 게임 후반 UI 체크 (빠른 진행)');

  // Day 25까지 빠르게 진행
  for (let i = 0; i < 10; i++) {
    const btns = await page.getByRole('button').all();
    if (btns.length > 0) {
      await btns[0].click();
      await page.waitForTimeout(800);
    }
  }

  await checkVisibility('text=/DAY/i', 'Day 표시 (후반)');
  await checkVisibility('text=/BUGS/i', 'Bugs 표시 (후반)');

  // 버그 수 확인
  const bugsText = await page.locator('text=/BUGS/i').first().textContent();
  console.log(`   현재 Bugs: ${bugsText}`);

  await saveScreenshot('lategame', '게임 후반 화면');

  // ============================================
  // 최종 결과 출력
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(50));

  if (issues.length === 0) {
    console.log('✅ 모든 UI가 정상적으로 표시됩니다!');
  } else {
    console.log(`⚠️ 발견된 문제: ${issues.length}개\n`);
    issues.forEach(issue => console.log(issue));
  }

  console.log('\n📸 저장된 스크린샷:');
  console.log('  - ui-test-day1.png');
  console.log('  - ui-test-after-choice.png');
  console.log('  - ui-test-typing-game.png');
  console.log('  - ui-test-midgame.png');
  console.log('  - ui-test-lategame.png');

  await page.waitForTimeout(3000);
  await browser.close();

  console.log('\n✅ 테스트 완료!');

  // 문제가 있으면 종료 코드 1
  if (issues.length > 0) {
    process.exit(1);
  }
})();
