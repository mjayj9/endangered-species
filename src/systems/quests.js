// ============================================================
// 퀘스트 시스템 (Phase 5)
//  - 상태(game.quests)와 진행 수치(game.questProgress)를 메모리로 관리.
//    (localStorage 저장은 Phase 6에서 이 구조를 그대로 직렬화한다.)
//  - 퀘스트 NPC와 대화 시 상태에 맞는 대화 트리를 동적으로 생성한다.
// ============================================================

import { game } from '../core/game.js';
import { QUESTS } from '../data/quests.js';
import { ITEMS } from '../data/items.js';
import { addItem } from './inventory.js';
import { gainHeroExp } from './leveling.js';

export function questState(id) { return game.quests[id] || 'inactive'; }

export function acceptQuest(id) {
    game.quests[id] = 'active';
    if (QUESTS[id].type === 'kill') game.questProgress[id] = 0;
}

// 처치 카운트 기록 (전투 승리 시 호출)
export function recordKill(monsterId) {
    Object.values(QUESTS).forEach((q) => {
        if (q.type === 'kill' && questState(q.id) === 'active' && q.target.monsterId === monsterId) {
            game.questProgress[q.id] = (game.questProgress[q.id] || 0) + 1;
        }
    });
}

// 목표 달성 여부
export function isReady(id) {
    const q = QUESTS[id];
    if (q.type === 'collect') return countItem(q.target.itemId) >= q.target.count;
    if (q.type === 'kill') return (game.questProgress[id] || 0) >= q.target.count;
    if (q.type === 'rescue') return game.encyclopedia.includes(q.target.animalId);
    return false;
}

export function progressLabel(id) {
    const q = QUESTS[id];
    if (q.type === 'collect') return `${countItem(q.target.itemId)}/${q.target.count} (${ITEMS[q.target.itemId].name})`;
    if (q.type === 'kill') return `${Math.min(game.questProgress[id] || 0, q.target.count)}/${q.target.count} 처치`;
    if (q.type === 'rescue') return isReady(id) ? '구출 완료' : '미구출';
    return '';
}

function countItem(itemId) { return game.inventory[itemId] || 0; }

export function completeQuest(id) {
    const q = QUESTS[id];
    if (q.type === 'collect') {
        game.inventory[q.target.itemId] = Math.max(0, (game.inventory[q.target.itemId] || 0) - q.target.count);
    }
    game.quests[id] = 'complete';

    const r = q.reward || {};
    if (r.gold) game.gold += r.gold;
    if (r.exp) gainHeroExp(game.player, r.exp);
    if (r.item) addItem(r.item, 1);
}

function rewardText(id) {
    const r = QUESTS[id].reward || {};
    const parts = [];
    if (r.exp) parts.push(`경험치 +${r.exp}`);
    if (r.gold) parts.push(`골드 +${r.gold}`);
    if (r.item) parts.push(`${ITEMS[r.item].name}`);
    return parts.join(', ');
}

// 현재 상태에 맞는 대화 트리 {start, nodes} 생성
export function buildQuestDialogue(id) {
    const q = QUESTS[id];
    const p = q.portrait;
    const speaker = q.giver;
    const state = questState(id);

    if (state === 'complete') {
        return { start: 'n', nodes: { n: { speaker, portrait: p, text: q.lines.done, end: true } } };
    }

    if (state === 'active') {
        if (isReady(id)) {
            return {
                start: 'ready',
                nodes: {
                    ready: {
                        speaker, portrait: p, text: q.lines.ready,
                        choices: [{ label: '완료하기', next: 'reward', effect: `quest.complete:${id}` }],
                    },
                    reward: { speaker, portrait: p, text: `[퀘스트 완료] 보상: ${rewardText(id)}`, end: true },
                },
            };
        }
        return {
            start: 'n',
            nodes: { n: { speaker, portrait: p, text: `${q.lines.active}\n(진행: ${progressLabel(id)})`, end: true } },
        };
    }

    // inactive → 제안
    return {
        start: 'offer',
        nodes: {
            offer: {
                speaker, portrait: p, text: q.lines.offer,
                choices: [
                    { label: '수락한다', next: 'accepted', effect: `quest.accept:${id}` },
                    { label: '다음에요', next: 'decline' },
                ],
            },
            accepted: { speaker, portrait: p, text: '고마워요! 잘 부탁해요.', end: true },
            decline: { speaker, portrait: p, text: '음… 마음이 바뀌면 언제든 말해요.', end: true },
        },
    };
}
