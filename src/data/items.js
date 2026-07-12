// ============================================================
// 아이템 정의 (Phase 3: 소비 아이템 + 장비, 등급 체계 포함)
//  - category: 'consumable' | 'equipment'
//  - 소비: kind 'heal'|'mp', power(회복량)
//  - 장비: slot 'weapon'|'armor'|'accessory', bonus(스탯 보너스)
//  - rarity: 등급(common/rare/epic/legendary) — 색상 표시에 사용
//  - price: 상점 구매가(골드)
//  아이템 1종 추가 = 이 객체에 항목 하나 추가.
// ============================================================

export const RARITY = {
    common:    { key: 'common',    name: '일반', color: '#9ca3af' }, // 회색
    rare:      { key: 'rare',      name: '희귀', color: '#3b82f6' }, // 파랑
    epic:      { key: 'epic',      name: '영웅', color: '#a855f7' }, // 보라
    legendary: { key: 'legendary', name: '전설', color: '#f59e0b' }, // 금색
};

export const ITEMS = {
    // ---- 소비 아이템 ----
    potion:    { id: 'potion',    name: '생태 과일즙', emoji: '🧪', category: 'consumable', kind: 'heal', power: 60,  rarity: 'common', price: 40,  desc: '체력을 60 회복한다.' },
    ether:     { id: 'ether',     name: '맑은 이슬',   emoji: '💧', category: 'consumable', kind: 'mp',   power: 30,  rarity: 'common', price: 35,  desc: 'MP를 30 회복한다.' },
    hi_potion: { id: 'hi_potion', name: '생명의 수액', emoji: '🍯', category: 'consumable', kind: 'heal', power: 150, rarity: 'rare',   price: 120, desc: '체력을 150 회복한다.' },

    // ---- 장비: 무기 ----
    wood_dagger:    { id: 'wood_dagger',    name: '나무 단검',     emoji: '🗡️', category: 'equipment', slot: 'weapon',    rarity: 'common',    bonus: { atk: 6 },                    price: 80,   desc: '공격력 +6' },
    iron_sword:     { id: 'iron_sword',     name: '무쇠 검',       emoji: '⚔️', category: 'equipment', slot: 'weapon',    rarity: 'rare',      bonus: { atk: 14 },                   price: 220,  desc: '공격력 +14' },
    guardian_blade: { id: 'guardian_blade', name: '수호자의 검',   emoji: '🌟', category: 'equipment', slot: 'weapon',    rarity: 'epic',      bonus: { atk: 24, spd: 3 },           price: 520,  desc: '공격력 +24, 스피드 +3' },

    // ---- 장비: 방어구 ----
    leaf_armor:     { id: 'leaf_armor',     name: '잎사귀 갑옷',   emoji: '🥋', category: 'equipment', slot: 'armor',     rarity: 'common',    bonus: { def: 5, hp: 15 },            price: 90,   desc: '방어 +5, HP +15' },
    bark_mail:      { id: 'bark_mail',      name: '나무껍질 갑주', emoji: '🛡️', category: 'equipment', slot: 'armor',     rarity: 'rare',      bonus: { def: 12, hp: 40 },           price: 240,  desc: '방어 +12, HP +40' },

    // ---- 장비: 장신구 ----
    eco_charm:      { id: 'eco_charm',      name: '에코 부적',     emoji: '🍀', category: 'equipment', slot: 'accessory', rarity: 'common',    bonus: { spd: 2, mp: 10 },            price: 70,   desc: '스피드 +2, MP +10' },
    spirit_ring:    { id: 'spirit_ring',    name: '정령의 반지',   emoji: '💍', category: 'equipment', slot: 'accessory', rarity: 'epic',      bonus: { atk: 8, def: 8, mp: 20 },    price: 480,  desc: '공격 +8, 방어 +8, MP +20' },
    legend_amulet:  { id: 'legend_amulet',  name: '수호신의 목걸이', emoji: '📿', category: 'equipment', slot: 'accessory', rarity: 'legendary', bonus: { atk: 15, def: 15, hp: 60, spd: 5 }, price: 1200, desc: '공격/방어 +15, HP +60, 스피드 +5' },
};

// 시작 시 지급 (소비 아이템 수량)
export const STARTER_INVENTORY = { potion: 3, ether: 2 };
// 시작 시 가방에 든 장비(미장착 상태)
export const STARTER_EQUIPMENT = ['wood_dagger', 'leaf_armor'];

// 상점 판매 목록
export const SHOP_STOCK = [
    'potion', 'ether', 'hi_potion',
    'wood_dagger', 'iron_sword', 'guardian_blade',
    'leaf_armor', 'bark_mail',
    'eco_charm', 'spirit_ring',
];

// 판매(되팔기) 가격 비율
export const SELL_RATIO = 0.5;
