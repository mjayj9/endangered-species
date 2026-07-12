// ============================================================
// 펫(구조 동물) 정의 — Phase 3: 레벨/경험치/성장 구조 포함
//  - 실제 덫 구출 → 펫 합류, 종별 스킬, 생태 정보는 Phase 4에서 확장한다.
//  - 각 펫은 고유 레벨/경험치를 가지며 전투 참여 시 경험치를 얻어 성장한다.
//  - createPet(id) 로 런타임 인스턴스(복제본)를 만든다.
// ============================================================

export const PETS = {
    moonbear: {
        id: 'moonbear',
        name: '반달가슴곰',
        emoji: '🐻',
        color: '#7c2d12',
        baseStats: { hp: 90, maxHp: 90, mp: 10, maxMp: 10, atk: 22, def: 8, spd: 5 },
        growth: { hp: 12, mp: 1, atk: 4, def: 3, spd: 1 },
        skill: 'pet_bite',
        eco: '천연기념물 제329호. 지리산 복원 사업으로 지켜지는 숲 생태의 핵심.',
    },
    finless: {
        id: 'finless',
        name: '상괭이',
        emoji: '🐬',
        color: '#38bdf8',
        baseStats: { hp: 70, maxHp: 70, mp: 10, maxMp: 10, atk: 18, def: 5, spd: 12 },
        growth: { hp: 8, mp: 1, atk: 3, def: 2, spd: 2 },
        skill: 'pet_bite',
        eco: "서해안의 '웃는 고래'. 혼획과 해양 오염으로 개체 수가 급감 중.",
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
        skill: base.skill,
        growth: { ...base.growth },
        level: 1,
        exp: 0,
        stats: { ...base.baseStats },
    };
}

// 시작 파티(활성 1 + 벤치 1)
export const STARTER_ACTIVE_PETS = ['moonbear'];
export const STARTER_BENCH_PETS = ['finless'];
