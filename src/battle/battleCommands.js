// ============================================================
// 전투 커맨드 처리 (공격/스킬/아이템/방어/도망)
//  - 각 함수는 전투 컨텍스트 B 와 행동 주체/대상을 받아 효과를 적용하고
//    로그용 메시지 문자열을 반환한다. (턴 진행/사망 판정은 battleScene 이 담당)
//  - 교체(swap)는 파티 배열을 다루므로 battleScene 에서 처리.
// ============================================================

import { computeDamage, computeHeal } from './damageFormula.js';
import { ITEMS } from '../data/items.js';
import { game } from '../core/game.js';

// 기본 공격 (무기 데미지 = power 100)
export function basicAttack(B, actor, target) {
    const dmg = computeDamage(actor, target, 100);
    target.takeDamage(dmg);
    B.addFloater(target, `-${dmg}`, '#fca5a5');
    return `${actor.name}의 공격! ${target.name}에게 ${dmg} 피해`;
}

// 스킬 사용 (targets: 대상 배열)
export function useSkill(B, actor, skill, targets) {
    actor.spendMp(skill.mpCost);

    if (skill.type === 'attack') {
        targets.forEach((t) => {
            const dmg = computeDamage(actor, t, skill.power);
            t.takeDamage(dmg);
            B.addFloater(t, `-${dmg}`, '#fca5a5');
        });
        return `${actor.name} - ${skill.name}!`;
    } else if (skill.type === 'heal') {
        targets.forEach((t) => {
            const h = computeHeal(actor, skill.power);
            t.heal(h);
            B.addFloater(t, `+${h}`, '#34d399');
        });
        return `${actor.name} - ${skill.name}! 아군 회복`;
    } else if (skill.type === 'buff') {
        actor.defending = true; // 철옹성: 방어 태세
        B.addFloater(actor, '방어!', '#38bdf8');
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
        B.addFloater(target, `+${item.power}`, '#34d399');
    } else if (item.kind === 'mp') {
        target.restoreMp(item.power);
        B.addFloater(target, `+${item.power} MP`, '#38bdf8');
    }
    return `${actor.name}이(가) ${item.name}을(를) 사용`;
}

// 방어 태세
export function defend(B, actor) {
    actor.defending = true;
    B.addFloater(actor, '방어!', '#38bdf8');
    return `${actor.name}이(가) 방어 태세를 취했다`;
}

// 도망 성공 여부 (일반 몬스터전 70%)
export function tryFlee() {
    return Math.random() < 0.7;
}
