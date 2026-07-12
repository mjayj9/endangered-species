// ============================================================
// 일반 몬스터(생태 파괴단 부하) 정의
//  - 몬스터 1종 추가 = 이 객체에 항목 하나 추가.
//  - 오버월드 스프라이트 + 전투 스탯 + 처치 보상(exp/gold/drops).
//  - drops: [{ itemId, chance }] — 승리 시 chance 확률로 해당 아이템 획득.
// ============================================================

export const MONSTERS = {
    // 에메랄드 숲에 출몰하는 저레벨 오염 부하들
    sludge: {
        id: 'sludge',
        name: '오염 슬라임',
        emoji: '🟣',
        color: '#7c3aed',
        level: 1,
        stats: { hp: 40, maxHp: 40, atk: 10, def: 2, spd: 5 },
        exp: 8,
        gold: 12,
        drops: [{ itemId: 'potion', chance: 0.35 }, { itemId: 'eco_charm', chance: 0.05 }],
        desc: '버려진 폐수가 뭉쳐 태어난 끈적한 오염 덩어리.',
    },
    sawbot: {
        id: 'sawbot',
        name: '벌목 잔당 로봇',
        emoji: '🤖',
        color: '#f97316',
        level: 2,
        stats: { hp: 60, maxHp: 60, atk: 14, def: 4, spd: 6 },
        exp: 14,
        gold: 20,
        drops: [{ itemId: 'wood_dagger', chance: 0.2 }, { itemId: 'ether', chance: 0.3 }],
        desc: '숲을 베어내던 벌목기지에서 떨어져 나온 소형 작업 로봇.',
    },
    trapdrone: {
        id: 'trapdrone',
        name: '밀렵 정찰 드론',
        emoji: '🛸',
        color: '#38bdf8',
        level: 2,
        stats: { hp: 50, maxHp: 50, atk: 16, def: 3, spd: 9 },
        exp: 16,
        gold: 22,
        drops: [{ itemId: 'leaf_armor', chance: 0.2 }, { itemId: 'iron_sword', chance: 0.06 }],
        desc: '야생동물을 추적하려 숲을 떠도는 불법 사냥용 드론.',
    },
};
