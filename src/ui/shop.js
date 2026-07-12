// ============================================================
// 상점 UI (Phase 3)
//  - 상인 NPC와 상호작용하면 열린다. 골드로 장비/소비 아이템 구매.
//  - 보유 장비는 되팔기도 가능(SELL_RATIO).
// ============================================================

import { game } from '../core/game.js';
import { ITEMS, RARITY, SHOP_STOCK, SELL_RATIO } from '../data/items.js';
import { addItem } from '../systems/inventory.js';
import { playSound } from '../core/audio.js';
import { updateHud } from './hud.js';

export function openShop() {
    game.overlay = 'shop';
    document.getElementById('shop-overlay').classList.remove('hidden');
    playSound('correct');
    renderShop();
}

export function closeShop() {
    game.overlay = 'none';
    document.getElementById('shop-overlay').classList.add('hidden');
    playSound('jump');
}

function buy(itemId) {
    const item = ITEMS[itemId];
    if (game.gold < item.price) { playSound('wrong'); flash('골드가 부족합니다!'); return; }
    game.gold -= item.price;
    addItem(itemId, 1);
    playSound('correct');
    flash(`${item.name} 구매!`);
    renderShop();
    updateHud();
}

function sell(itemId) {
    const idx = game.bag.indexOf(itemId);
    if (idx < 0) return;
    game.bag.splice(idx, 1);
    const gain = Math.round(ITEMS[itemId].price * SELL_RATIO);
    game.gold += gain;
    playSound('correct');
    flash(`${ITEMS[itemId].name} 판매 (+${gain}G)`);
    renderShop();
    updateHud();
}

function flash(text) {
    const el = document.getElementById('shop-flash');
    if (el) el.innerText = text;
}

function renderShop() {
    const root = document.getElementById('shop-body');
    document.getElementById('shop-gold').innerText = game.gold;

    // 판매 목록
    const buyRows = SHOP_STOCK.map((id) => {
        const it = ITEMS[id];
        const rc = RARITY[it.rarity].color;
        const afford = game.gold >= it.price;
        return `<div class="flex items-center justify-between bg-slate-800/70 rounded-lg px-2.5 py-1.5 gap-2">
            <div class="min-w-0">
                <div class="text-xs font-bold" style="color:${rc}">${it.emoji} ${it.name}
                    <span class="text-[9px] text-slate-500">[${RARITY[it.rarity].name}]</span></div>
                <div class="text-[10px] text-slate-400 truncate">${it.desc}</div>
            </div>
            <button data-buy="${id}" class="shrink-0 ${afford ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-500 cursor-not-allowed'} font-black text-[11px] px-2.5 py-1 rounded">${it.price}G</button>
        </div>`;
    }).join('');

    // 보유 장비 되팔기
    const bagCounts = {};
    game.bag.forEach((id) => { bagCounts[id] = (bagCounts[id] || 0) + 1; });
    const sellRows = Object.keys(bagCounts).map((id) => {
        const it = ITEMS[id];
        const rc = RARITY[it.rarity].color;
        const gain = Math.round(it.price * SELL_RATIO);
        return `<div class="flex items-center justify-between bg-slate-800/70 rounded-lg px-2.5 py-1.5 gap-2">
            <div class="text-xs font-bold" style="color:${rc}">${it.emoji} ${it.name} <span class="text-[10px] text-slate-500">x${bagCounts[id]}</span></div>
            <button data-sell="${id}" class="shrink-0 bg-slate-600 hover:bg-slate-500 text-white font-black text-[11px] px-2.5 py-1 rounded">팔기 ${gain}G</button>
        </div>`;
    }).join('') || '<div class="text-[11px] text-slate-500 text-center py-2">되팔 장비가 없습니다.</div>';

    root.innerHTML = `
        <div class="grid md:grid-cols-2 gap-3">
            <div>
                <h4 class="text-emerald-300 font-extrabold text-xs mb-1.5">🛒 구매</h4>
                <div class="flex flex-col gap-1.5">${buyRows}</div>
            </div>
            <div>
                <h4 class="text-sky-300 font-extrabold text-xs mb-1.5">💰 되팔기</h4>
                <div class="flex flex-col gap-1.5">${sellRows}</div>
            </div>
        </div>`;

    root.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => buy(b.dataset.buy); });
    root.querySelectorAll('[data-sell]').forEach((b) => { b.onclick = () => sell(b.dataset.sell); });
}
