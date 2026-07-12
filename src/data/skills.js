// ============================================================
// 스킬 정의 (Phase 2: 전투를 돌리기 위한 더미/임시 데이터)
//  - 실제 분기형 스킬트리와 스킬 습득 로직은 Phase 4에서 구현한다.
//  - target: 'enemy'(적 1) | 'enemyAll' | 'allyOne' | 'allyAll' | 'self'
//  - type:   'attack' | 'heal' | 'buff'
//  - power:  데미지/회복 배율(%) — 데미지 공식의 (스킬위력/100)에 사용.
// ============================================================

export const SKILLS = {
    // 레오 (호랑이 전사)
    leo_strike:  { id: 'leo_strike',  name: '강타',            type: 'attack', target: 'enemy',    power: 180, mpCost: 6,  desc: '단일 대상에게 강력한 일격.' },
    leo_whirl:   { id: 'leo_whirl',   name: '회전 칼날',        type: 'attack', target: 'enemyAll', power: 120, mpCost: 12, desc: '적 전체를 베는 사방 회전 공격.' },

    // 아리아 (하늘다람쥐 마법사)
    aria_leaf:   { id: 'aria_leaf',   name: '나뭇잎 정화탄',    type: 'attack', target: 'enemy',    power: 160, mpCost: 7,  desc: '정화의 나뭇잎을 쏘아 보낸다.' },
    aria_burst:  { id: 'aria_burst',  name: '바람의 원소 폭발', type: 'attack', target: 'enemyAll', power: 110, mpCost: 16, desc: '바람 원소로 적 전체를 강타.' },

    // 토로 (거북이 탱커)
    taro_slam:   { id: 'taro_slam',   name: '대지격파',        type: 'attack', target: 'enemy',    power: 150, mpCost: 8,  desc: '땅을 내리쳐 적을 가격.' },
    taro_guard:  { id: 'taro_guard',  name: '철옹성',          type: 'buff',   target: 'self',     power: 0,   mpCost: 5,  desc: '이번 턴 방어 태세로 피해를 크게 줄인다.' },

    // 루미 (여우 사제 힐러)
    lumi_orb:    { id: 'lumi_orb',    name: '영양 정화구',      type: 'heal',   target: 'allyOne',  power: 150, mpCost: 9,  desc: '아군 1명의 체력을 회복.' },
    lumi_group:  { id: 'lumi_group',  name: '단체 힐링',        type: 'heal',   target: 'allyAll',  power: 90,  mpCost: 20, desc: '아군 전체의 체력을 회복.' },

    // 펫 공용(임시)
    pet_bite:    { id: 'pet_bite',    name: '들이받기',        type: 'attack', target: 'enemy',    power: 140, mpCost: 0,  desc: '펫의 기본 공격기.' },
};

// 직업별 습득 스킬 목록 (Phase 4에서 스킬트리로 대체 예정)
export const CLASS_SKILLS = {
    leo:  ['leo_strike', 'leo_whirl'],
    aria: ['aria_leaf', 'aria_burst'],
    taro: ['taro_slam', 'taro_guard'],
    lumi: ['lumi_orb', 'lumi_group'],
};
