// ============================================================
// 인벤토리 & 장비 시스템
//  - 소비 아이템: game.inventory { itemId: 개수 } (스택)
//  - 장비: game.bag [itemId...] (미장착 보유), game.equipped { weapon, armor, accessory }
//  - 주인공 최종 스탯 = 성장 기본 스탯 + 장착 장비 보너스.
// ============================================================

import { game } from '../core/game.js';
import { ITEMS } from '../data/items.js';

const SLOTS = ['weapon', 'armor', 'accessory'];

// 장착 장비 보너스 합산
export function equipBonus() {
    const b = { atk: 0, def: 0, spd: 0, hp: 0, mp: 0 };
    for (const slot of SLOTS) {
        const id = game.equipped[slot];
        const item = id && ITEMS[id];
        if (item && item.bonus) {
            for (const k in item.bonus) b[k] = (b[k] || 0) + item.bonus[k];
        }
    }
    return b;
}

// 주인공 최종 스탯 (기본 성장치 + 장비 보너스)
export function effectiveStats(hero) {
    const b = equipBonus();
    return {
        maxHp: hero.maxHp + b.hp,
        maxMp: hero.maxMp + b.mp,
        atk: hero.atk + b.atk,
        def: hero.def + b.def,
        spd: hero.spd + b.spd,
    };
}

// 장비 장착 (같은 슬롯의 기존 장비는 가방으로 되돌림)
export function equipItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.category !== 'equipment') return false;
    const idx = game.bag.indexOf(itemId);
    if (idx < 0) return false;

    game.bag.splice(idx, 1);
    const prev = game.equipped[item.slot];
    if (prev) game.bag.push(prev);
    game.equipped[item.slot] = itemId;
    clampHeroVitals();
    return true;
}

// 장비 해제
export function unequipSlot(slot) {
    const id = game.equipped[slot];
    if (!id) return false;
    game.equipped[slot] = null;
    game.bag.push(id);
    clampHeroVitals();
    return true;
}

// 장비 변경 후 현재 HP/MP가 최대치를 넘지 않도록 보정
function clampHeroVitals() {
    const eff = effectiveStats(game.player);
    if (game.player.hp > eff.maxHp) game.player.hp = eff.maxHp;
    if (game.player.mp > eff.maxMp) game.player.mp = eff.maxMp;
}

// 아이템 획득 (장비는 가방, 소비는 스택)
export function addItem(itemId, qty = 1) {
    const item = ITEMS[itemId];
    if (!item) return;
    if (item.category === 'equipment') {
        for (let i = 0; i < qty; i++) game.bag.push(itemId);
    } else {
        game.inventory[itemId] = (game.inventory[itemId] || 0) + qty;
    }
}

// 소비 아이템을 필드에서 사용(주인공 대상). 성공 시 메시지 반환.
export function useConsumable(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.category !== 'consumable') return null;
    if ((game.inventory[itemId] || 0) <= 0) return null;

    const hero = game.player;
    const eff = effectiveStats(hero);
    if (item.kind === 'heal') {
        if (hero.hp >= eff.maxHp) return '이미 체력이 가득 찼습니다.';
        hero.hp = Math.min(eff.maxHp, hero.hp + item.power);
    } else if (item.kind === 'mp') {
        if (hero.mp >= eff.maxMp) return '이미 MP가 가득 찼습니다.';
        hero.mp = Math.min(eff.maxMp, hero.mp + item.power);
    }
    game.inventory[itemId]--;
    return `${item.name}을(를) 사용했다!`;
}
