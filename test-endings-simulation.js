// 순수 선택지 시뮬레이션으로 엔딩 테스트

const ENDINGS = {
  miracle: '기적적 완성',
  perfectionism: '완벽주의의 끝',
  abandon: '중도 포기',
  compromise: '타협의 출시'
};

// 엔딩 계산 로직 (gameStore.ts와 동일)
function calculateEnding(currentDay, stats, choices) {
  if (currentDay < 15) {
    return 'abandon';
  }

  const compromiseCount = choices.filter(c => c.type === 'compromise').length;
  const perfectionismCount = choices.filter(c => c.type === 'perfectionism').length;

  // Miracle ending
  if (stats.quality >= 80 && stats.progress >= 95 && compromiseCount < 5) {
    return 'miracle';
  }
  // Perfectionism ending
  else if (perfectionismCount > compromiseCount * 2 || (stats.quality > 70 && stats.progress < 70)) {
    return 'perfectionism';
  }
  // Compromise ending
  else {
    return 'compromise';
  }
}

// 스탯 업데이트 (간단 버전 - 버그 카운트 제외)
function updateStats(stats, impact) {
  return {
    quality: Math.max(0, Math.min(100, stats.quality + impact.quality)),
    progress: Math.max(0, Math.min(100, stats.progress + impact.progress)),
    energy: Math.max(0, Math.min(100, stats.energy + impact.energy)),
  };
}

// 테스트 시나리오
const scenarios = [
  {
    name: 'miracle',
    strategy: 'perfectionism', // 완벽주의 선택 우선
    skipCompromise: true, // compromise 회피
    targetProgress: 95,
  },
  {
    name: 'perfectionism',
    strategy: 'perfectionism',
    maxProgress: 70, // progress 낮게 유지
  },
  {
    name: 'abandon',
    strategy: 'quit',
    quitDay: 14,
  },
  {
    name: 'compromise',
    strategy: 'compromise', // compromise 선택 우선
  },
];

// 간단한 선택지 데이터 (실제 게임에서 가져와야 함)
// 여기서는 시뮬레이션을 위한 예시
const mockChoices = {
  perfectionism: { type: 'perfectionism', impact: { quality: 5, progress: 3, energy: -3 } },
  compromise: { type: 'compromise', impact: { quality: -2, progress: 8, energy: -5 } },
  neutral: { type: 'neutral', impact: { quality: 0, progress: 5, energy: -5 } },
};

function simulateGame(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎮 시뮬레이션: ${ENDINGS[scenario.name]}`);
  console.log(`   전략: ${scenario.strategy}`);
  console.log('='.repeat(60));

  let stats = { quality: 100, progress: 0, energy: 100 };
  let choices = [];
  let day = 1;

  while (day <= 30) {
    // Abandon 시나리오
    if (scenario.strategy === 'quit' && day >= scenario.quitDay) {
      console.log(`\nDay ${day}: 중도 포기`);
      break;
    }

    // 선택지 결정
    let choice;
    if (scenario.strategy === 'perfectionism') {
      // Miracle을 위해서는 progress도 높여야 함
      if (scenario.targetProgress && stats.progress < scenario.targetProgress) {
        choice = mockChoices.neutral; // progress 증가
      } else {
        choice = mockChoices.perfectionism;
      }
    } else if (scenario.strategy === 'compromise') {
      choice = mockChoices.compromise;
    } else {
      choice = mockChoices.neutral;
    }

    // 선택 기록
    choices.push(choice);

    // 스탯 업데이트
    stats = updateStats(stats, choice.impact);

    if (day % 5 === 0 || day === 30) {
      console.log(`Day ${day}: Quality=${stats.quality}, Progress=${stats.progress}, Energy=${stats.energy}, Choices(P=${choices.filter(c=>c.type==='perfectionism').length}, C=${choices.filter(c=>c.type==='compromise').length})`);
    }

    day++;
  }

  // 엔딩 계산
  const ending = calculateEnding(day, stats, choices);
  const success = ending === scenario.name;

  console.log(`\n결과:`);
  console.log(`  최종 Day: ${day}`);
  console.log(`  최종 스탯: Quality=${stats.quality}, Progress=${stats.progress}`);
  console.log(`  선택 통계: Perfectionism=${choices.filter(c=>c.type==='perfectionism').length}, Compromise=${choices.filter(c=>c.type==='compromise').length}`);
  console.log(`  예상 엔딩: ${ENDINGS[scenario.name]}`);
  console.log(`  실제 엔딩: ${ENDINGS[ending]}`);
  console.log(`  ${success ? '✅ 성공' : '⚠️  실패'}`);

  return { scenario: scenario.name, ending, success };
}

// 모든 시나리오 실행
console.log('🎯 게임 엔딩 시뮬레이션 테스트\n');

const results = scenarios.map(simulateGame);

// 결과 요약
console.log('\n' + '='.repeat(60));
console.log('📊 테스트 결과 요약');
console.log('='.repeat(60));

results.forEach(({ scenario, ending, success }) => {
  const emoji = success ? '✅' : '❌';
  console.log(`${emoji} ${ENDINGS[scenario]}: ${success ? '성공' : `실패 (실제: ${ENDINGS[ending]})`}`);
});

const successCount = results.filter(r => r.success).length;
console.log(`\n총 ${results.length}개 중 ${successCount}개 성공`);
