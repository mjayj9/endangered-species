// ============================================================
// 펫(구조 동물) 정의 — Phase 4: 종별 스킬 + 구조 동물 확장
//  - 각 펫은 고유 레벨/경험치/스킬을 가지며 전투 참여 시 성장한다.
//  - 필드의 덫에서 구출하면 보유 목록(game.pets)에 추가된다.
//  - eco: 실제 멸종위기 동물의 생태/멸종위기 정보(도감·구출 안내에 재사용).
//  - createPet(id) 로 런타임 인스턴스(복제본)를 만든다.
// ============================================================

export const PETS = {
    moonbear: {
        id: 'moonbear', name: '반달가슴곰', emoji: '🐻', color: '#7c2d12',
        baseStats: { hp: 90, maxHp: 90, mp: 10, maxMp: 10, atk: 22, def: 8, spd: 5 },
        growth: { hp: 12, mp: 1, atk: 4, def: 3, spd: 1 },
        skills: ['pet_bite', 'pet_maul'],
        eco: '천연기념물 제329호. 밀렵과 서식지 훼손으로 멸종위기에 빠졌으나 지리산 복원 사업으로 지켜지는 숲 생태의 핵심.',
    },
    finless: {
        id: 'finless', name: '상괭이', emoji: '🐬', color: '#38bdf8',
        baseStats: { hp: 70, maxHp: 70, mp: 10, maxMp: 10, atk: 18, def: 5, spd: 12 },
        growth: { hp: 8, mp: 1, atk: 3, def: 2, spd: 2 },
        skills: ['pet_bite', 'pet_splash'],
        eco: "서해안의 '웃는 고래' 해양보호생물. 불법 안강망 혼획과 폐어구·수질 오염으로 개체 수가 급감 중.",
    },
    eagle: {
        id: 'eagle', name: '독수리', emoji: '🦅', color: '#a16207',
        baseStats: { hp: 65, maxHp: 65, mp: 10, maxMp: 10, atk: 26, def: 4, spd: 14 },
        growth: { hp: 7, mp: 1, atk: 5, def: 1, spd: 2 },
        skills: ['pet_dive', 'pet_bite'],
        eco: '천연기념물 제243호. 하늘 생태계 최상위 포식자이자 자연의 청소부. 농약 2차 중독과 송전탑 충돌로 위협받는다.',
    },
    stork: {
        id: 'stork', name: '황새', emoji: '🦢', color: '#e2e8f0',
        baseStats: { hp: 80, maxHp: 80, mp: 20, maxMp: 20, atk: 16, def: 6, spd: 9 },
        growth: { hp: 9, mp: 2, atk: 3, def: 2, spd: 1 },
        skills: ['pet_heal', 'pet_bite'],
        eco: '멸종위기 야생생물 1급. 습지가 사라지며 먹이 터전을 잃었다. 습지 복원과 친환경 농법이 보호에 큰 힘이 된다.',
    },
};

// 전투/성장에 쓰는 런타임 펫 인스턴스 생성
export function createPet(id) {
    const base = PETS[id];
    return {
        id: base.id,
        name: base.name,
        emoji: base.emoji,
        color: base.color,
        skills: [...base.skills],
        eco: base.eco,
        growth: { ...base.growth },
        level: 1,
        exp: 0,
        active: false,       // 전투 출전 여부(파티 편성에서 지정)
        stats: { ...base.baseStats },
    };
}

// 시작 보유 펫 (반달가슴곰은 출전, 상괭이는 대기)
export const STARTER_PETS = [
    { id: 'moonbear', active: true },
    { id: 'finless', active: false },
];

// 전투 동시 출전 펫 최대 수(주인공 포함 시 3)
export const MAX_ACTIVE_PETS = 2;
