// ============================================================
// 통합 메뉴 UI (Phase 4: 탭 = 캐릭터·장비 / 스킬트리 / 동물 보호소)
//  - Tab 또는 HUD '메뉴' 버튼으로 열고 Esc/버튼으로 닫는다.
//  - 캐릭터·장비: 스탯/장비 3슬롯/인벤토리 그리드 (Phase 3)
//  - 스킬트리: SP로 노드 습득 (액티브=전투 스킬, 패시브=상시 보너스)
//  - 동물 보호소: 보유 펫 확인 + 출전 3마리(주인공 포함) 지정/교체
// ============================================================

import { game } from '../core/game.js';
import { ITEMS, RARITY } from '../data/items.js';
import { SKILLS } from '../data/skills.js';
import { MAX_ACTIVE_PETS, PETS } from '../data/pets.js';
import { isRegistered, allAnimalIds } from '../systems/encyclopedia.js';
import { effectiveStats, equipItem, unequipSlot, useConsumable } from '../systems/inventory.js';
import { expToNext, LEVEL_CAP } from '../systems/leveling.js';
import { treeNodes, hasLearned, canLearn, learnNode } from '../systems/skillTree.js';
import { playSound } from '../core/audio.js';
import { updateHud } from './hud.js';

const SLOT_LABEL = { weapon: '무기', armor: '방어구', accessory: '장신구' };
const SLOT_EMOJI = { weapon: '⚔️', armor: '🛡️', accessory: '💍' };

let activeTab = 'char'; // 'char' | 'skills' | 'party'

export function openMenu() {
    game.overlay = 'menu';
    document.getElementById('menu-overlay').classList.remove('hidden');
    playSound('correct');
    renderMenu();
}
export function closeMenu() {
    game.overlay = 'none';
    document.getElementById('menu-overlay').classList.add('hidden');
    playSound('jump');
}
export function toggleMenu() {
    if (game.overlay === 'menu') closeMenu();
    else if (game.overlay === 'none') openMenu();
}

function note(text) {
    const el = document.getElementById('menu-note');
    if (el) el.innerText = text;
}

function renderMenu() {
    const hero = game.player;
    if (!hero) return;

    const tabBtn = (id, label) =>
        `<button data-tab="${id}" class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${activeTab === id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">${label}</button>`;

    let body = '';
    if (activeTab === 'char') body = renderCharTab(hero);
    else if (activeTab === 'skills') body = renderSkillsTab(hero);
    else if (activeTab === 'party') body = renderPartyTab();
    else if (activeTab === 'codex') body = renderCodexTab();

    document.getElementById('menu-body').innerHTML = `
        <div class="flex flex-wrap gap-1.5 mb-3">
            ${tabBtn('char', '🛡️ 캐릭터·장비')}
            ${tabBtn('skills', '✨ 스킬트리')}
            ${tabBtn('party', '🐾 동물 보호소')}
            ${tabBtn('codex', '📖 도감')}
        </div>
        <div>${body}</div>
        <div id="menu-note" class="text-[11px] text-emerald-300 mt-2 min-h-[16px]"></div>`;

    wireTabs();
    if (activeTab === 'char') wireCharTab();
    else if (activeTab === 'skills') wireSkillsTab();
    else if (activeTab === 'party') wirePartyTab();
}

function wireTabs() {
    document.querySelectorAll('#menu-body [data-tab]').forEach((b) => {
        b.onclick = () => { activeTab = b.dataset.tab; playSound('jump'); renderMenu(); };
    });
}

// ---------------------------------------------------------------- 캐릭터·장비 탭
function renderCharTab(hero) {
    const eff = effectiveStats(hero);
    const need = hero.level >= LEVEL_CAP ? 0 : expToNext(hero.level);
    const expPct = need ? Math.min(100, (hero.exp / need) * 100) : 100;

    const slotsHtml = ['weapon', 'armor', 'accessory'].map((slot) => {
        const id = game.equipped[slot];
        if (id) {
            const it = ITEMS[id];
            return `<button data-unequip="${slot}" class="w-full text-left bg-slate-800 hover:bg-red-900/40 rounded-lg px-2 py-1.5 border border-slate-700">
                <div class="text-[9px] text-slate-500">${SLOT_EMOJI[slot]} ${SLOT_LABEL[slot]}</div>
                <div class="text-xs font-bold" style="color:${RARITY[it.rarity].color}">${it.emoji} ${it.name}</div>
                <div class="text-[9px] text-slate-500">클릭 시 해제</div>
            </button>`;
        }
        return `<div class="w-full bg-slate-900/60 rounded-lg px-2 py-1.5 border border-dashed border-slate-700">
            <div class="text-[9px] text-slate-500">${SLOT_EMOJI[slot]} ${SLOT_LABEL[slot]}</div>
            <div class="text-xs text-slate-600">비어 있음</div></div>`;
    }).join('');

    const bagCounts = {};
    game.bag.forEach((id) => { bagCounts[id] = (bagCounts[id] || 0) + 1; });
    const equipCells = Object.keys(bagCounts).map((id) => cell(id, bagCounts[id], 'equip')).join('');
    const consumeCells = Object.keys(game.inventory).filter((id) => game.inventory[id] > 0)
        .map((id) => cell(id, game.inventory[id], 'use')).join('');
    const invHtml = (equipCells + consumeCells) ||
        '<div class="col-span-4 text-[11px] text-slate-500 text-center py-4">아이템이 없습니다.</div>';

    return `<div class="grid md:grid-cols-2 gap-3">
        <div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-3xl">${hero.emoji}</span>
                <div>
                    <div class="font-black text-sm" style="color:${hero.color}">${hero.name} · Lv.${hero.level}</div>
                    <div class="text-[10px] text-slate-400">SP ${hero.sp || 0} · 골드 ${game.gold}G</div>
                </div>
            </div>
            <div class="text-[10px] text-slate-400 mb-0.5">EXP ${hero.exp}/${need || '—'}</div>
            <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div class="h-full bg-gradient-to-r from-emerald-400 to-green-500" style="width:${expPct}%"></div>
            </div>
            <div class="grid grid-cols-2 gap-1 text-[11px] text-slate-300 mb-3">
                <div>❤️ HP <b>${Math.round(hero.hp)}/${eff.maxHp}</b></div>
                <div>💧 MP <b>${Math.round(hero.mp)}/${eff.maxMp}</b></div>
                <div>⚔️ 공격 <b>${eff.atk}</b></div>
                <div>🛡️ 방어 <b>${eff.def}</b></div>
                <div>👟 스피드 <b>${eff.spd}</b></div>
            </div>
            <div class="text-[10px] text-slate-500 mb-1">장비</div>
            <div class="grid grid-cols-1 gap-1.5">${slotsHtml}</div>
        </div>
        <div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div class="text-[10px] text-slate-500 mb-1.5">인벤토리 (장비 클릭=장착 · 소비 클릭=사용)</div>
            <div class="grid grid-cols-4 gap-1.5">${invHtml}</div>
        </div>
    </div>`;
}

function wireCharTab() {
    const body = document.getElementById('menu-body');
    body.querySelectorAll('[data-unequip]').forEach((b) => {
        b.onclick = () => { unequipSlot(b.dataset.unequip); playSound('jump'); renderMenu(); updateHud(); };
    });
    body.querySelectorAll('[data-equip]').forEach((b) => {
        b.onclick = () => { equipItem(b.dataset.equip); playSound('correct'); renderMenu(); updateHud(); };
    });
    body.querySelectorAll('[data-use]').forEach((b) => {
        b.onclick = () => {
            const msg = useConsumable(b.dataset.use);
            playSound(msg && msg.includes('사용') ? 'heal' : 'wrong');
            renderMenu(); updateHud(); note(msg || '');
        };
    });
}

function cell(id, count, action) {
    const it = ITEMS[id];
    const rc = RARITY[it.rarity].color;
    return `<button data-${action}="${id}" title="${it.name}: ${it.desc}"
        class="aspect-square bg-slate-800 hover:bg-slate-700 rounded-lg flex flex-col items-center justify-center relative" style="border:2px solid ${rc}">
        <span class="text-xl leading-none">${it.emoji}</span>
        <span class="text-[8px] text-slate-300 leading-tight mt-0.5 px-0.5 text-center truncate w-full">${it.name}</span>
        ${count > 1 ? `<span class="absolute -top-1 -right-1 bg-slate-950 text-[9px] text-white font-black rounded-full px-1 border border-slate-600">${count}</span>` : ''}
    </button>`;
}

// ---------------------------------------------------------------- 스킬트리 탭
function renderSkillsTab(hero) {
    const nodes = treeNodes(hero);
    const maxTier = Math.max(...nodes.map((n) => n.tier));

    let rows = '';
    for (let tier = 1; tier <= maxTier; tier++) {
        const cells = [0, 1, 2].map((col) => {
            const node = nodes.find((n) => n.tier === tier && n.col === col);
            if (!node) return `<div></div>`;
            return skillNodeCell(hero, node);
        }).join('');
        rows += `<div class="grid grid-cols-3 gap-2 mb-2">${cells}</div>`;
    }

    return `<div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-black" style="color:${hero.color}">${hero.name} 스킬트리</div>
            <div class="text-[11px] text-emerald-300 font-bold">보유 SP <b class="text-sm">${hero.sp || 0}</b></div>
        </div>
        <div class="text-[10px] text-slate-500 mb-2">밝은 노드를 클릭하면 SP를 소비해 습득합니다. (⚡=액티브, 🛡️=패시브)</div>
        ${rows}
    </div>`;
}

function skillNodeCell(hero, node) {
    const learned = hasLearned(hero, node.id);
    const learnable = canLearn(hero, node.id);
    const icon = node.type === 'passive' ? '🛡️' : '⚡';

    let cls, sub;
    if (learned) { cls = 'border-emerald-400 bg-emerald-900/40'; sub = '<span class="text-emerald-300">습득함</span>'; }
    else if (learnable) { cls = 'border-yellow-400 bg-slate-800 hover:bg-slate-700 cursor-pointer'; sub = `<span class="text-yellow-300">습득 (SP ${node.cost})</span>`; }
    else { cls = 'border-slate-700 bg-slate-900/50 opacity-60'; sub = `<span class="text-slate-500">잠김 (SP ${node.cost})</span>`; }

    return `<button ${learnable ? `data-learn="${node.id}"` : 'disabled'} title="${node.desc}"
        class="text-left rounded-lg px-2 py-1.5 border-2 ${cls}">
        <div class="text-[11px] font-bold text-white leading-tight">${icon} ${node.name}</div>
        <div class="text-[9px] text-slate-400 leading-tight truncate">${node.desc}</div>
        <div class="text-[9px] mt-0.5">${sub}</div>
    </button>`;
}

function wireSkillsTab() {
    document.querySelectorAll('#menu-body [data-learn]').forEach((b) => {
        b.onclick = () => {
            const ok = learnNode(game.player, b.dataset.learn);
            if (ok) { playSound('skill'); note(`${SKILLS[b.dataset.learn].name} 습득!`); }
            renderMenu(); updateHud();
        };
    });
}

// ---------------------------------------------------------------- 동물 보호소 탭
function renderPartyTab() {
    const activeCount = game.pets.filter((p) => p.active).length;
    const hero = game.player;

    const heroCard = `<div class="bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-700">
        <div class="text-[9px] text-emerald-400 mb-1">파티 리더 (고정)</div>
        <div class="flex items-center gap-2">
            <span class="text-2xl">${hero.emoji}</span>
            <div><div class="text-xs font-bold" style="color:${hero.color}">${hero.name} · Lv.${hero.level}</div>
            <div class="text-[9px] text-slate-400">주인공은 항상 출전</div></div>
        </div></div>`;

    const petCards = game.pets.map((p, i) => {
        const s = p.stats;
        return `<div class="bg-slate-950/60 rounded-lg p-2.5 border ${p.active ? 'border-emerald-500' : 'border-slate-800'}">
            <div class="flex items-center gap-2 mb-1">
                <span class="text-2xl">${p.emoji}</span>
                <div class="min-w-0">
                    <div class="text-xs font-bold text-white">${p.name} · Lv.${p.level}</div>
                    <div class="text-[9px] text-slate-400">HP ${s.maxHp} · 공격 ${s.atk} · 방어 ${s.def} · 스피드 ${s.spd}</div>
                </div>
            </div>
            <div class="text-[9px] text-slate-500 mb-1.5 leading-tight">${p.eco || ''}</div>
            <button data-toggle="${i}" class="w-full ${p.active ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'} text-white text-[10px] font-extrabold py-1 rounded">
                ${p.active ? '출전 중 (클릭 해제)' : '출전시키기'}
            </button>
        </div>`;
    }).join('') || '<div class="col-span-2 text-[11px] text-slate-500 text-center py-4">보유한 펫이 없습니다. 필드의 덫에서 동물을 구출하세요!</div>';

    return `<div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-black text-emerald-300">동물 보호소 · 파티 편성</div>
            <div class="text-[11px] text-slate-400">출전 펫 <b class="text-emerald-300">${activeCount}/${MAX_ACTIVE_PETS}</b> (주인공 포함 최대 3)</div>
        </div>
        <div class="grid md:grid-cols-2 gap-2 mb-2">${heroCard}</div>
        <div class="grid md:grid-cols-2 gap-2">${petCards}</div>
    </div>`;
}

// ---------------------------------------------------------------- 도감 탭
function renderCodexTab() {
    const ids = allAnimalIds();
    const done = ids.filter((id) => isRegistered(id)).length;

    const cards = ids.map((id) => {
        const a = PETS[id];
        if (isRegistered(id)) {
            return `<div class="bg-slate-950/60 rounded-lg p-3 border border-emerald-700">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-3xl">${a.emoji}</span>
                    <div class="text-sm font-bold text-white">${a.name}</div>
                </div>
                <div class="text-[11px] text-slate-300 leading-relaxed">${a.eco}</div>
            </div>`;
        }
        return `<div class="bg-slate-900/50 rounded-lg p-3 border border-dashed border-slate-700 text-center">
            <div class="text-3xl mb-1 grayscale opacity-40">❔</div>
            <div class="text-xs text-slate-500">미발견</div>
            <div class="text-[10px] text-slate-600 mt-1">덫에서 동물을 구출하면 기록됩니다</div>
        </div>`;
    }).join('');

    return `<div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-black text-emerald-300">멸종위기 야생생물 도감</div>
            <div class="text-[11px] text-slate-400">등록 <b class="text-emerald-300">${done}/${ids.length}</b></div>
        </div>
        <div class="grid md:grid-cols-2 gap-2">${cards}</div>
    </div>`;
}

function wirePartyTab() {
    document.querySelectorAll('#menu-body [data-toggle]').forEach((b) => {
        b.onclick = () => {
            const pet = game.pets[+b.dataset.toggle];
            if (pet.active) { pet.active = false; playSound('jump'); }
            else {
                if (game.pets.filter((p) => p.active).length >= MAX_ACTIVE_PETS) {
                    playSound('wrong'); note(`출전은 최대 ${MAX_ACTIVE_PETS}마리까지 가능합니다.`); return;
                }
                pet.active = true; playSound('correct');
            }
            renderMenu();
        };
    });
}
