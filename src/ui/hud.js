// ============================================================
// 상단 HUD 갱신 (골드 / HP / 현재 구역)
// ============================================================

import { game } from '../core/game.js';

export function updateHud() {
    const goldEl = document.getElementById('ui-gold');
    const hpText = document.getElementById('ui-hp');
    const hpBar = document.getElementById('ui-hp-bar');
    const zoneEl = document.getElementById('ui-zone');

    if (goldEl) goldEl.innerText = game.gold;

    const p = game.player;
    if (p && hpText && hpBar) {
        hpText.innerText = `${Math.max(0, Math.round(p.hp))}/${p.maxHp}`;
        hpBar.style.width = `${Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100))}%`;
    }

    if (zoneEl && game.map) zoneEl.innerText = game.map.name;
}
