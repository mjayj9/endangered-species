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

    // ===== 2장: 사막 벌목기지 (Lv 4~6) =====
    cactus_golem: {
        id: 'cactus_golem', name: '선인장 골렘', emoji: '🌵', color: '#166534', level: 4,
        stats: { hp: 110, maxHp: 110, atk: 24, def: 8, spd: 4 }, exp: 34, gold: 40,
        drops: [{ itemId: 'iron_sword', chance: 0.18 }, { itemId: 'potion', chance: 0.4 }],
        desc: '벌목으로 메마른 땅에서 뒤틀려 태어난 가시 골렘.',
    },
    sand_digger: {
        id: 'sand_digger', name: '모래 굴착기', emoji: '⛏️', color: '#b45309', level: 5,
        stats: { hp: 130, maxHp: 130, atk: 28, def: 10, spd: 6 }, exp: 42, gold: 50,
        drops: [{ itemId: 'bark_mail', chance: 0.16 }, { itemId: 'hi_potion', chance: 0.25 }],
        desc: '숲의 뿌리째 파헤치는 무인 굴착 기계.',
    },
    timber_drone: {
        id: 'timber_drone', name: '벌목 드론', emoji: '🪚', color: '#ea580c', level: 6,
        stats: { hp: 100, maxHp: 100, atk: 32, def: 6, spd: 11 }, exp: 46, gold: 55,
        drops: [{ itemId: 'eco_charm', chance: 0.2 }, { itemId: 'spirit_ring', chance: 0.05 }],
        desc: '전기톱 날을 단 고속 벌목 드론.',
    },

    // ===== 3장: 설산 사냥기지 (Lv 8~11) =====
    ice_wolf: {
        id: 'ice_wolf', name: '얼음 늑대', emoji: '🐺', color: '#93c5fd', level: 8,
        stats: { hp: 190, maxHp: 190, atk: 40, def: 12, spd: 13 }, exp: 70, gold: 80,
        drops: [{ itemId: 'iron_sword', chance: 0.22 }, { itemId: 'bark_mail', chance: 0.2 }],
        desc: '밀렵꾼에게 길들여진 서리 늑대.',
    },
    snow_sniper: {
        id: 'snow_sniper', name: '설원 저격수', emoji: '🎯', color: '#64748b', level: 10,
        stats: { hp: 170, maxHp: 170, atk: 52, def: 10, spd: 15 }, exp: 82, gold: 95,
        drops: [{ itemId: 'spirit_ring', chance: 0.14 }, { itemId: 'hi_potion', chance: 0.3 }],
        desc: '눈보라 속에서 야생동물을 노리는 저격 사냥꾼.',
    },
    frost_turret: {
        id: 'frost_turret', name: '서리 포탑', emoji: '🧊', color: '#38bdf8', level: 11,
        stats: { hp: 240, maxHp: 240, atk: 46, def: 18, spd: 5 }, exp: 90, gold: 110,
        drops: [{ itemId: 'guardian_blade', chance: 0.1 }, { itemId: 'bark_mail', chance: 0.24 }],
        desc: '기지를 지키는 냉기 방어 포탑.',
    },

    // ===== 4장: 독늪 폐기기지 (Lv 12~16) =====
    toxic_frog: {
        id: 'toxic_frog', name: '독개구리', emoji: '🐸', color: '#65a30d', level: 12,
        stats: { hp: 280, maxHp: 280, atk: 60, def: 16, spd: 12 }, exp: 120, gold: 140,
        drops: [{ itemId: 'spirit_ring', chance: 0.2 }, { itemId: 'hi_potion', chance: 0.35 }],
        desc: '유독 폐수를 마시고 거대해진 개구리.',
    },
    waste_slime: {
        id: 'waste_slime', name: '폐기물 슬라임', emoji: '🛢️', color: '#4d7c0f', level: 14,
        stats: { hp: 340, maxHp: 340, atk: 66, def: 22, spd: 7 }, exp: 140, gold: 165,
        drops: [{ itemId: 'guardian_blade', chance: 0.16 }, { itemId: 'legend_amulet', chance: 0.03 }],
        desc: '산업 폐기물이 뭉쳐 굴러다니는 거대 오염체.',
    },
    gas_wraith: {
        id: 'gas_wraith', name: '유독 망령', emoji: '☠️', color: '#7e22ce', level: 16,
        stats: { hp: 300, maxHp: 300, atk: 74, def: 18, spd: 16 }, exp: 160, gold: 190,
        drops: [{ itemId: 'spirit_ring', chance: 0.22 }, { itemId: 'guardian_blade', chance: 0.14 }],
        desc: '유독 가스가 형체를 이룬 늪의 망령.',
    },

    // ===== 5장: 잿빛 컨소시엄 본거지 (Lv 18~24) =====
    ash_sentinel: {
        id: 'ash_sentinel', name: '잿빛 파수병', emoji: '🤖', color: '#475569', level: 18,
        stats: { hp: 430, maxHp: 430, atk: 88, def: 26, spd: 12 }, exp: 210, gold: 240,
        drops: [{ itemId: 'guardian_blade', chance: 0.2 }, { itemId: 'legend_amulet', chance: 0.07 }],
        desc: '본거지를 지키는 잿빛 로고의 강화 파수병.',
    },
    ash_drone: {
        id: 'ash_drone', name: '잿빛 드론', emoji: '🛰️', color: '#94a3b8', level: 20,
        stats: { hp: 380, maxHp: 380, atk: 100, def: 20, spd: 18 }, exp: 240, gold: 280,
        drops: [{ itemId: 'legend_amulet', chance: 0.1 }, { itemId: 'hi_potion', chance: 0.4 }],
        desc: '감시망을 형성하는 고속 정찰 드론.',
    },
    exec_guard: {
        id: 'exec_guard', name: '집행 경비대', emoji: '🦾', color: '#334155', level: 24,
        stats: { hp: 560, maxHp: 560, atk: 110, def: 34, spd: 14 }, exp: 300, gold: 330,
        drops: [{ itemId: 'legend_amulet', chance: 0.14 }, { itemId: 'guardian_blade', chance: 0.3 }],
        desc: '컨소시엄 이사회를 지키는 최정예 경비 병기.',
    },
};
