// ============================================================
// 통합 메뉴 UI (Phase 3: 캐릭터 / 장비 / 인벤토리)
//  - Tab 또는 HUD '메뉴' 버튼으로 열고 Esc/버튼으로 닫는다.
//  - 좌: 캐릭터 정보(레벨/경험치/SP/스탯) + 장비 3슬롯
//  - 우: 인벤토리 그리드(장비=장착, 소비=사용, 등급 색상)
//  - 스킬트리(SP 소비)는 Phase 4에서 추가.
// ============================================================

import { game } from '../core/game.js';
import { ITEMS, RARITY } from '../data/items.js';
import { effectiveStats, equipItem, unequipSlot, useConsumable } from '../systems/inventory.js';
import { expToNext, LEVEL_CAP } from '../systems/leveling.js';
import { playSound } from '../core/audio.js';
import { updateHud } from './hud.js';

const SLOT_LABEL = { weapon: '무기', armor: '방어구', accessory: '장신구' };
const SLOT_EMOJI = { weapon: '⚔️', armor: '🛡️', accessory: '💍' };

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
    const eff = effectiveStats(hero);
    const need = hero.level >= LEVEL_CAP ? 0 : expToNext(hero.level);
    const expPct = need ? Math.min(100, (hero.exp / need) * 100) : 100;

    // 장비 슬롯
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
            <div class="text-xs text-slate-600">비어 있음</div>
        </div>`;
    }).join('');

    // 인벤토리: 장비(가방) + 소비 아이템
    const bagCounts = {};
    game.bag.forEach((id) => { bagCounts[id] = (bagCounts[id] || 0) + 1; });
    const equipCells = Object.keys(bagCounts).map((id) => cell(id, bagCounts[id], 'equip')).join('');
    const consumeCells = Object.keys(game.inventory)
        .filter((id) => game.inventory[id] > 0)
        .map((id) => cell(id, game.inventory[id], 'use')).join('');
    const invHtml = (equipCells + consumeCells) ||
        '<div class="col-span-4 text-[11px] text-slate-500 text-center py-4">아이템이 없습니다.</div>';

    document.getElementById('menu-body').innerHTML = `
        <div class="grid md:grid-cols-2 gap-3">
            <!-- 캐릭터 정보 -->
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
            <!-- 인벤토리 -->
            <div class="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <div class="text-[10px] text-slate-500 mb-1.5">인벤토리 (장비 클릭=장착 · 소비 클릭=사용)</div>
                <div class="grid grid-cols-4 gap-1.5">${invHtml}</div>
                <div id="menu-note" class="text-[10px] text-emerald-300 mt-2 min-h-[14px]"></div>
            </div>
        </div>`;

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

// 인벤토리 셀 (등급 테두리 색)
function cell(id, count, action) {
    const it = ITEMS[id];
    const rc = RARITY[it.rarity].color;
    return `<button data-${action}="${id}" title="${it.name}: ${it.desc}"
        class="aspect-square bg-slate-800 hover:bg-slate-700 rounded-lg flex flex-col items-center justify-center relative"
        style="border:2px solid ${rc}">
        <span class="text-xl leading-none">${it.emoji}</span>
        <span class="text-[8px] text-slate-300 leading-tight mt-0.5 px-0.5 text-center truncate w-full">${it.name}</span>
        ${count > 1 ? `<span class="absolute -top-1 -right-1 bg-slate-950 text-[9px] text-white font-black rounded-full px-1 border border-slate-600">${count}</span>` : ''}
    </button>`;
}
