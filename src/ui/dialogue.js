// ============================================================
// 대화창 시스템 (Phase 5)
//  - 하단 고정 대화상자 + 초상화(이모지) + 타이핑 효과 + 분기 선택지.
//  - 스타일은 Phase 4.5 판타지 톤(#dialogue-box, .dlg-* CSS)과 통일.
//  - 클릭/스페이스/엔터로 진행(타이핑 중이면 즉시 완성), Esc로 닫기.
// ============================================================

import { game } from '../core/game.js';
import { playSound } from '../core/audio.js';
import { DIALOGUES } from '../data/dialogue.js';
import { acceptQuest, completeQuest } from '../systems/quests.js';
import { registerAnimal } from '../systems/encyclopedia.js';

let dlg = null;        // 현재 대화 { start, nodes }
let nodeId = null;     // 현재 노드 id
let full = '';         // 현재 노드 전체 텍스트
let shown = 0;         // 타이핑으로 노출된 글자 수
let typing = false;
let typer = null;      // 타이핑 인터벌
let onClose = null;    // 종료 콜백

// dlgOrId: 대화 객체 {start,nodes} 또는 DIALOGUES 의 id 문자열
export function startDialogue(dlgOrId, opts = {}) {
    dlg = typeof dlgOrId === 'string' ? DIALOGUES[dlgOrId] : dlgOrId;
    if (!dlg) return;
    onClose = opts.onClose || null;

    game.overlay = 'dialogue';
    document.getElementById('dialogue-box').classList.remove('hidden');
    playSound('jump');

    window.addEventListener('keydown', onKey);
    document.getElementById('dialogue-box').addEventListener('click', onClick);

    goNode(dlg.start);
}

export function isDialogueOpen() { return game.overlay === 'dialogue'; }

function goNode(id) {
    nodeId = id;
    const node = dlg.nodes[id];
    if (!node) return closeDialogue();

    runEffects(node.effect);

    document.getElementById('dlg-portrait').innerText = node.portrait || '💬';
    document.getElementById('dlg-speaker').innerText = node.speaker || '';
    document.getElementById('dlg-choices').innerHTML = '';
    document.getElementById('dlg-hint').classList.add('hidden');

    full = node.text || '';
    shown = 0;
    typing = true;
    const textEl = document.getElementById('dlg-text');
    textEl.innerText = '';

    clearInterval(typer);
    typer = setInterval(() => {
        shown++;
        textEl.innerText = full.slice(0, shown);
        if (shown >= full.length) finishTyping();
    }, 22);
}

function finishTyping() {
    clearInterval(typer);
    typing = false;
    document.getElementById('dlg-text').innerText = full;

    const node = dlg.nodes[nodeId];
    if (node.choices && node.choices.length) {
        renderChoices(node.choices);
    } else {
        document.getElementById('dlg-hint').classList.remove('hidden');
    }
}

function renderChoices(choices) {
    const box = document.getElementById('dlg-choices');
    box.innerHTML = '';
    choices.forEach((c) => {
        const b = document.createElement('button');
        b.className = 'rpg-btn dlg-choice';
        b.innerText = c.label;
        b.onclick = (e) => {
            e.stopPropagation();
            playSound('jump');
            runEffects(c.effect);
            if (c.next) goNode(c.next); else closeDialogue();
        };
        box.appendChild(b);
    });
}

// 진행 입력(클릭/스페이스/엔터)
function advance() {
    if (typing) { finishTyping(); return; }
    const node = dlg.nodes[nodeId];
    if (node.choices && node.choices.length) return; // 선택지는 버튼으로만
    if (node.end || !node.next) return closeDialogue();
    goNode(node.next);
}

function onKey(e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); advance(); }
    else if (e.code === 'Escape') { e.preventDefault(); closeDialogue(); }
}
function onClick(e) {
    if (e.target.closest('#dlg-choices')) return; // 선택지 버튼 클릭은 제외
    advance();
}

export function closeDialogue() {
    clearInterval(typer);
    typing = false;
    window.removeEventListener('keydown', onKey);
    const box = document.getElementById('dialogue-box');
    box.removeEventListener('click', onClick);
    box.classList.add('hidden');
    game.overlay = 'none';
    dlg = null; nodeId = null;
    const cb = onClose; onClose = null;
    if (cb) cb();
}

// 대사 효과 디스패치: 'flag.set:key' | 'quest.accept:id' | 'quest.complete:id' | 'encyclopedia.register:id'
function runEffects(effect) {
    if (!effect) return;
    const list = Array.isArray(effect) ? effect : [effect];
    list.forEach((eff) => {
        const [kind, arg] = eff.split(':');
        if (kind === 'flag.set') game.flags[arg] = true;
        else if (kind === 'quest.accept') acceptQuest(arg);
        else if (kind === 'quest.complete') { completeQuest(arg); playSound('correct'); }
        else if (kind === 'encyclopedia.register') registerAnimal(arg);
    });
}
