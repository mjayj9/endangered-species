// ============================================================
// 펫(구조 동물) 정의 — Phase 2: 파티/교체 커맨드를 시험하기 위한 더미 데이터
//  - 실제 덫 구출 → 펫 합류, 성장, 종별 스킬, 생태 정보는 Phase 4에서 구현한다.
//  - Phase 2에서는 파티가 여러 명일 때의 턴 순서/교체가 돌아가는지 확인하는 용도로만
//    임시 동료를 제공한다.
// ============================================================

export const DUMMY_PETS = [
    {
        id: 'moonbear',
        name: '반달가슴곰',
        emoji: '🐻',
        color: '#7c2d12',
        stats: { hp: 90, maxHp: 90, mp: 10, maxMp: 10, atk: 22, def: 8, spd: 5 },
        skill: 'pet_bite',
    },
    {
        id: 'finless',
        name: '상괭이',
        emoji: '🐬',
        color: '#38bdf8',
        stats: { hp: 70, maxHp: 70, mp: 10, maxMp: 10, atk: 18, def: 5, spd: 12 },
        skill: 'pet_bite',
    },
];
