// ============================================================
// 맵/지역 데이터
//  - 새 지역 추가 = 이 객체에 맵 하나 추가 (좌표/장식/충돌/몬스터 배치).
//  - Phase 1에서는 1장 "에메랄드 숲 평원"만 정의한다.
//    사막/설산/늪/최종장은 Phase 6에서 이 파일에 이어붙인다.
// ============================================================

export const MAPS = {
    emerald_forest: {
        id: 'emerald_forest',
        name: '에메랄드 푸른 숲 평원',
        theme: 'forest',
        width: 1800,
        height: 1200,
        ground: '#86efac',        // 잔디 기본색
        spawn: { x: 400, y: 320 }, // 플레이어 시작 위치

        // 정적 충돌 오브젝트 (아래 deco 좌표와 일치시켜 배치)
        obstacles: [
            { x: 400, y: 150, r: 24 },   // 주황 단풍나무
            { x: 600, y: 100, r: 22 },   // 분홍 벚꽃나무
            { x: 1200, y: 450, r: 26 },  // 전나무
            { x: 300, y: 600, r: 24 },   // 초록 나무
            { x: 1000, y: 250, r: 108 }, // 푸른 연못 호수
        ],

        // 장식 오브젝트 (렌더 전용, 충돌은 obstacles 로 별도 관리)
        deco: {
            trees: [
                { x: 400, y: 150, color: '#f97316' }, // 가을 단풍
                { x: 600, y: 100, color: '#fbcfe8' }, // 벚꽃
                { x: 1200, y: 450, color: '#047857' }, // 전나무
                { x: 300, y: 600, color: '#10b981' }, // 상록수
            ],
            pond: { x: 1000, y: 250, r: 110 },
            picnic: { x: 700, y: 400 },
            bench: { x: 200, y: 100 },
        },

        // 몬스터 배치 (data/monsters.js 의 id 참조)
        monsterSpawns: [
            { monsterId: 'sludge', x: 750, y: 520 },
            { monsterId: 'sawbot', x: 1250, y: 720 },
            { monsterId: 'trapdrone', x: 520, y: 820 },
            { monsterId: 'sludge', x: 1400, y: 320 },
        ],

        // NPC 배치 (허브 마을 — 시작 지점 근처)
        npcs: [
            { type: 'shop', name: '숲지기 상인', emoji: '🧑‍🌾', x: 250, y: 320 },
            { type: 'story', name: '마을 원로', emoji: '🧓', dialogueId: 'elder', x: 470, y: 240 },
            { type: 'story', name: '이나 박사', emoji: '👩‍🔬', dialogueId: 'doctor', x: 300, y: 430 },
            { type: 'quest', name: '마을 아이', emoji: '🧒', questId: 'collect_juice', x: 540, y: 360 },
            { type: 'quest', name: '숲 순찰대원', emoji: '💂', questId: 'hunt_sludge', x: 180, y: 450 },
            { type: 'quest', name: '수의사', emoji: '👩‍⚕️', questId: 'rescue_eagle', x: 600, y: 260 },
        ],

        // 보물상자 배치 (E로 열어 골드 + 아이템 획득)
        chests: [
            { x: 900, y: 200, gold: 40, loot: [{ itemId: 'hi_potion', chance: 0.6 }, { itemId: 'iron_sword', chance: 0.25 }] },
            { x: 1500, y: 900, gold: 60, loot: [{ itemId: 'bark_mail', chance: 0.5 }, { itemId: 'spirit_ring', chance: 0.12 }] },
        ],

        // 구조 덫 배치 (E로 갇힌 동물을 구출해 펫으로 합류)
        traps: [
            { animalId: 'eagle', x: 1350, y: 250, desc: '그물에 뒤엉킨 독수리가 날개를 다쳤습니다.' },
            { animalId: 'stork', x: 620, y: 950, desc: '오염된 늪가에서 황새가 지쳐 쓰러져 있습니다.' },
        ],

        // 던전/최종장 입구 포탈 (requires: 필요한 플래그가 모두 true 여야 개방)
        portals: [
            { to: 'desert_dungeon', name: '사막 벌목기지', emoji: '🚜', x: 1620, y: 1000, color: '#d97706' },
            { to: 'snow_dungeon', name: '설산 사냥기지', emoji: '🚁', x: 1620, y: 220, color: '#cbd5e1' },
            { to: 'swamp_dungeon', name: '독늪 폐기기지', emoji: '🚛', x: 260, y: 1000, color: '#a855f7' },
            { to: 'consortium_lair', name: '잿빛 컨소시엄 본거지', emoji: '🏢', x: 940, y: 1120, color: '#475569',
              requires: ['boss_bob', 'boss_jack', 'boss_dox'], lockedText: '세 지역보스(밥·잭·독스)를 모두 격파해야 열립니다.' },
        ],
    },

    // ===================== 던전: 사막 벌목기지 (보스 밥) =====================
    desert_dungeon: {
        id: 'desert_dungeon', name: '사막 벌목기지', theme: 'desert', dungeon: true,
        width: 2400, height: 640, ground: '#f59e0b', spawn: { x: 120, y: 320 },
        obstacles: [], deco: {},
        portals: [{ to: 'emerald_forest', name: '마을로 돌아가기', emoji: '🏘️', x: 70, y: 320, color: '#10b981', spawn: { x: 1620, y: 1000 } }],
        monsterSpawns: [
            { monsterId: 'cactus_golem', x: 520, y: 240 }, { monsterId: 'timber_drone', x: 640, y: 440 },
            { monsterId: 'sand_digger', x: 1160, y: 300 }, { monsterId: 'cactus_golem', x: 1300, y: 460 },
            { monsterId: 'timber_drone', x: 1760, y: 240 }, { monsterId: 'sand_digger', x: 1880, y: 420 },
        ],
        bossWallX: 2080,
        bossGate: { bossId: 'bob', x: 2260, y: 320 },
    },

    // ===================== 던전: 설산 사냥기지 (보스 잭) =====================
    snow_dungeon: {
        id: 'snow_dungeon', name: '설산 사냥기지', theme: 'snow', dungeon: true,
        width: 2400, height: 640, ground: '#e2e8f0', spawn: { x: 120, y: 320 },
        obstacles: [], deco: {},
        portals: [{ to: 'emerald_forest', name: '마을로 돌아가기', emoji: '🏘️', x: 70, y: 320, color: '#10b981', spawn: { x: 1620, y: 220 } }],
        monsterSpawns: [
            { monsterId: 'ice_wolf', x: 520, y: 240 }, { monsterId: 'snow_sniper', x: 660, y: 440 },
            { monsterId: 'frost_turret', x: 1160, y: 300 }, { monsterId: 'ice_wolf', x: 1300, y: 460 },
            { monsterId: 'snow_sniper', x: 1760, y: 240 }, { monsterId: 'frost_turret', x: 1880, y: 420 },
        ],
        bossWallX: 2080,
        bossGate: { bossId: 'jack', x: 2260, y: 320 },
    },

    // ===================== 던전: 독늪 폐기기지 (보스 독스) =====================
    swamp_dungeon: {
        id: 'swamp_dungeon', name: '독늪 폐기기지', theme: 'swamp', dungeon: true,
        width: 2400, height: 640, ground: '#581c87', spawn: { x: 120, y: 320 },
        obstacles: [], deco: {},
        portals: [{ to: 'emerald_forest', name: '마을로 돌아가기', emoji: '🏘️', x: 70, y: 320, color: '#10b981', spawn: { x: 260, y: 1000 } }],
        monsterSpawns: [
            { monsterId: 'toxic_frog', x: 520, y: 240 }, { monsterId: 'waste_slime', x: 660, y: 440 },
            { monsterId: 'gas_wraith', x: 1160, y: 300 }, { monsterId: 'toxic_frog', x: 1300, y: 460 },
            { monsterId: 'waste_slime', x: 1760, y: 240 }, { monsterId: 'gas_wraith', x: 1880, y: 420 },
        ],
        bossWallX: 2080,
        bossGate: { bossId: 'dox', x: 2260, y: 320 },
    },

    // ===================== 최종장: 잿빛 컨소시엄 본거지 (최종보스) =====================
    consortium_lair: {
        id: 'consortium_lair', name: '잿빛 컨소시엄 본거지', theme: 'ashen', dungeon: true,
        width: 2600, height: 640, ground: '#1e293b', spawn: { x: 120, y: 320 },
        obstacles: [], deco: {},
        portals: [{ to: 'emerald_forest', name: '마을로 돌아가기', emoji: '🏘️', x: 70, y: 320, color: '#10b981', spawn: { x: 940, y: 1120 } }],
        monsterSpawns: [
            { monsterId: 'ash_drone', x: 520, y: 240 }, { monsterId: 'ash_sentinel', x: 660, y: 440 },
            { monsterId: 'ash_sentinel', x: 1160, y: 300 }, { monsterId: 'ash_drone', x: 1300, y: 460 },
            { monsterId: 'exec_guard', x: 1780, y: 300 }, { monsterId: 'ash_sentinel', x: 1920, y: 460 },
        ],
        bossWallX: 2240,
        bossGate: { bossId: 'consortium', x: 2440, y: 320 },
    },
};

// Phase 1 시작 맵
export const START_MAP = 'emerald_forest';
