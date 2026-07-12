// ============================================================
// 도감(Encyclopedia) 시스템 (Phase 5)
//  - 동물을 구출하면 생태 정보가 자동 등록된다(구출 대화 마지막에 알림).
//  - 등록 현황은 game.encyclopedia 에 동물 id 로 보관(Phase 6 저장 연동).
// ============================================================

import { game } from '../core/game.js';
import { PETS } from '../data/pets.js';

export function registerAnimal(id) {
    if (!PETS[id]) return false;
    if (game.encyclopedia.includes(id)) return false;
    game.encyclopedia.push(id);
    return true;
}

export function isRegistered(id) {
    return game.encyclopedia.includes(id);
}

export function allAnimalIds() {
    return Object.keys(PETS);
}

export function registeredCount() {
    return game.encyclopedia.length;
}
