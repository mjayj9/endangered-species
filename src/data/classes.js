// ============================================================
// 4직업(주인공) 기본 데이터
//  - 콘텐츠는 로직과 분리해 여기서만 관리한다.
//  - Phase 1에서는 색상 / 이모지 / 오버월드 이동속도 / 기본 스탯 필드까지만 사용.
//    (스킬트리 노드, 성장곡선 세부는 Phase 3~4에서 이 파일에 확장한다.)
// ============================================================

export const CLASSES = {
    leo: {
        key: 'leo',
        name: '레오',
        title: '호랑이 전사',
        emoji: '🐯',
        color: '#e11d48',          // 기존 프로젝트 색상 유지
        role: '근접 딜러',
        desc: '쫑긋 솟은 호랑이 귀 머리장식. 날카로운 단검을 휘두르는 근접 물리 딜러입니다.',
        moveSpeed: 5.2,            // 오버월드 이동 속도(px/frame)
        stats: { hp: 120, maxHp: 120, mp: 30, maxMp: 30, atk: 28, def: 6, spd: 9 },
    },
    aria: {
        key: 'aria',
        name: '아리아',
        title: '하늘다람쥐 마법사',
        emoji: '🐿️',
        color: '#0284c7',
        role: '원거리 딜러',
        desc: '귀여운 다람쥐 귀 장식. 도토리 마법봉으로 정화 마법을 연사하는 원거리 딜러입니다.',
        moveSpeed: 5.0,
        stats: { hp: 90, maxHp: 90, mp: 60, maxMp: 60, atk: 24, def: 4, spd: 11 },
    },
    taro: {
        key: 'taro',
        name: '토로',
        title: '거북이 탱커',
        emoji: '🐢',
        color: '#16a34a',
        role: '방어 탱커',
        desc: '초록 모자와 등껍질 장식. 든든한 수호 망치로 적을 막아서는 방어 탱커입니다.',
        moveSpeed: 4.4,
        stats: { hp: 160, maxHp: 160, mp: 25, maxMp: 25, atk: 20, def: 12, spd: 6 },
    },
    lumi: {
        key: 'lumi',
        name: '루미',
        title: '여우 사제 힐러',
        emoji: '🦊',
        color: '#db2777',
        role: '회복 힐러',
        desc: '긴 여우 귀와 꼬리 장식. 신성 구체로 아군을 치유하는 회복 사제입니다.',
        moveSpeed: 5.0,
        stats: { hp: 100, maxHp: 100, mp: 70, maxMp: 70, atk: 18, def: 5, spd: 8 },
    },
};

// 카드 렌더링 순서 고정용
export const CLASS_ORDER = ['leo', 'aria', 'taro', 'lumi'];
