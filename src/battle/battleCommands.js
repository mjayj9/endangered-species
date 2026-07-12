// ============================================================
// 전투 커맨드 처리 (공격/스킬/아이템/방어/도망)
//  - 데미지/회복 "계산과 적용"은 여기서 그대로 수행(로직 불변).
//  - 시각 연출은 B.reportHit / B.reportHeal / B.reportBuff 로 위임(battleFx).
//  - 교체(swap)는 파티 배열을 다루므로 battleScene 에서 처리.
// ============================================================

import { computeDamage, computeHeal } from './damageFormula.js';
import { ITEMS } from '../data/items.js';
import { game } from '../core/game.js';

// 큰 타격(대상 최대 HP의 30% 초과)을 치명타 스타일로 연출 (계산식은 변경 없음)
function isBig(target, dmg) {
    return dmg > target.maxHp * 0.3;
}

// 기본 공격 (무기 데미지 = power 100)
export function basicAttack(B, actor, target) {
    const dmg = computeDamage(actor, target, 100);
    target.takeDamage(dmg);
    B.reportHit(target, dmg, isBig(target, dmg));
    return `${actor.name}의 공격! ${target.name}에게 ${dmg} 피해`;
}

// 스킬 사용 (targets: 대상 배열)
export function useSkill(B, actor, skill, targets) {
    actor.spendMp(skill.mpCost);

    if (skill.type === 'attack') {
        targets.forEach((t) => {
            const dmg = computeDamage(actor, t, skill.power);
            t.takeDamage(dmg);
            B.reportHit(t, dmg, isBig(t, dmg));
        });
        return `${actor.name} - ${skill.name}!`;
    } else if (skill.type === 'heal') {
        targets.forEach((t) => {
            const h = computeHeal(actor, skill.power);
            t.heal(h);
            B.reportHeal(t, h);
        });
        return `${actor.name} - ${skill.name}! 아군 회복`;
    } else if (skill.type === 'buff') {
        actor.defending = true; // 철옹성: 방어 태세
        B.reportBuff(actor);
        return `${actor.name} - ${skill.name}! 방어 태세`;
    }
    return '';
}

// 아이템 사용
export function useItem(B, actor, itemId, target) {
    const item = ITEMS[itemId];
    if (game.inventory[itemId] > 0) game.inventory[itemId]--;

    if (item.kind === 'heal') {
        target.heal(item.power);
        B.reportHeal(target, item.power);
    } else if (item.kind === 'mp') {
        target.restoreMp(item.power);
        B.addFloater(target, `+${item.power} MP`, '#38bdf8');
    }
    return `${actor.name}이(가) ${item.name}을(를) 사용`;
}

// 방어 태세
export function defend(B, actor) {
    actor.defending = true;
    B.reportBuff(actor);
    return `${actor.name}이(가) 방어 태세를 취했다`;
}

// 도망 성공 여부 (일반 몬스터전 70%)
export function tryFlee() {
    return Math.random() < 0.7;
}
