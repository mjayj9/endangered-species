// ============================================================
// 스킬트리 시스템 (Phase 4)
//  - SP를 소비해 노드(스킬)를 습득한다. 선행 노드가 모두 습득돼야 습득 가능.
//  - 액티브: 전투 '스킬' 커맨드 목록에 노출.  패시브: 상시 스탯 보너스 합산.
//  - 습득 정보는 hero.learnedSkills(배열)에 저장.
// ============================================================

import { SKILLS, CLASS_ROOT, classTreeNodes } from '../data/skills.js';

// 직업 트리 노드 목록
export function treeNodes(hero) {
    return classTreeNodes(hero.heroKey);
}

export function hasLearned(hero, nodeId) {
    return hero.learnedSkills.includes(nodeId);
}

// 습득 가능 여부: 미습득 + 선행 노드 충족 + SP 충분
export function canLearn(hero, nodeId) {
    const node = SKILLS[nodeId];
    if (!node || hasLearned(hero, nodeId)) return false;
    if ((hero.sp || 0) < node.cost) return false;
    return (node.requires || []).every((r) => hasLearned(hero, r));
}

// 노드 습득 (SP 소비). 성공 시 true.
export function learnNode(hero, nodeId) {
    if (!canLearn(hero, nodeId)) return false;
    hero.sp -= SKILLS[nodeId].cost;
    hero.learnedSkills.push(nodeId);
    return true;
}

// 시작 루트 스킬 자동 습득
export function grantRootSkill(hero) {
    const root = CLASS_ROOT[hero.heroKey];
    if (root && !hasLearned(hero, root)) hero.learnedSkills.push(root);
}

// 습득한 액티브 스킬 id 목록 (전투 스킬 커맨드용)
export function learnedActiveSkillIds(hero) {
    return hero.learnedSkills.filter((id) => SKILLS[id]?.type !== 'passive');
}

// 습득한 패시브 스탯 보너스 합산
export function passiveBonus(hero) {
    const b = { atk: 0, def: 0, spd: 0, maxHp: 0, maxMp: 0 };
    if (!hero || !hero.learnedSkills) return b;
    hero.learnedSkills.forEach((id) => {
        const node = SKILLS[id];
        if (node && node.type === 'passive' && node.bonus) {
            for (const k in node.bonus) b[k] = (b[k] || 0) + node.bonus[k];
        }
    });
    return b;
}
