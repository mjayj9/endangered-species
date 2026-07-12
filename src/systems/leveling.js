// ============================================================
// 레벨업 & 스탯 성장 시스템
//  - 경험치 획득 → 임계치 도달 시 레벨업, 직업/펫 성장 곡선에 따라 스탯 자동 상승.
//  - 레벨업 시 전회복 + 주인공은 스킬 포인트(SP) 지급(소비는 Phase 4).
//  - 펫도 각자 레벨/경험치를 가지며 전투 참여 시 성장.
// ============================================================

import { CLASSES } from '../data/classes.js';

export const LEVEL_CAP = 30;

// 다음 레벨까지 필요한 경험치
export function expToNext(level) {
    return Math.round(20 * Math.pow(level, 1.5)) + 30;
}

// 주인공 경험치 획득 → 레벨업 처리. 발생한 레벨업 메시지 배열 반환.
export function gainHeroExp(hero, amount) {
    const msgs = [];
    hero.exp += amount;

    while (hero.level < LEVEL_CAP && hero.exp >= expToNext(hero.level)) {
        hero.exp -= expToNext(hero.level);
        levelUpHero(hero, msgs);
    }
    if (hero.level >= LEVEL_CAP) hero.exp = 0; // 만렙이면 경험치 누적 중단
    return msgs;
}

function levelUpHero(hero, msgs) {
    hero.level++;
    const g = CLASSES[hero.heroKey].growth;
    hero.maxHp += g.hp; hero.maxMp += g.mp;
    hero.atk += g.atk; hero.def += g.def; hero.spd += g.spd;
    hero.hp = hero.maxHp; hero.mp = hero.maxMp; // 레벨업 시 전회복

    const sp = hero.level % 5 === 0 ? 2 : 1; // 5의 배수 레벨은 2점
    hero.sp = (hero.sp || 0) + sp;
    msgs.push(`${hero.name} 레벨 업! Lv.${hero.level} (SP +${sp})`);
}

// 펫 경험치 획득 → 레벨업 처리.
export function gainPetExp(pet, amount) {
    const msgs = [];
    pet.exp += amount;

    while (pet.level < LEVEL_CAP && pet.exp >= expToNext(pet.level)) {
        pet.exp -= expToNext(pet.level);
        pet.level++;
        const g = pet.growth;
        const s = pet.stats;
        s.maxHp += g.hp; s.maxMp += g.mp;
        s.atk += g.atk; s.def += g.def; s.spd += g.spd;
        s.hp = s.maxHp; s.mp = s.maxMp;
        msgs.push(`${pet.name} 레벨 업! Lv.${pet.level}`);
    }
    if (pet.level >= LEVEL_CAP) pet.exp = 0;
    return msgs;
}
