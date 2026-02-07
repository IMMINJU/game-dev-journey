import type { DayContent } from '../types/game';

export const daysData: DayContent[] = [
  // ACT 1: The Dream (Day 1-5)
  {
    day: 1,
    act: 1,
    title: '시작',
    description: (genre) => {
      if (genre === 'fantasy') {
        return `당신은 오랫동안 꿈꿔왔습니다.
검과 마법, 용과 기사의 판타지 RPG를.
오늘, 드디어 시작합니다.`;
      } else if (genre === 'cyberpunk') {
        return `당신은 오랫동안 꿈꿔왔습니다.
네온 빛나는 미래, 해커와 AI의 사이버펑크 RPG를.
오늘, 드디어 시작합니다.`;
      } else if (genre === 'postapoc') {
        return `당신은 오랫동안 꿈꿔왔습니다.
폐허 속 생존, 희망을 찾는 포스트 아포칼립스 RPG를.
오늘, 드디어 시작합니다.`;
      }
      return `당신은 오랫동안 꿈꿔왔습니다.
모험, 우정, 선택이 있는 RPG를.
오늘, 드디어 시작합니다.`;
    },
    minigame: 'genre-select',
    choices: [
      {
        id: 'start',
        text: '시작하기',
        type: 'neutral',
        impact: {
          visualDegradation: 0,
          progress: 5,
          quality: 0,
          energy: -5,
        },
      },
    ],
  },
  {
    day: 2,
    act: 1,
    title: '첫 코드',
    description: (genre) => {
      if (genre === 'fantasy') {
        return `모니터 앞에 앉아 첫 코드를 작성합니다.
검과 마법의 세계가 함수 하나, 변수 하나로 태어납니다.
용의 숨결, 마법사의 주문이 당신의 손끝에서 만들어집니다.`;
      } else if (genre === 'cyberpunk') {
        return `모니터 앞에 앉아 첫 코드를 작성합니다.
네온 불빛 가득한 미래 도시가 한 줄씩 펼쳐집니다.
사이버 임플란트, AI 해커가 당신의 코드로 움직입니다.`;
      } else if (genre === 'postapoc') {
        return `모니터 앞에 앉아 첫 코드를 작성합니다.
폐허 속 생존자들의 이야기가 변수로 새겨집니다.
녹슨 총, 야생의 위협이 함수로 구현됩니다.`;
      }
      return `모니터 앞에 앉아 첫 코드를 작성합니다.
키보드를 두드릴 때마다 당신의 상상이 현실이 되어갑니다.
함수 하나, 변수 하나가 모여 세계를 만들어냅니다.`;
    },
    minigame: 'typing-easy',
    minigameSkipImpact: {
      visualDegradation: 5,
      progress: 5,
      quality: -8,
      energy: 0,
    },
    choices: [
      {
        id: 'enjoy',
        text: '천천히, 즐기면서 작성한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 0,
          progress: 3,
          quality: 5,
          energy: -3,
        },
      },
      {
        id: 'fast',
        text: '빠르게 프로토타입을 만든다',
        type: 'neutral',
        impact: {
          visualDegradation: 2,
          progress: 8,
          quality: -2,
          energy: -5,
        },
      },
    ],
  },
  {
    day: 3,
    act: 1,
    title: '캐릭터 디자인',
    description: `주인공의 모습을 그립니다.
망토가 바람에 날리는 모습을 상상하니 벌써 설레네요.
플레이어들이 이 캐릭터와 함께 모험을 떠날 거예요.`,
    choices: [
      {
        id: 'detail',
        text: '디테일하게 스프라이트를 그린다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 0,
          progress: 4,
          quality: 8,
          energy: -8,
        },
      },
      {
        id: 'simple',
        text: '심플하게 만든다',
        type: 'neutral',
        impact: {
          visualDegradation: 3,
          progress: 7,
          quality: 2,
          energy: -4,
        },
      },
      {
        id: 'template',
        text: '에셋 스토어에서 구매한다',
        type: 'compromise',
        impact: {
          visualDegradation: 5,
          progress: 10,
          quality: -3,
          energy: -2,
        },
      },
    ],
  },
  {
    day: 4,
    act: 1,
    title: '첫 버그',
    description: `실행 버튼을 누르자 에러 메시지가 떴습니다.
"NullReferenceException"
...뭐, 당연하죠. 이게 개발이니까요.`,
    choices: [
      {
        id: 'debug',
        text: '차근차근 디버깅한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 1,
          progress: 3,
          quality: 5,
          energy: -6,
        },
      },
      {
        id: 'workaround',
        text: '임시 방편으로 해결한다',
        type: 'compromise',
        impact: {
          visualDegradation: 4,
          progress: 6,
          quality: -4,
          energy: -3,
        },
      },
    ],
  },
  {
    day: 5,
    act: 1,
    title: '프로토타입 완성',
    description: `첫 레벨이 완성되었습니다!
캐릭터가 움직이고, 적과 싸우고, 아이템을 획득합니다.
짧지만... 정말 뿌듯하네요.
"이 정도면 완성본은 정말 대단하겠는데?"`,
    choices: [
      {
        id: 'celebrate',
        text: '잠시 쉬면서 성취감을 느낀다',
        type: 'neutral',
        impact: {
          visualDegradation: 2,
          progress: 5,
          quality: 0,
          energy: 10,
        },
      },
      {
        id: 'continue',
        text: '바로 다음 작업을 시작한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 3,
          progress: 10,
          quality: 3,
          energy: -8,
        },
      },
    ],
  },

  // ACT 2: Reality (Day 6-20) - Simplified for now
  {
    day: 6,
    act: 2,
    title: '남은 작업량',
    description: `진행도를 확인합니다: 15%
예상 기간: 25일
...어?`,
    choices: [
      {
        id: 'accept',
        text: '괜찮아, 계속하자',
        type: 'neutral',
        impact: {
          visualDegradation: 5,
          progress: 5,
          quality: 0,
          energy: -5,
        },
      },
      {
        id: 'scope',
        text: '범위를 줄여야겠다',
        type: 'compromise',
        impact: {
          visualDegradation: 8,
          progress: 8,
          quality: -5,
          energy: -3,
        },
      },
    ],
  },

  {
    day: 7,
    act: 2,
    title: '반복 작업',
    description: `같은 작업을 반복합니다. 레벨 디자인. 또 레벨 디자인.
어제와 똑같은 일. 내일도 똑같을 일.`,
    choices: [
      {
        id: 'manual',
        text: '하나하나 손으로 만든다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 3,
          progress: 4,
          quality: 6,
          energy: -10,
        },
      },
      {
        id: 'automate',
        text: '자동화 툴을 사용한다',
        type: 'compromise',
        impact: {
          visualDegradation: 6,
          progress: 10,
          quality: -3,
          energy: -4,
        },
      },
    ],
  },
  {
    day: 8,
    act: 2,
    title: '에셋 제작',
    description: `스프라이트 제작 (12/50)
사운드 믹싱 (8/30)
UI 디자인 (3/20)`,
    choices: [
      {
        id: 'quality',
        text: '품질을 유지한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 4,
          progress: 5,
          quality: 5,
          energy: -8,
        },
      },
      {
        id: 'outsource',
        text: '일부를 외주로 맡긴다',
        type: 'compromise',
        impact: {
          visualDegradation: 7,
          progress: 12,
          quality: -2,
          energy: -3,
        },
      },
    ],
  },
  {
    day: 9,
    act: 2,
    title: '버그 발견',
    description: `테스트 중 버그를 발견했습니다.
세이브 데이터가 간혹 손상됩니다.`,
    minigame: 'bugfix-easy',
    minigameSkipImpact: {
      visualDegradation: 8,
      progress: 5,
      quality: -10,
      energy: 0,
    },
    choices: [],
  },
  {
    day: 10,
    act: 2,
    title: '3D? 2D?',
    description: `3D 그래픽 작업이 예상보다 오래 걸립니다.`,
    choices: [
      {
        id: 'keep3d',
        text: '3D를 유지한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 5,
          progress: 3,
          quality: 7,
          energy: -12,
        },
      },
      {
        id: 'switch2d',
        text: '2D로 변경한다',
        type: 'compromise',
        impact: {
          visualDegradation: 10,
          progress: 10,
          quality: -8,
          energy: -5,
        },
      },
    ],
  },
  {
    day: 11,
    act: 2,
    title: '진행 상황',
    description: `진행도: 45%
품질: 괜찮음
체력: 낮음

...너무 힘듭니다.
정말 이걸 끝낼 수 있을까요?`,
    choices: [
      {
        id: 'rest',
        text: '하루 쉰다',
        type: 'neutral',
        impact: {
          visualDegradation: 3,
          progress: 0,
          quality: 2,
          energy: 20,
        },
      },
      {
        id: 'push',
        text: '밀어붙인다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 6,
          progress: 8,
          quality: 3,
          energy: -15,
        },
      },
      {
        id: 'giveup',
        text: '포기한다',
        type: 'abandon',
        impact: {
          visualDegradation: 0,
          progress: 0,
          quality: 0,
          energy: 0,
        },
      },
    ],
  },
  {
    day: 12,
    act: 2,
    title: '친구의 피드백',
    description: `"UI가 좀 복잡한 것 같아"
"튜토리얼이 더 필요해"
"전투 밸런스가..."`,
    choices: [
      {
        id: 'all',
        text: '모두 반영한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 5,
          progress: -5,
          quality: 10,
          energy: -12,
        },
      },
      {
        id: 'some',
        text: '일부만 반영한다',
        type: 'neutral',
        impact: {
          visualDegradation: 7,
          progress: 3,
          quality: 4,
          energy: -6,
        },
      },
      {
        id: 'ignore',
        text: '무시한다',
        type: 'compromise',
        impact: {
          visualDegradation: 9,
          progress: 8,
          quality: -5,
          energy: -2,
        },
      },
    ],
  },
  {
    day: 13,
    act: 2,
    title: '오픈월드 vs 리니어',
    description: `오픈월드 구현이 너무 복잡합니다.`,
    choices: [
      {
        id: 'openworld',
        text: '오픈월드를 완성한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 6,
          progress: 2,
          quality: 8,
          energy: -15,
        },
      },
      {
        id: 'linear',
        text: '리니어로 축소한다',
        type: 'compromise',
        impact: {
          visualDegradation: 12,
          progress: 12,
          quality: -10,
          energy: -4,
        },
      },
    ],
  },
  {
    day: 14,
    act: 2,
    title: '버그 수정 작업',
    description: `버그 리스트가 쌓여있습니다.
하나씩 고쳐나가야 합니다.`,
    minigame: 'bugfix-medium',
    minigameSkipImpact: {
      visualDegradation: 10,
      progress: 8,
      quality: -12,
      energy: 0,
    },
    choices: [],
  },
  {
    day: 15,
    act: 2,
    title: '중간 플레이테스트',
    description: `스스로 게임을 플레이해봅니다.
...생각했던 것과 다릅니다.`,
    choices: [
      {
        id: 'overhaul',
        text: '대대적으로 수정한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 5,
          progress: -10,
          quality: 15,
          energy: -20,
        },
      },
      {
        id: 'minor',
        text: '소소한 개선만 한다',
        type: 'neutral',
        impact: {
          visualDegradation: 8,
          progress: 5,
          quality: 3,
          energy: -8,
        },
      },
      {
        id: 'accept',
        text: '이 정도면 괜찮다',
        type: 'compromise',
        impact: {
          visualDegradation: 12,
          progress: 10,
          quality: -5,
          energy: -3,
        },
      },
    ],
  },
  {
    day: 16,
    act: 2,
    title: 'AI 시스템 구현',
    description: `적 AI 로직을 구현해야 합니다.
복잡한 코드를 작성해야 합니다.`,
    minigame: 'typing-medium',
    minigameSkipImpact: {
      visualDegradation: 10,
      progress: 8,
      quality: -12,
      energy: 0,
    },
    choices: [
      {
        id: 'continue',
        text: '다음으로',
        type: 'neutral',
        impact: {
          visualDegradation: 4,
          progress: 5,
          quality: 0,
          energy: -5,
        },
      },
    ],
  },
  {
    day: 17,
    act: 2,
    title: '체력 한계',
    description: `피곤합니다. 너무 피곤합니다.`,
    choices: [
      {
        id: 'longrest',
        text: '이틀 쉰다',
        type: 'neutral',
        impact: {
          visualDegradation: 5,
          progress: -2,
          quality: 0,
          energy: 30,
        },
      },
      {
        id: 'coffee',
        text: '커피를 마시고 계속한다',
        type: 'compromise',
        impact: {
          visualDegradation: 10,
          progress: 8,
          quality: -6,
          energy: -10,
        },
      },
    ],
  },
  {
    day: 18,
    act: 2,
    title: '빌드 테스트',
    description: `빌드를 만들고 테스트해야 합니다.
시간이 오래 걸립니다.`,
    minigame: 'build-15',
    minigameSkipImpact: {
      visualDegradation: 12,
      progress: -5,
      quality: -20,
      energy: 0,
    },
    choices: [
      {
        id: 'continue',
        text: '다음으로',
        type: 'neutral',
        impact: {
          visualDegradation: 4,
          progress: 5,
          quality: 0,
          energy: -5,
        },
      },
    ],
  },
  {
    day: 19,
    act: 2,
    title: '진행도 70%',
    description: `70%
버그: 89개
남은 기간: 11일`,
    choices: [
      {
        id: 'bugs',
        text: '버그부터 잡는다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 8,
          progress: 2,
          quality: 8,
          energy: -12,
        },
      },
      {
        id: 'features',
        text: '기능 완성을 우선한다',
        type: 'neutral',
        impact: {
          visualDegradation: 10,
          progress: 10,
          quality: -4,
          energy: -10,
        },
      },
    ],
  },
  {
    day: 20,
    act: 2,
    title: '목표',
    description: `원래 목표: 완벽한 게임
현재 상태: 괜찮은 게임
...충분할까요?`,
    choices: [
      {
        id: 'perfect',
        text: '완벽을 향해 간다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 6,
          progress: 4,
          quality: 10,
          energy: -15,
        },
      },
      {
        id: 'good',
        text: '괜찮은 정도면 충분하다',
        type: 'compromise',
        impact: {
          visualDegradation: 12,
          progress: 12,
          quality: 0,
          energy: -5,
        },
      },
    ],
  },

  // ACT 3: Compromise (Day 21-30)
  {
    day: 21,
    act: 3,
    title: '최종 단계',
    description: `출시까지 9일
해야 할 일이 너무 많습니다.`,
    choices: [
      {
        id: 'plan',
        text: '계획을 다시 세운다',
        type: 'neutral',
        impact: {
          visualDegradation: 8,
          progress: 3,
          quality: 4,
          energy: -8,
        },
      },
      {
        id: 'go',
        text: '그냥 진행한다',
        type: 'compromise',
        impact: {
          visualDegradation: 12,
          progress: 8,
          quality: -6,
          energy: -10,
        },
      },
    ],
  },
  {
    day: 22,
    act: 3,
    title: 'QA 체크리스트',
    description: `출시 전 최종 QA 테스트입니다.
모든 항목을 확인해야 합니다.`,
    minigame: 'qa-15',
    minigameSkipImpact: {
      visualDegradation: 15,
      progress: 10,
      quality: -15,
      energy: 0,
    },
    choices: [
      {
        id: 'continue',
        text: '다음으로',
        type: 'neutral',
        impact: {
          visualDegradation: 5,
          progress: 8,
          quality: 0,
          energy: -6,
        },
      },
    ],
  },
  {
    day: 23,
    act: 3,
    title: '폴리싱',
    description: `마지막 다듬기 작업...`,
    choices: [
      {
        id: 'polish',
        text: '꼼꼼하게 다듬는다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 8,
          progress: 5,
          quality: 8,
          energy: -15,
        },
      },
      {
        id: 'skip',
        text: '대충 넘어간다',
        type: 'compromise',
        impact: {
          visualDegradation: 16,
          progress: 12,
          quality: -10,
          energy: -5,
        },
      },
    ],
  },
  {
    day: 24,
    act: 3,
    title: '크리티컬 버그 수정',
    description: `출시를 막는 크리티컬 버그들...
지금 고치지 않으면 출시 불가능합니다.`,
    minigame: 'bugfix-hard',
    minigameSkipImpact: {
      visualDegradation: 18,
      progress: 10,
      quality: -25,
      energy: 0,
    },
    choices: [],
  },
  {
    day: 25,
    act: 3,
    title: '2차 QA',
    description: `또 다시 QA 체크리스트...
같은 작업의 반복입니다.`,
    minigame: 'qa-20',
    minigameSkipImpact: {
      visualDegradation: 20,
      progress: 12,
      quality: -18,
      energy: 0,
    },
    choices: [
      {
        id: 'continue',
        text: '다음으로',
        type: 'neutral',
        impact: {
          visualDegradation: 7,
          progress: 8,
          quality: 0,
          energy: -8,
        },
      },
    ],
  },
  {
    day: 26,
    act: 3,
    title: '최종 빌드',
    description: `마지막 빌드 테스트입니다.
이번에도 오래 걸립니다.`,
    minigame: 'build-20',
    minigameSkipImpact: {
      visualDegradation: 20,
      progress: -8,
      quality: -30,
      energy: 0,
    },
    choices: [
      {
        id: 'critical',
        text: '치명적인 것만 고친다',
        type: 'compromise',
        impact: {
          visualDegradation: 15,
          progress: 10,
          quality: -5,
          energy: -8,
        },
      },
    ],
  },
  {
    day: 25,
    act: 3,
    title: '5일 남음',
    description: `5일.
거의 다 왔습니다.`,
    choices: [
      {
        id: 'focus',
        text: '집중한다',
        type: 'neutral',
        impact: {
          visualDegradation: 12,
          progress: 8,
          quality: 3,
          energy: -12,
        },
      },
      {
        id: 'rush',
        text: '서두른다',
        type: 'compromise',
        impact: {
          visualDegradation: 18,
          progress: 15,
          quality: -8,
          energy: -15,
        },
      },
    ],
  },
  {
    day: 27,
    act: 3,
    title: '최적화 코드 작성',
    description: `성능 최적화를 위한 복잡한 코드...
길고 어렵습니다.`,
    minigame: 'typing-hard',
    minigameSkipImpact: {
      visualDegradation: 22,
      progress: 10,
      quality: -20,
      energy: 0,
    },
    choices: [
      {
        id: 'continue',
        text: '다음으로',
        type: 'neutral',
        impact: {
          visualDegradation: 8,
          progress: 8,
          quality: 0,
          energy: -10,
        },
      },
    ],
  },
  {
    day: 26,
    act: 3,
    title: '엔딩 작업',
    description: `엔딩 시퀀스 제작 중...`,
    choices: [
      {
        id: 'cinematic',
        text: '시네마틱 영상을 만든다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 12,
          progress: 4,
          quality: 10,
          energy: -15,
        },
      },
      {
        id: 'text',
        text: '텍스트로 처리한다',
        type: 'compromise',
        impact: {
          visualDegradation: 20,
          progress: 12,
          quality: -12,
          energy: -5,
        },
      },
    ],
  },
  {
    day: 27,
    act: 3,
    title: '마지막 선택',
    description: `출시를 연기하시겠습니까?`,
    choices: [
      {
        id: 'delay',
        text: '1주일 연기한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 10,
          progress: -3,
          quality: 8,
          energy: -20,
        },
      },
      {
        id: 'ontime',
        text: '예정대로 출시한다',
        type: 'neutral',
        impact: {
          visualDegradation: 15,
          progress: 10,
          quality: 0,
          energy: -10,
        },
      },
    ],
  },
  {
    day: 28,
    act: 3,
    title: '빌드',
    description: `최종 빌드 중...
에러: 3개`,
    choices: [
      {
        id: 'fix',
        text: '에러를 수정한다',
        type: 'perfectionism',
        impact: {
          visualDegradation: 12,
          progress: 5,
          quality: 8,
          energy: -15,
        },
      },
      {
        id: 'ship',
        text: '그대로 출시한다',
        type: 'compromise',
        impact: {
          visualDegradation: 20,
          progress: 15,
          quality: -15,
          energy: -8,
        },
      },
    ],
  },
  {
    day: 29,
    act: 3,
    title: '내일',
    description: `내일이면... 끝입니다.`,
    choices: [
      {
        id: 'ready',
        text: '준비됐다',
        type: 'neutral',
        impact: {
          visualDegradation: 10,
          progress: 10,
          quality: 0,
          energy: -10,
        },
      },
      {
        id: 'scared',
        text: '두렵다',
        type: 'neutral',
        impact: {
          visualDegradation: 15,
          progress: 5,
          quality: 0,
          energy: -15,
        },
      },
    ],
  },
  {
    day: 30,
    act: 3,
    title: '출시일',
    description: `드디어... 출시일입니다.

버그가 조금 남아있습니다.
기능이 완벽하지 않습니다.
하지만... 이대로 출시할 수도 있습니다.`,
    choices: [
      {
        id: 'ship',
        text: '출시한다',
        type: 'neutral',
        impact: {
          visualDegradation: 0,
          progress: 100,
          quality: 0,
          energy: 0,
        },
      },
      {
        id: 'delay',
        text: '아직 부족해. 한 번만 더 다듬자',
        type: 'perfectionism',
        impact: {
          visualDegradation: 5,
          progress: -20,
          quality: 10,
          energy: -15,
        },
      },
    ],
  },
];
