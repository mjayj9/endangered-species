// ============================================================
// 스킬 정의 (Phase 4: 직업별 분기형 스킬트리)
//  - 각 노드는 액티브(전투 사용) 또는 패시브(상시 스탯 보너스)다.
//  - 트리 메타: class(직업), tier(행), col(열), cost(SP), requires(선행 노드).
//  - 액티브 필드: type 'attack'|'heal'|'buff', target, power(위력%), mpCost
//  - 패시브 필드: type 'passive', bonus { atk, def, spd, maxHp, maxMp }
//  스킬 1개 추가 = 이 객체에 노드 하나 추가.
// ============================================================

export const SKILLS = {
    // ======================= 레오 (호랑이 전사 · 근접딜/치명타) =======================
    leo_strike:  { id: 'leo_strike',  class: 'leo', name: '강타',        type: 'attack', target: 'enemy',    power: 180, mpCost: 6,  tier: 1, col: 1, cost: 1, requires: [], desc: '단일 대상에게 강력한 일격.' },
    leo_power:   { id: 'leo_power',   class: 'leo', name: '맹수의 힘',    type: 'passive', bonus: { atk: 6 },                     tier: 2, col: 0, cost: 1, requires: ['leo_strike'], desc: '공격력 +6 (상시)' },
    leo_combo:   { id: 'leo_combo',   class: 'leo', name: '연속 베기',    type: 'attack', target: 'enemy',    power: 150, mpCost: 10, tier: 2, col: 1, cost: 1, requires: ['leo_strike'], desc: '빠른 이단 베기.' },
    leo_muscle:  { id: 'leo_muscle',  class: 'leo', name: '단단한 근육',  type: 'passive', bonus: { maxHp: 30 },                  tier: 2, col: 2, cost: 1, requires: ['leo_strike'], desc: '최대 HP +30 (상시)' },
    leo_crit:    { id: 'leo_crit',    class: 'leo', name: '급소 노리기',  type: 'passive', bonus: { atk: 10 },                    tier: 3, col: 0, cost: 2, requires: ['leo_power'], desc: '공격력 +10 (상시)' },
    leo_whirl:   { id: 'leo_whirl',   class: 'leo', name: '사방 폭풍 회전 칼날', type: 'attack', target: 'enemyAll', power: 130, mpCost: 16, tier: 3, col: 1, cost: 2, requires: ['leo_combo'], desc: '적 전체를 베는 회전 공격.' },
    leo_swift:   { id: 'leo_swift',   class: 'leo', name: '민첩한 몸놀림', type: 'passive', bonus: { spd: 4 },                     tier: 3, col: 2, cost: 2, requires: ['leo_muscle'], desc: '스피드 +4 (상시)' },
    leo_berserk: { id: 'leo_berserk', class: 'leo', name: '광폭화',        type: 'passive', bonus: { atk: 18 },                    tier: 4, col: 0, cost: 3, requires: ['leo_crit'], desc: '공격력 +18 (상시)' },
    leo_execute: { id: 'leo_execute', class: 'leo', name: '처단',          type: 'attack', target: 'enemy',    power: 260, mpCost: 20, tier: 4, col: 1, cost: 3, requires: ['leo_whirl'], desc: '치명적인 마무리 일격.' },
    leo_rampage: { id: 'leo_rampage', class: 'leo', name: '폭주',          type: 'attack', target: 'enemyAll', power: 180, mpCost: 24, tier: 4, col: 2, cost: 3, requires: ['leo_swift'], desc: '적 전체에 강력한 난도질.' },

    // ======================= 아리아 (하늘다람쥐 마법사 · 마법딜/광역) =======================
    aria_leaf:   { id: 'aria_leaf',   class: 'aria', name: '나뭇잎 정화탄', type: 'attack', target: 'enemy',    power: 160, mpCost: 7,  tier: 1, col: 1, cost: 1, requires: [], desc: '정화의 나뭇잎을 쏘아 보낸다.' },
    aria_focus:  { id: 'aria_focus',  class: 'aria', name: '집중',          type: 'passive', bonus: { atk: 6 },                    tier: 2, col: 0, cost: 1, requires: ['aria_leaf'], desc: '공격력 +6 (상시)' },
    aria_multi:  { id: 'aria_multi',  class: 'aria', name: '다중 탄환',      type: 'attack', target: 'enemyAll', power: 90,  mpCost: 12, tier: 2, col: 1, cost: 1, requires: ['aria_leaf'], desc: '여러 탄환을 적 전체에 살포.' },
    aria_barrier:{ id: 'aria_barrier',class: 'aria', name: '마력 방벽',      type: 'passive', bonus: { def: 5 },                     tier: 2, col: 2, cost: 1, requires: ['aria_leaf'], desc: '방어 +5 (상시)' },
    aria_spark:  { id: 'aria_spark',  class: 'aria', name: '정령의 가호',    type: 'passive', bonus: { atk: 10 },                    tier: 3, col: 0, cost: 2, requires: ['aria_focus'], desc: '공격력 +10 (상시)' },
    aria_burst:  { id: 'aria_burst',  class: 'aria', name: '바람의 원소 폭발', type: 'attack', target: 'enemyAll', power: 130, mpCost: 16, tier: 3, col: 1, cost: 2, requires: ['aria_multi'], desc: '바람 원소로 적 전체를 강타.' },
    aria_wisdom: { id: 'aria_wisdom', class: 'aria', name: '마나 순환',      type: 'passive', bonus: { maxMp: 30 },                  tier: 3, col: 2, cost: 2, requires: ['aria_barrier'], desc: '최대 MP +30 (상시)' },
    aria_arcane: { id: 'aria_arcane', class: 'aria', name: '대마력',        type: 'passive', bonus: { atk: 15, maxMp: 20 },         tier: 4, col: 0, cost: 3, requires: ['aria_spark'], desc: '공격력 +15, 최대 MP +20 (상시)' },
    aria_meteor: { id: 'aria_meteor', class: 'aria', name: '자연의 분노',    type: 'attack', target: 'enemyAll', power: 200, mpCost: 30, tier: 4, col: 1, cost: 3, requires: ['aria_burst'], desc: '대자연의 힘으로 적 전체를 파괴.' },
    aria_snipe:  { id: 'aria_snipe',  class: 'aria', name: '정밀 저격',      type: 'attack', target: 'enemy',    power: 280, mpCost: 22, tier: 4, col: 2, cost: 3, requires: ['aria_wisdom'], desc: '단일 대상에 절대 마력탄.' },

    // ======================= 토로 (거북이 탱커 · 방어/CC) =======================
    taro_slam:   { id: 'taro_slam',   class: 'taro', name: '대지격파',      type: 'attack', target: 'enemy',    power: 150, mpCost: 8,  tier: 1, col: 1, cost: 1, requires: [], desc: '땅을 내리쳐 적을 가격.' },
    taro_hide:   { id: 'taro_hide',   class: 'taro', name: '두꺼운 등껍질',  type: 'passive', bonus: { def: 8 },                     tier: 2, col: 0, cost: 1, requires: ['taro_slam'], desc: '방어 +8 (상시)' },
    taro_taunt:  { id: 'taro_taunt',  class: 'taro', name: '도발',          type: 'buff',   target: 'self',     power: 0,   mpCost: 5,  tier: 2, col: 1, cost: 1, requires: ['taro_slam'], desc: '방어 태세로 이번 턴 피해를 줄인다.' },
    taro_vital:  { id: 'taro_vital',  class: 'taro', name: '강인한 체력',    type: 'passive', bonus: { maxHp: 50 },                  tier: 2, col: 2, cost: 1, requires: ['taro_slam'], desc: '최대 HP +50 (상시)' },
    taro_guard:  { id: 'taro_guard',  class: 'taro', name: '철옹성',        type: 'buff',   target: 'self',     power: 0,   mpCost: 8,  tier: 3, col: 0, cost: 2, requires: ['taro_hide'], desc: '견고한 방어 태세.' },
    taro_quake:  { id: 'taro_quake',  class: 'taro', name: '링 지진파',      type: 'attack', target: 'enemyAll', power: 120, mpCost: 14, tier: 3, col: 1, cost: 2, requires: ['taro_taunt'], desc: '땅을 뒤흔들어 적 전체를 가격.' },
    taro_endure: { id: 'taro_endure', class: 'taro', name: '불굴',          type: 'passive', bonus: { def: 12 },                    tier: 3, col: 2, cost: 2, requires: ['taro_vital'], desc: '방어 +12 (상시)' },
    taro_bulwark:{ id: 'taro_bulwark',class: 'taro', name: '반격 태세',      type: 'passive', bonus: { def: 10, spd: 2 },            tier: 4, col: 0, cost: 3, requires: ['taro_guard'], desc: '방어 +10, 스피드 +2 (상시)' },
    taro_smash:  { id: 'taro_smash',  class: 'taro', name: '파쇄 일격',      type: 'attack', target: 'enemy',    power: 230, mpCost: 16, tier: 4, col: 1, cost: 3, requires: ['taro_quake'], desc: '방패로 적을 짓뭉갠다.' },
    taro_fortress:{id: 'taro_fortress',class:'taro', name: '대지의 수호',    type: 'passive', bonus: { def: 15, maxHp: 40 },         tier: 4, col: 2, cost: 3, requires: ['taro_endure'], desc: '방어 +15, 최대 HP +40 (상시)' },

    // ======================= 루미 (여우 사제 힐러 · 회복/버프) =======================
    lumi_orb:    { id: 'lumi_orb',    class: 'lumi', name: '영양 정화구',    type: 'heal',   target: 'allyOne',  power: 150, mpCost: 9,  tier: 1, col: 1, cost: 1, requires: [], desc: '아군 1명의 체력을 회복.' },
    lumi_bless:  { id: 'lumi_bless',  class: 'lumi', name: '축복',          type: 'passive', bonus: { maxMp: 25 },                  tier: 2, col: 0, cost: 1, requires: ['lumi_orb'], desc: '최대 MP +25 (상시)' },
    lumi_mend:   { id: 'lumi_mend',   class: 'lumi', name: '치유의 손길',    type: 'heal',   target: 'allyOne',  power: 220, mpCost: 12, tier: 2, col: 1, cost: 1, requires: ['lumi_orb'], desc: '아군 1명을 크게 회복.' },
    lumi_smite:  { id: 'lumi_smite',  class: 'lumi', name: '심판의 빛',      type: 'attack', target: 'enemy',    power: 150, mpCost: 10, tier: 2, col: 2, cost: 1, requires: ['lumi_orb'], desc: '신성한 빛으로 적을 태운다.' },
    lumi_ward:   { id: 'lumi_ward',   class: 'lumi', name: '수호의 기도',    type: 'passive', bonus: { def: 6 },                     tier: 3, col: 0, cost: 2, requires: ['lumi_bless'], desc: '방어 +6 (상시)' },
    lumi_group:  { id: 'lumi_group',  class: 'lumi', name: '단체 힐링',      type: 'heal',   target: 'allyAll',  power: 100, mpCost: 20, tier: 3, col: 1, cost: 2, requires: ['lumi_mend'], desc: '아군 전체의 체력을 회복.' },
    lumi_grace:  { id: 'lumi_grace',  class: 'lumi', name: '신속한 회복',    type: 'passive', bonus: { spd: 5 },                     tier: 3, col: 2, cost: 2, requires: ['lumi_smite'], desc: '스피드 +5 (상시)' },
    lumi_sanct:  { id: 'lumi_sanct',  class: 'lumi', name: '성역',          type: 'passive', bonus: { maxHp: 50, def: 8 },          tier: 4, col: 0, cost: 3, requires: ['lumi_ward'], desc: '최대 HP +50, 방어 +8 (상시)' },
    lumi_miracle:{ id: 'lumi_miracle',class: 'lumi', name: '소생의 기적',    type: 'heal',   target: 'allyAll',  power: 180, mpCost: 30, tier: 4, col: 1, cost: 3, requires: ['lumi_group'], desc: '아군 전체를 크게 회복.' },
    lumi_wisdom: { id: 'lumi_wisdom', class: 'lumi', name: '지혜',          type: 'passive', bonus: { atk: 10, maxMp: 20 },         tier: 4, col: 2, cost: 3, requires: ['lumi_grace'], desc: '공격력 +10, 최대 MP +20 (상시)' },

    // ======================= 펫 전용 스킬 =======================
    pet_bite:   { id: 'pet_bite',   name: '들이받기',    type: 'attack', target: 'enemy',    power: 140, mpCost: 0, desc: '펫의 기본 공격.' },
    pet_maul:   { id: 'pet_maul',   name: '곰의 발톱',    type: 'attack', target: 'enemy',    power: 190, mpCost: 0, desc: '강력한 곰 발톱 공격.' },
    pet_splash: { id: 'pet_splash', name: '물보라',      type: 'attack', target: 'enemyAll', power: 90,  mpCost: 0, desc: '물보라로 적 전체를 친다.' },
    pet_dive:   { id: 'pet_dive',   name: '급강하',      type: 'attack', target: 'enemy',    power: 170, mpCost: 0, desc: '하늘에서 내리꽂는 일격.' },
    pet_heal:   { id: 'pet_heal',   name: '치유의 노래',  type: 'heal',   target: 'allyOne',  power: 110, mpCost: 0, desc: '아군 1명을 회복한다.' },
};

// 직업별 시작(자동 습득) 루트 스킬
export const CLASS_ROOT = { leo: 'leo_strike', aria: 'aria_leaf', taro: 'taro_slam', lumi: 'lumi_orb' };

// 직업별 트리 노드 id 목록
export function classTreeNodes(classKey) {
    return Object.values(SKILLS).filter((s) => s.class === classKey);
}
