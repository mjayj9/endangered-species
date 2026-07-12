// ============================================================
// 소비 아이템 정의 (Phase 2: 전투 '아이템' 커맨드용 더미 데이터)
//  - 장비/등급/상점 등 완전한 인벤토리는 Phase 3에서 구현한다.
//  - kind: 'heal'(HP 회복) | 'mp'(MP 회복)
// ============================================================

export const ITEMS = {
    potion: { id: 'potion', name: '생태 과일즙', emoji: '🧪', kind: 'heal', power: 60, desc: '체력을 60 회복한다.' },
    ether:  { id: 'ether',  name: '맑은 이슬',   emoji: '💧', kind: 'mp',   power: 30, desc: 'MP를 30 회복한다.' },
};

// 전투 시작 시 지급되는 임시 시작 인벤토리 (Phase 3에서 실제 획득/구매로 대체)
export const STARTER_INVENTORY = { potion: 3, ether: 2 };
